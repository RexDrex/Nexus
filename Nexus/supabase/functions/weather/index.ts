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
    const { lat, lon, city } = await req.json();
    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');

    if (!apiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    let url: string;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city || 'Lagos,NG'}&appid=${apiKey}&units=metric`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather');
    }

    // Also get forecast
    const forecastUrl = lat && lon 
      ? `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=8`
      : `https://api.openweathermap.org/data/2.5/forecast?q=${city || 'Lagos,NG'}&appid=${apiKey}&units=metric&cnt=8`;
    
    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    return new Response(JSON.stringify({
      current: {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind_speed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        description: data.weather[0]?.description || 'Unknown',
        icon: data.weather[0]?.icon || '01d',
        rain_probability: data.clouds?.all || 0,
        city: data.name,
      },
      forecast: forecastData.list?.map((item: any) => ({
        time: item.dt_txt,
        temp: Math.round(item.main.temp),
        icon: item.weather[0]?.icon,
        description: item.weather[0]?.description,
      })) || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Weather API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
