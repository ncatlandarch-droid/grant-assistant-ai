/* ============================================
   Netlify Function — Document Analysis
   Sends a PDF or text to Gemini multimodal
   and returns a structured grant-match analysis.
   ============================================ */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not set' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }; }

  const { text, fileBase64, mimeType } = body;

  if (!text && !fileBase64) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Provide text or fileBase64' }) };
  }

  // Build Gemini content parts — supports both PDF and plain text
  const parts = [];

  if (fileBase64) {
    parts.push({
      inline_data: {
        mime_type: mimeType || 'application/pdf',
        data: fileBase64
      }
    });
  }

  const prompt = `You are an expert grant research analyst for a US university research office.

${text ? `Research text provided:\n\n${text}\n\n` : ''}Analyze the research ${fileBase64 ? 'document above' : 'text above'} and return ONLY a valid JSON object — no markdown, no explanation — matching this exact schema:

{
  "researchThemes": ["list of 3-6 high-level research themes"],
  "keywords": ["list of 8-12 specific technical keywords"],
  "researchSummary": "2-3 sentence plain-English summary of the research focus and goals",
  "suggestedTitle": "A concise, compelling grant-proposal-style project title",
  "piExpertise": "One sentence describing the PI's apparent area of expertise",
  "suggestedSponsors": ["USDA NIFA", "NSF", "NIH", "DOD", "EPA", "USDA", "private foundation, etc. — list 3-5 most relevant"],
  "suggestedPrograms": ["Specific program names within those agencies — list 2-4"],
  "complianceFlags": {
    "humanSubjects": false,
    "animals": false,
    "biohazard": false,
    "exportControl": false
  },
  "estimatedBudgetRange": "e.g. $200,000–$500,000 based on typical awards for this type of research",
  "matchedOpportunityKeywords": ["5-8 specific terms likely to appear in grant opportunity titles or descriptions"]
}`;

  parts.push({ text: prompt });

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1200,
      responseMimeType: 'application/json'  // Forces Gemini to return valid JSON
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        body: JSON.stringify({ error: 'Gemini API error', detail: data })
      };
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Empty Gemini response' }) };
    }

    let parsed;
    try { parsed = JSON.parse(content); }
    catch {
      return { statusCode: 502, body: JSON.stringify({ error: 'Could not parse response as JSON', raw: content }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Upstream failed', detail: err.message }) };
  }
};
