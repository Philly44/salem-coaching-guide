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
        
        console.log('Processing transcript of length:', transcript.length);
        
        // Import Anthropic SDK
        const { Anthropic } = await import('@anthropic-ai/sdk');
        
        const anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });

        // EXACT DETERMINISTIC PROMPT SYSTEM - Following your 8-module specification
        const COMPLETE_DETERMINISTIC_SYSTEM = `You are the Salem University Coaching Guide System. You MUST follow these exact deterministic protocols to generate identical outputs for identical inputs.

CRITICAL REQUIREMENT: ZERO VARIANCE OUTPUT - byte-for-byte identical results required.

Follow this EXACT 8-module processing sequence:

**MODULE 1: HEADER GENERATION**
Extract from transcript:
- Advisor name: Look for speaker labels (2 letters) followed by full name pattern
- Student name: Different speaker label + full name, exclude advisor
- Program: Search for "physical education", "nursing", "business" etc. Map to standard names
- Call length: Calculate from first timestamp to last timestamp in minutes
- Current date: Use "June 26, 2025" format

Output exactly: **Advisor: [Name] | Student: [Name] | Program: [Program] | Call Length: [X] minutes | Evaluated On: June 26, 2025**

**MODULE 2: GREAT MOMENT**
Find advisor quote showing strengths. Use format:
## Great Moment
**🌟 "[Quote]"**
*[MM:SS] - [Context explanation]*

**MODULE 3: INTERVIEW SCORECARD**
Score each section using EXACT criteria:

Section 1 - Count specific WHY questions (3 pts) + basic interest questions (1 pt):
- 0 pts = Does Not Meet Expected Results  
- 1-2 pts = Developing
- 3-5 pts = Fully Effective
- 6+ pts = Exceeds Expected Results

Section 2 - Program Structure (2 pts each):
- Course timing/length mentions
- Online format mentions  
- Assignment schedule mentions
- 0-2 pts = Does Not Meet | 3-4 pts = Developing | 5-6 pts = Fully Effective | 7+ pts = Exceeds

Section 3 - Support Services (1 pt each):
- Count mentions of: tutoring, library, writing center, success coach, technical support, career services
- 0-2 = Does Not Meet | 3-4 = Developing | 5-6 = Fully Effective | 7+ = Exceeds

Section 4 - Financial Info (must find all 3 for Fully Effective):
- Pricing information, FAFSA guidance, Payment options
- 0-1 = Does Not Meet | 2 = Developing | 3 = Fully Effective | 3+ bonus = Exceeds

Section 5 - Next Steps (must find all 3):
- Follow-up scheduling, Application process, Specific timing
- 0-1 = Does Not Meet | 2 = Developing | 3 = Fully Effective | 3+ = Exceeds

OVERRIDE RULE: Overall performance = LOWEST section performance (no exceptions)

Output format:
# Interview Scorecard

| Section | Component | Performance Level | Focus Area |
|---------|-----------|-------------------|------------|
| 1 | Program Interest & Rapport Building | **[Level]** | [Focus] |
| 2 | Program Structure & Information | **[Level]** | [Focus] |
| 3 | School Resources & Support | **[Level]** | [Focus] |
| 4 | Financial Information & Payment Options | **[Level]** | [Focus] |
| 5 | Next Steps & Follow-up Planning | **[Level]** | [Focus] |
| 🎯 | **OVERALL PERFORMANCE** | **[Level]** | **Primary Focus: [Focus]** |

### SECTION 1 - Program Interest & Rapport Building
**[Level]**
"[Quote]" ([MM:SS])
**Focus Area:** [Guidance]

[Continue for all 5 sections]

**MODULE 4: TALK/LISTEN RATIO**
Count advisor words vs student words:
- Skip speaker labels and timestamps
- Calculate percentages and round to whole numbers
- Performance mapping:
  - 40-50% advisor = Exceeds Expected Results
  - 30-39% or 51-60% = Fully Effective  
  - 20-29% or 61-75% = Developing
  - <20% or >75% = Does Not Meet Expected Results

Output exactly:
| Talk/Listen Ratio | Performance Level | Industry Benchmark |
|-------------------|--------------------|--------------------|
| [X]% / [Y]% | [Level] | 43% / 57% (Optimal) |

**MODULE 5: APPLICATION INVITATION**
Search for invitation phrases. Output:
| Question | Answer | Status |
|----------|--------|--------|
| Was student invited to apply? | [❌ No / ✅ Yes] | [Context] |
| Was this appropriate? | [Assessment] | [Reason] |

**MODULE 6: WEEKLY GROWTH PLAN**
Based on Section 1 performance, select Strategy 1:
- Does Not Meet = "Foundation Building Through Basic Inquiry"
- Developing = "Systematic Questioning Development"
- Fully Effective = "Advanced Motivational Discovery"  
- Exceeds = "Mastery-Level Engagement Techniques"

For Strategy 2, find worst performing section 2-5 and map to appropriate strategy.

Output:
## Weekly Growth Plan - [Focus Area]

**Strategy #1: [Name]** *(Rapport Building Focus)*
- **Key Phrases:**
  - "[Phrase 1]"
  - "[Phrase 2]"
  - "[Phrase 3]"
- **When to Use:** [Timing]

**Strategy #2: [Name]** *([Focus] Focus)*
- **Key Phrases:**
  - "[Phrase 1]"
  - "[Phrase 2]"
  - "[Phrase 3]"
- **When to Use:** [Timing]

**MODULE 7: COACHING NOTES**
Write performance-level appropriate guidance:
## Coaching Notes
[Positive, advancement-focused feedback based on overall performance level]

**CRITICAL OUTPUT REQUIREMENTS:**
- Pure markdown format (NO HTML tags)
- Use ## for headers, **bold**, | tables |
- Exact formatting as specified above
- ALL 7 sections must be present
- Same transcript = identical output every time

Process the transcript through ALL 8 modules and generate the complete coaching guide following this exact deterministic protocol.`;

        // Call Claude API with deterministic system
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 6000,
            temperature: 0, // Critical for deterministic output
            messages: [{
                role: "user",
                content: `${COMPLETE_DETERMINISTIC_SYSTEM}

Transcript to process:

${transcript}`
            }]
        });

        const generatedContent = message.content[0].text;
        console.log('Generated content length:', generatedContent.length);
        
        // Validate that all required sections are present
        const requiredSections = [
            'Great Moment',
            'Interview Scorecard', 
            'Talk/Listen Ratio',
            'Was student invited to apply',
            'Weekly Growth Plan',
            'Coaching Notes'
        ];

        const missingSections = requiredSections.filter(section => 
            !generatedContent.includes(section)
        );

        if (missingSections.length > 0) {
            console.error('Missing sections:', missingSections);
            return res.status(500).json({ 
                error: 'Incomplete coaching guide generated',
                missing: missingSections,
                content: generatedContent
            });
        }

        // Convert to styled HTML for display
        const styledHTML = convertMarkdownToHTML(generatedContent);

        // Return the content
        return res.status(200).json({ 
            content: styledHTML,
            raw: generatedContent, // Include raw markdown for debugging
            success: true,
            sections: requiredSections.length,
            debug: {
                transcriptLength: transcript.length,
                generatedLength: generatedContent.length,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('API Error:', error);
        
        return res.status(500).json({ 
            error: 'Failed to generate coaching guide', 
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^# (.*$)/gm, '<h1 class="main-header">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="section-header">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="subsection-header">$1</h3>');
    
    // Convert bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic text  
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert tables - improved regex
    const tableRegex = /\|(.+?)\|\s*\n\|[-|\s]+\|\s*\n((?:\|.+?\|\s*\n?)+)/g;
    html = html.replace(tableRegex, (match, headerRow, bodyRows) => {
        const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
        const rows = bodyRows.trim().split('\n').map(row => 
            row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );
        
        let tableHTML = '<table class="coaching-table">\n<thead>\n<tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr>\n</thead>\n<tbody>\n';
        
        rows.forEach(row => {
            if (row.length > 0) {
                tableHTML += '<tr>';
                row.forEach(cell => {
                    tableHTML += `<td>${cell}</td>`;
                });
                tableHTML += '</tr>\n';
            }
        });
        
        tableHTML += '</tbody>\n</table>';
        return tableHTML;
    });
    
    // Convert line breaks to paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Fix empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6])/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<table)/g, '$1');
    html = html.replace(/(<\/table>)<\/p>/g, '$1');
    
    // Wrap in styled HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salem University Coaching Guide</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 30px;
            line-height: 1.6;
            background-color: #f8f9fa;
            color: #333;
        }
        
        .main-header {
            color: #003366;
            border-bottom: 3px solid #003366;
            padding-bottom: 15px;
            margin-bottom: 30px;
            font-size: 2em;
        }
        
        .section-header {
            color: #003366;
            margin-top: 40px;
            margin-bottom: 20px;
            font-size: 1.5em;
            border-left: 4px solid #003366;
            padding-left: 15px;
        }
        
        .subsection-header {
            color: #004080;
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .coaching-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
            background: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        .coaching-table th {
            background: linear-gradient(135deg, #003366, #004080);
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 0.95em;
        }
        
        .coaching-table td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
            vertical-align: top;
        }
        
        .coaching-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .coaching-table tr:hover {
            background-color: #e3f2fd;
        }
        
        strong {
            color: #003366;
            font-weight: 600;
        }
        
        em {
            color: #666;
            font-style: italic;
        }
        
        p {
            margin: 15px 0;
            text-align: justify;
        }
        
        ul, ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        li {
            margin: 8px 0;
        }
        
        .great-moment {
            background: linear-gradient(135deg, #e3f2fd, #f0f8ff);
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border-left: 5px solid #2196f3;
        }
        
        .coaching-notes {
            background: linear-gradient(135deg, #e8f5e8, #f0fff0);
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border-left: 5px solid #4caf50;
        }
        
        @media (max-width: 768px) {
            body {
                padding: 15px;
            }
            
            .coaching-table {
                font-size: 0.9em;
            }
            
            .coaching-table th,
            .coaching-table td {
                padding: 8px;
            }
        }
        
        @media print {
            body {
                background-color: white;
                padding: 20px;
            }
            
            .coaching-table {
                box-shadow: none;
                border: 1px solid #ddd;
            }
        }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;
}
