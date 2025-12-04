import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HierarchyNode {
  id: string;
  level: number;
  type: 'heading' | 'subheading' | 'paragraph' | 'list' | 'table' | 'section';
  text: string;
  children: HierarchyNode[];
  metadata?: {
    pageNumber?: number;
    confidence?: number;
    style?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { textContent, pageBreaks } = await req.json();
    
    if (!textContent || typeof textContent !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing document with length:", textContent.length);
    console.log("Page breaks:", pageBreaks?.length || 0);

    const systemPrompt = `You are an expert document structure analyzer. Your task is to analyze document text and extract its hierarchical structure.

RULES:
1. Identify headings, subheadings, sections, paragraphs, lists, and tables
2. Determine the logical nesting level (1 = main heading, 2 = subheading, 3+ = nested content)
3. Preserve the reading order
4. Assign unique IDs to each node
5. Group related content under appropriate parent headings

OUTPUT FORMAT:
Return ONLY valid JSON with this structure:
{
  "title": "Document Title",
  "hierarchy": [
    {
      "id": "h1_1",
      "level": 1,
      "type": "heading",
      "text": "Main Heading",
      "children": [
        {
          "id": "p1_1",
          "level": 2,
          "type": "paragraph",
          "text": "Content under heading...",
          "children": [],
          "metadata": { "confidence": 0.95 }
        }
      ],
      "metadata": { "confidence": 0.98, "style": "title" }
    }
  ],
  "statistics": {
    "totalNodes": 0,
    "headings": 0,
    "paragraphs": 0,
    "maxDepth": 0
  }
}

DETECTION PATTERNS:
- ALL CAPS or Title Case at line start = likely heading
- Numbered sections (1., 1.1, a., i.) = structured headings
- Bullet points or dashes = list items
- Short standalone lines = potential headings
- Long text blocks = paragraphs
- Tabular data with consistent spacing = tables`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Analyze this document and extract its hierarchical structure:\n\n${textContent.slice(0, 50000)}` 
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Failed to analyze document" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      console.error("No response from AI");
      return new Response(
        JSON.stringify({ error: "No response from AI service" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("AI response received, length:", aiResponse.length);

    // Extract JSON from response (handle markdown code blocks)
    let jsonString = aiResponse;
    const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }

    let result;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return a fallback structure
      result = {
        title: "Document",
        hierarchy: [{
          id: "root_1",
          level: 1,
          type: "section",
          text: "Document Content",
          children: [{
            id: "p_1",
            level: 2,
            type: "paragraph",
            text: textContent.slice(0, 500) + (textContent.length > 500 ? "..." : ""),
            children: [],
            metadata: { confidence: 0.5 }
          }],
          metadata: { confidence: 0.5 }
        }],
        statistics: {
          totalNodes: 2,
          headings: 1,
          paragraphs: 1,
          maxDepth: 2
        },
        parseWarning: "AI response was not valid JSON, showing simplified structure"
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in extract-hierarchy:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
