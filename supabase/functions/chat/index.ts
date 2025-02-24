
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY environment variable is required');
}

// Using imported corsHeaders from shared/cors.ts

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log('Processing request with messages:', messages);

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment variables');
      return new Response(
        JSON.stringify({
          error: 'Configuration Error',
          message: 'GROQ API key not configured. Please set the GROQ_API_KEY environment variable.',
          timestamp: new Date().toISOString(),
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      );
    }

    console.log('Sending request to Groq API...');

    // Corrected Groq API URL
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2-70b-4096',
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text();
      console.error('Groq API error response:', errorBody);
      throw new Error(`Groq API error: ${groqResponse.status} - ${errorBody}`);
    }

    const groqData = await groqResponse.json();
    console.log('Successful response from Groq:', groqData);

    return new Response(
      JSON.stringify(groqData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in chat function:', error.message);
    
    return new Response(
      JSON.stringify({
        error: 'Error processing request',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});
