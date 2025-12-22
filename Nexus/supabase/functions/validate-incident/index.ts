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
    const { incident } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check for similar recent incidents (potential duplicates)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: similarIncidents } = await supabase
      .from('incidents')
      .select('*')
      .eq('event_type', incident.event_type)
      .eq('status', 'active')
      .gte('created_at', thirtyMinutesAgo);

    // Check proximity for duplicates
    const potentialDuplicates = (similarIncidents || []).filter((existing: any) => {
      if (!existing.latitude || !existing.longitude || !incident.latitude || !incident.longitude) {
        // Text-based location matching
        return existing.location_address?.toLowerCase().includes(incident.location_address?.toLowerCase().split(',')[0] || '');
      }
      // Calculate distance (simplified)
      const latDiff = Math.abs(existing.latitude - incident.latitude);
      const lonDiff = Math.abs(existing.longitude - incident.longitude);
      return latDiff < 0.01 && lonDiff < 0.01; // ~1km radius
    });

    // Use AI to analyze the incident
    const systemPrompt = `You are an incident validation AI for Lagos, Nigeria. Analyze this incident report and provide:
1. A confidence score (0-100) for validity
2. An impact assessment
3. Recommended actions for authorities
4. Any concerns about the report

Incident Details:
- Type: ${incident.event_type}
- Severity: ${incident.severity}
- Location: ${incident.location_address}
- Description: ${incident.description || 'No description provided'}
${potentialDuplicates.length > 0 ? `\nNote: ${potentialDuplicates.length} similar incidents reported in the last 30 minutes in this area.` : ''}

Respond in JSON format:
{
  "confidence": number,
  "impact": "low" | "medium" | "high",
  "analysis": "string",
  "actions": ["string"],
  "isDuplicate": boolean,
  "concerns": ["string"] or null
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Analyze this incident and respond with JSON only.' },
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI validation failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse AI response
    let validation;
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      validation = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        confidence: 70,
        impact: incident.severity,
        analysis: 'Automated validation pending',
        actions: ['Review incident details'],
        isDuplicate: potentialDuplicates.length > 0,
      };
    } catch {
      validation = {
        confidence: 70,
        impact: incident.severity,
        analysis: content,
        actions: ['Manual review recommended'],
        isDuplicate: potentialDuplicates.length > 0,
      };
    }

    return new Response(JSON.stringify({
      validation,
      potentialDuplicates: potentialDuplicates.length,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Validation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message,
      validation: {
        confidence: 50,
        impact: 'medium',
        analysis: 'Validation service unavailable',
        actions: ['Manual review required'],
        isDuplicate: false,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
