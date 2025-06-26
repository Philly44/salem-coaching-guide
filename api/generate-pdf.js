export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { transcript } = req.body;
        
        // For now, let's test if the function works
        return res.status(200).json({ 
            message: 'Vercel function is working!',
            transcriptLength: transcript.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        return res.status(500).json({ error: 'Function error: ' + error.message });
    }
}
