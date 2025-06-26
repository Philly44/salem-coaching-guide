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
        const { transcript } = req.body;
        
        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ error: 'No transcript provided' });
        }
        
        // Import Anthropic SDK
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
                content: `You are an expert coaching evaluator for Salem University. Analyze this advisor-student conversation transcript and generate a complete HTML coaching guide.

TRANSCRIPT:
${transcript}

Generate a professional coaching evaluation report as a complete HTML document with the following sections:

1. **Header**: Include advisor name, student name, program discussed, call length (calculate from timestamps), and current date
2. **Great Moment**: Highlight the advisor's best quote with context and timestamp
3. **Interview Scorecard**: Evaluate 5 key areas:
   - Program Interest & Rapport Building
   - Program Structure & Information
   - School Resources & Support
   - Financial Information & Payment Options
   - Next Steps & Follow-up Planning
4. **Talk/Listen Ratio**: Calculate the percentage of advisor vs student talking
5. **Application Invitation Assessment**: Was the student invited to apply? Was it appropriate?
6. **Weekly Growth Plan**: Two specific strategies for improvement
7. **Coaching Notes**: Encouraging, advancement-focused guidance

Use this HTML structure with embedded CSS:
<!DOCTYPE html>
<html>
<head>
    <title>Salem University Coaching Guide</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .header-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .great-moment { background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .performance-level { font-weight: bold; }
        @media print { body { font-size: 11pt; } table { page-break-inside: avoid; } }
    </style>
</head>
<body>
    [Generate all content sections here]
</body>
</html>`
            }]
        });

        // Return the generated HTML
        return res.status(200).json({ 
            html: message.content[0].text,
            success: true
        });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            error: 'AI generation failed', 
            details: error.message 
        });
    }
}
