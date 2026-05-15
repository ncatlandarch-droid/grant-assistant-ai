/* ============================================
   Netlify Function — Gemini Avatar Processor
   Accepts an uploaded photo, sends it to Gemini
   image editing: removes background, adds clean
   white background, returns a square portrait.
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
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { imageData, mimeType } = body;
  if (!imageData) {
    return { statusCode: 400, body: JSON.stringify({ error: 'imageData required' }) };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [
        {
          text: 'Edit this photo to create a clean professional profile picture. Remove the background completely and replace it with a solid white background. Keep the person exactly as they appear — same face, same clothes, same expression, same pose. Center them in a square frame. Do not alter the person in any way. Output only the edited portrait image.'
        },
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageData
          }
        }
      ]
    }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT']
    }
  };

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('Gemini avatar error:', errText);
      return { statusCode: upstream.status, body: JSON.stringify({ error: errText }) };
    }

    const data = await upstream.json();
    const imagePart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (!imagePart) {
      return { statusCode: 422, body: JSON.stringify({ error: 'Gemini did not return an image' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: imagePart.inlineData.data,
        mimeType:  imagePart.inlineData.mimeType || 'image/png'
      })
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: err.message }) };
  }
};
