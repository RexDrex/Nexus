import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, lat, lon, includeTraffic, includeWeather, includeIncidents } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENWEATHERMAP_API_KEY = Deno.env.get('OPENWEATHERMAP_API_KEY');
    const TOMTOM_API_KEY = Deno.env.get('TOMTOM_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const latitude = lat || 6.5244;
    const longitude = lon || 3.3792;

    // Gather real-time context in parallel
    const contextPromises: Promise<any>[] = [];

    // Fetch weather data
    if (includeWeather !== false && OPENWEATHERMAP_API_KEY) {
      contextPromises.push(
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`)
          .then(r => r.json())
          .catch(() => null)
      );
    } else {
      contextPromises.push(Promise.resolve(null));
    }

    // Fetch traffic data
    if (includeTraffic !== false && TOMTOM_API_KEY) {
      contextPromises.push(
        fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${latitude},${longitude}&key=${TOMTOM_API_KEY}`)
          .then(r => r.json())
          .catch(() => null)
      );
    } else {
      contextPromises.push(Promise.resolve(null));
    }

    // Fetch recent incidents from database
    if (includeIncidents !== false && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      contextPromises.push(
        (async () => {
          const { data } = await supabase
            .from('incidents')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(10);
          return data || [];
        })()
      );
    } else {
      contextPromises.push(Promise.resolve([]));
    }

    const [weatherData, trafficData, incidentsData] = await Promise.all(contextPromises);

    // Build context for AI
    const context = {
      timestamp: new Date().toISOString(),
      location: { lat: latitude, lon: longitude },
      weather: weatherData ? {
        temp: weatherData.main?.temp,
        humidity: weatherData.main?.humidity,
        description: weatherData.weather?.[0]?.description,
        windSpeed: weatherData.wind?.speed,
      } : null,
      traffic: trafficData?.flowSegmentData ? {
        currentSpeed: trafficData.flowSegmentData.currentSpeed,
        freeFlowSpeed: trafficData.flowSegmentData.freeFlowSpeed,
        congestion: Math.round((1 - trafficData.flowSegmentData.currentSpeed / trafficData.flowSegmentData.freeFlowSpeed) * 100),
      } : null,
      recentIncidents: incidentsData || [],
    };

    const systemPrompt = `You are Nexus AI, an intelligent urban analyst for Lagos, Nigeria. Analyze the user's query using the real-time data provided.

REAL-TIME DATA:
${JSON.stringify(context, null, 2)}

RESPONSE FORMAT:
Always structure your response with:
1. **Summary**: Direct answer to the query (1-2 sentences)
2. **Current Conditions**: Relevant real-time data
3. **Risk Assessment**: Severity level (low/medium/high) with confidence percentage
4. **Recommended Actions**: Specific, actionable steps
5. **Alternative Options**: If applicable (e.g., alternative routes)

Be specific about Lagos locations. Include confidence percentages for all predictions.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI query error:', response.status, errorText);
      throw new Error('AI query failed');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || 'Unable to process query';

    // Extract confidence from response (simplified extraction)
    const confidenceMatch = content.match(/(\d{1,3})%\s*confidence/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;

    return new Response(JSON.stringify({
      response: content,
      confidence,
      context: {
        weather: context.weather,
        traffic: context.traffic,
        incidentCount: context.recentIncidents.length,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('AI query error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
