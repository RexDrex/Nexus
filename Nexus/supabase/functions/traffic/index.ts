import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, zoom } = await req.json();
    const apiKey = Deno.env.get('TOMTOM_API_KEY');

    if (!apiKey) {
      throw new Error('TomTom API key not configured');
    }

    // Default to Lagos coordinates if not provided
    const latitude = lat || 6.5244;
    const longitude = lon || 3.3792;

    // Get traffic flow data
    const flowUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${latitude},${longitude}&key=${apiKey}`;
    const flowResponse = await fetch(flowUrl);
    const flowData = await flowResponse.json();

    // Get traffic incidents
    const incidentsUrl = `https://api.tomtom.com/traffic/services/5/incidentDetails?bbox=${longitude - 0.1},${latitude - 0.1},${longitude + 0.1},${latitude + 0.1}&key=${apiKey}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length,delay,roadNumbers}}}`;
    const incidentsResponse = await fetch(incidentsUrl);
    const incidentsData = await incidentsResponse.json();

    // Calculate congestion level from flow data
    const currentSpeed = flowData.flowSegmentData?.currentSpeed || 0;
    const freeFlowSpeed = flowData.flowSegmentData?.freeFlowSpeed || 50;
    const congestionLevel = Math.round((1 - currentSpeed / freeFlowSpeed) * 100);

    // Process incidents
    const incidents = incidentsData.incidents?.map((incident: any) => ({
      id: incident.properties?.id || crypto.randomUUID(),
      type: incident.properties?.iconCategory || 'unknown',
      description: incident.properties?.events?.[0]?.description || 'Traffic incident',
      from: incident.properties?.from || 'Unknown location',
      to: incident.properties?.to || 'Unknown destination',
      delay: incident.properties?.delay || 0,
      magnitude: incident.properties?.magnitudeOfDelay || 0,
      coordinates: incident.geometry?.coordinates || [],
    })) || [];

    return new Response(JSON.stringify({
      congestionLevel: Math.max(0, Math.min(100, congestionLevel)),
      currentSpeed,
      freeFlowSpeed,
      incidents,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Traffic API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: message,
      congestionLevel: 45,
      incidents: [],
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
