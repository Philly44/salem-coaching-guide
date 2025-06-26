export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { transcript } = req.body;
        
        // Import the Anthropic SDK
        const { Anthropic } = await import('@anthropic-ai/sdk');
        
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // Call Claude API
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 8192,
            messages: [{
                role: "user",
                content: `You are an expert coaching evaluator for Salem University. Generate a complete coaching guide evaluation for this advisor-student conversation transcript.

TRANSCRIPT:
${transcript}

Generate a professional HTML report that includes:
1. Header with advisor name, student name, program, call length, and date
2. A "Great Moment" section highlighting the advisor's best quote
3. Interview Scorecard (5 sections with performance levels)
4. Talk/Listen Ratio Analysis
5. Application Invitation Assessment  
6. Weekly Growth Plan with two strategies
7. Coaching Notes with encouragement

Format the output as a complete HTML document with inline CSS for a professional appearance. Use tables for structured data and ensure it's print-friendly.`
            }]
        });

        // Return the HTML
        return res.status(200).json({ 
            html: message.content[0].text,
            success: true
        });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'Generation failed', 
            details: error.message 
        });
    }
}
