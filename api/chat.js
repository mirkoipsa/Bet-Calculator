export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'La API Key no está configurada en el servidor' });
    }

    try {
        const systemInstruction = `
            Actúa como un experto asistente de apuestas deportivas para la app "BetCalc Pro".
            Tus respuestas deben ser breves, útiles y educativas.
            Explica conceptos como handicap, parlay, bankroll, ROI, stake de ser solicitado.
            Si te piden una predicción segura, aclara siempre que en las apuestas nada es 100% seguro.
            No des consejos financieros irresponsables.
            Si preguntan datos o analisis de algun partido brevemente explica la informacion relevante (estadísticas, forma reciente, enfrentamientos directos) pero no des un veredicto definitivo.
        `;

        const fullPrompt = `${systemInstruction}\n\nPregunta del usuario: ${message}`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: fullPrompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ response: aiResponse });

    } catch (error) {
        console.error('Error en el servidor API:', error);
        return res.status(500).json({ error: 'Hubo un error contactando a Gemini.' });
    }
}
