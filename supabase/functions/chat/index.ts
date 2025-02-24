// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  json_mode?: boolean;
}

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
if (!GROQ_API_KEY) {
  console.error("GROQ_API_KEY environment variable is required");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      messages,
      temperature = 0.7,
      max_tokens = 4096,
      stream = false,
      json_mode = false,
    } = (await req.json()) as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format");
    }

    if (!GROQ_API_KEY) {
      throw new Error("GROQ API key not configured");
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama2-70b-4096",
          messages,
          temperature,
          max_tokens,
          stream,
          response_format: json_mode ? { type: "json_object" } : undefined,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error response:", errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    if (stream) {
      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", "text/event-stream");
      headers.set("Cache-Control", "no-cache");
      headers.set("Connection", "keep-alive");

      return new Response(response.body, {
        headers,
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in chat function:", error);

    const errorResponse = {
      error: {
        type: error instanceof Error ? error.name : "UnknownError",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
