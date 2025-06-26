export default async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Safely get the transcript
        const body = req.body || {};
        const transcript = body.transcript || '';
        
        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'No transcript provided' });
        }
        
        // For now, let's test with a simple response
        return res.status(200).json({ 
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Coaching Guide Test</title>
                    <style>
                        body { font-family: Arial; padding: 20px; }
                        h1 { color: #333; }
                    </style>
                </head>
                <body>
                    <h1>Test Coaching Guide</h1>
                    <p>Transcript received with ${transcript.length} characters</p>
                    <p>API is working correctly!</p>
                    <button onclick="window.print()">Print as PDF</button>
                </body>
                </html>
            `,
            success: true
        });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'Server error', 
            details: error.message 
        });
    }
}
