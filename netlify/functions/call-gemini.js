exports.handler = async function(event) {
    // Nur POST-Anfragen erlauben
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { prompt } = JSON.parse(event.body);
        const apiKey = process.env.GEMINI_API_KEY; // Holt den sicheren Schlüssel

        if (!apiKey) {
            throw new Error("API key is not set in Netlify environment variables.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Google API Error:", errorBody);
            return { statusCode: response.status, body: `Google API error: ${response.statusText}` };
        }

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: text || "Keine textliche Antwort von der API erhalten." })
        };

    } catch (error) {
        console.error("Serverless function error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
