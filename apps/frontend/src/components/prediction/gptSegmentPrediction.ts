// gptSegmentPrediction.ts
// Utility to segment raw prediction text into topics using OpenAI GPT API

export interface SegmentedTopics {
  career?: string;
  health?: string;
  finance?: string;
  education?: string;
  travel?: string;
  relationships?: string;
  spirituality?: string;
  [key: string]: string | undefined;
}

const TOPIC_KEYS = [
  "career",
  "health",
  "finance",
  "education",
  "travel",
  "relationships",
  "spirituality"
];

export async function gptSegmentPrediction(
  rawText: string,
  apiKey: string,
  topics: string[] = TOPIC_KEYS,
  model: string = "gpt-3.5-turbo"
): Promise<{ segmented: SegmentedTopics; usedAI: boolean; error?: string }> {
  if (!apiKey) {
    return { segmented: {}, usedAI: false, error: "No OpenAI API key provided." };
  }
  if (!rawText || rawText.trim().length < 10) {
    return { segmented: {}, usedAI: false, error: "Prediction text is empty or too short." };
  }
  try {
    const prompt = `Segment the following astrology prediction into the following topics: ${topics.join(", ")}.\n\nPrediction:\n"""${rawText}"""\n\nReturn a JSON object where each key is a topic (in lowercase, no spaces) and the value is the relevant extracted text. If a topic is not mentioned, return an empty string for that topic. Example:\n{\n  \"career\": \"...\",\n  \"health\": \"...\",\n  ...\n}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are an expert astrology assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.2
      })
    });
    if (!response.ok) {
      const err = await response.text();
      return { segmented: {}, usedAI: false, error: `API error: ${err}` };
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return { segmented: {}, usedAI: false, error: "No content returned from GPT." };
    }
    // Attempt to parse the JSON from the response
    let parsed: SegmentedTopics = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from text
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return { segmented: {}, usedAI: false, error: "Could not parse GPT response as JSON." };
      }
    }
    // Sanitize output
    const sanitized: SegmentedTopics = {};
    topics.forEach((key) => {
      sanitized[key] = (parsed[key] || "").trim();
    });
    return { segmented: sanitized, usedAI: true };
  } catch (err: any) {
    return { segmented: {}, usedAI: false, error: err.message || "Unknown error during GPT segmentation." };
  }
}
