export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('=== DEBUGGING START ===');
        console.log('1. Request received');
        console.log('2. Headers:', req.headers);
        console.log('3. Body keys:', Object.keys(req.body || {}));
        
        const { transcript } = req.body;
        
        if (!transcript || transcript.trim().length === 0) {
            console.log('4. ERROR: No transcript provided');
            return res.status(400).json({ error: 'No transcript provided' });
        }
        
        console.log('4. Transcript length:', transcript.length);
        console.log('5. First 200 chars:', transcript.substring(0, 200));
        
        // Check environment variables
        console.log('6. API Key exists:', !!process.env.ANTHROPIC_API_KEY);
        console.log('7. API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
        
        // Import Anthropic SDK
        console.log('8. Importing Anthropic SDK...');
        const { Anthropic } = await import('@anthropic-ai/sdk');
        console.log('9. SDK imported successfully');
        
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
        console.log('10. Anthropic client created');

        // Simple test prompt first
        const testPrompt = `Analyze this conversation transcript and create a Salem University coaching guide with these sections:

1. Header with advisor name, student name, program, call length, and evaluation date
2. Great Moment - a standout quote from the advisor
3. Interview Scorecard - performance evaluation
4. Talk/Listen Ratio - conversation balance
5. Application Invitation Assessment
6. Weekly Growth Plan
7. Coaching Notes

Keep the output concise and well-formatted. Use markdown format.

Transcript:
${transcript.substring(0, 3000)}${transcript.length > 3000 ? '...[truncated]' : ''}`;

        console.log('11. Prompt length:', testPrompt.length);
        console.log('12. Making API call...');

        // Call Claude API
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            temperature: 0,
            messages: [{
                role: "user",
                content: testPrompt
            }]
        });

        console.log('13. API call successful');
        console.log('14. Response length:', message.content[0].text?.length || 0);
        console.log('15. Response preview:', message.content[0].text?.substring(0, 200) || 'No content');

        const generatedContent = message.content[0].text;

        // Basic HTML wrapper for testing
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>Salem University Coaching Guide</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #003366; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #003366; color: white; }
    </style>
</head>
<body>
    <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${generatedContent}</pre>
</body>
</html>`;

        console.log('16. HTML generated, length:', htmlContent.length);
        console.log('17. Sending response...');

        // Return successful response
        return res.status(200).json({ 
            content: htmlContent,
            success: true,
            debug: {
                transcriptLength: transcript.length,
                promptLength: testPrompt.length,
                responseLength: generatedContent.length,
                timestamp: new Date().toISOString(),
                apiKeyPresent: !!process.env.ANTHROPIC_API_KEY
            }
        });
        
    } catch (error) {
        console.error('=== ERROR DETAILS ===');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.response) {
            console.error('API Response status:', error.response.status);
            console.error('API Response data:', error.response.data);
        }
        
        return res.status(500).json({ 
            error: 'Failed to generate coaching guide', 
            details: error.message,
            type: error.constructor.name,
            timestamp: new Date().toISOString(),
            debug: {
                hasApiKey: !!process.env.ANTHROPIC_API_KEY,
                apiKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
                nodeEnv: process.env.NODE_ENV
            }
        });
    }
}
