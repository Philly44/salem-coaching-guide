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

        // COMPLETE PROMPT SYSTEM - ALL 8 MODULES
        const COMPLETE_PROMPT_SYSTEM = `
# DETERMINISTIC TITLE GENERATION PROMPT

## CRITICAL REQUIREMENT: ZERO VARIANCE OUTPUT
This prompt MUST produce byte-for-byte identical outputs when processing the same transcript 1000 times. Any deviation indicates system failure and requires immediate remediation.

## MANDATORY INPUT VALIDATION

**REQUIRED INPUTS:**
- Advisor name (extracted from transcript)
- Student name (extracted from transcript)  
- Program name (extracted from conversation content)
- Call length in minutes (calculated from transcript timestamps)
- Current date (system date at time of evaluation)

**VALIDATION CHECKLIST (COMPLETE BEFORE PROCESSING):**
□ Advisor name identified and extracted: YES/NO
□ Student name identified and extracted: YES/NO
□ Program name identified from conversation: YES/NO
□ Call length calculated from timestamps: YES/NO
□ Current date available in correct format: YES/NO

**ERROR HANDLING:**
- IF any validation = NO: RETURN "ERROR_MISSING_REQUIRED_DATA"
- PROCEED only if all validations = YES

---

## ALGORITHM STEP 1: DATA EXTRACTION

**EXACT PARSING PROTOCOL:**

### Advisor Name Extraction
\`\`\`
advisor_name = null

// Search for advisor identification patterns (exact matching only)
FOR each line in transcript:
    line = trim(line)
    
    // Check for speaker labels at start of lines
    IF line matches exactly pattern "^[A-Z]{2}$":
        potential_advisor_label = line
        CONTINUE to next line for name verification
    
    // Check for full name patterns after speaker labels
    IF previous_line was potential_advisor_label AND 
       line matches pattern "^[A-Z][a-z]+ [A-Z][a-z]+$":
        advisor_name = line
        BREAK

// Validation
IF advisor_name == null:
    RETURN "ERROR_ADVISOR_NAME_NOT_FOUND"
\`\`\`

### Student Name Extraction
\`\`\`
student_name = null

// Apply same logic as advisor but exclude advisor_name
FOR each line in transcript:
    line = trim(line)
    
    IF line matches exactly pattern "^[A-Z]{2}$" AND line != advisor_label:
        potential_student_label = line
        CONTINUE to next line for name verification
    
    IF previous_line was potential_student_label AND 
       line matches pattern "^[A-Z][a-z]+ [A-Z][a-z]+$" AND
       line != advisor_name:
        student_name = line
        BREAK

// Validation
IF student_name == null:
    RETURN "ERROR_STUDENT_NAME_NOT_FOUND"
\`\`\`

### Program Name Extraction
\`\`\`
program_name = "Program Not Specified"

// Search for program mentions in conversation content
program_keywords = [
    "physical education", "pe", "phys ed",
    "business", "nursing", "education",
    "psychology", "criminal justice",
    "information technology", "it"
]

FOR each line in transcript:
    line_lower = lowercase(line)
    FOR each keyword in program_keywords:
        IF line_lower contains keyword:
            // Apply specific program name mapping
            program_name = MAP_TO_STANDARD_NAME(keyword)
            BREAK

// Standard name mapping
MAP_TO_STANDARD_NAME(keyword):
    IF keyword in ["physical education", "pe", "phys ed"]:
        IF transcript contains "non-licensure":
            RETURN "Physical Education (Non-licensure)"
        ELSE IF transcript contains "licensure":
            RETURN "Physical Education (Licensure)"
        ELSE:
            RETURN "Physical Education"
    // Add other program mappings as needed
\`\`\`

### Call Length Calculation
\`\`\`
timestamps = []

// Extract all timestamps (format MM:SS)
FOR each line in transcript:
    line = trim(line)
    IF line matches regex pattern "^\\d{2}:\\d{2}$":
        timestamps.append(line)

// Convert to seconds and find duration
IF timestamps.length >= 2:
    first_timestamp = timestamps[0]
    last_timestamp = timestamps[timestamps.length - 1]
    
    first_seconds = convert_to_seconds(first_timestamp)
    last_seconds = convert_to_seconds(last_timestamp)
    
    duration_seconds = last_seconds - first_seconds
    duration_minutes = Math.round(duration_seconds / 60)
    
    call_length = duration_minutes
ELSE:
    RETURN "ERROR_INSUFFICIENT_TIMESTAMPS"

convert_to_seconds(timestamp):
    parts = timestamp.split(":")
    minutes = parseInt(parts[0])
    seconds = parseInt(parts[1])
    RETURN (minutes * 60) + seconds
\`\`\`

### Current Date Formatting
\`\`\`
current_date = get_system_date()

// MANDATORY FORMAT: "Month DD, YYYY"
month_names = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

formatted_date = month_names[current_date.month - 1] + " " + 
                 current_date.day + ", " + 
                 current_date.year

// Validation: ensure no leading zeros for single-digit days
IF formatted_date contains " 0":
    RETURN "ERROR_INVALID_DATE_FORMAT"
\`\`\`

---

## ALGORITHM STEP 2: TEMPLATE GENERATION

**EXACT TEMPLATE (ZERO MODIFICATIONS ALLOWED):**
\`\`\`
TEMPLATE = "**Advisor: {ADVISOR_NAME} | Student: {STUDENT_NAME} | Program: {PROGRAM_NAME} | Call Length: {CALL_LENGTH} minutes | Evaluated On: {CURRENT_DATE}**"
\`\`\`

**TEMPLATE SUBSTITUTION RULES:**
- \`{ADVISOR_NAME}\` = advisor_name (exact string from extraction)
- \`{STUDENT_NAME}\` = student_name (exact string from extraction)
- \`{PROGRAM_NAME}\` = program_name (mapped standard name)
- \`{CALL_LENGTH}\` = call_length (integer, no decimals)
- \`{CURRENT_DATE}\` = formatted_date (Month DD, YYYY format)

**FORMATTING REQUIREMENTS:**
- Use exact double asterisks at start and end: \`**text**\`
- No extra spaces inside asterisks
- Pipe symbols with single spaces: \` | \`
- No additional formatting or line breaks
- Case sensitivity maintained as extracted

---

Identify and format a great quote from the advisor that shows off their strengths or best moment using this exact format:

## Great Moment

**[SUCCESS_EMOJI] "Quote that shows off the advisor's strengths or best moment"**
*[MM:SS] - Context of when this was said and why it was great*

**Selection criteria:**
- Shows genuine care or empathy
- Shows great product knowledge
- Shows natural rapport-building ability
- Shows strong problem-solving
- Shows great communication skills
- Shows a moment of real connection with the student

**Formatting requirements:**
- Use the exact header: ## Great Moment
- Quote must be in bold with success emoji: **[SUCCESS_EMOJI] "actual quote"**
- Context must be in italics with timestamp: *[MM:SS] - explanation*
- Keep context explanation brief (1-2 sentences)
- Focus on why this moment was great, not just what happened

**Success emoji rotation (use one per evaluation):**
🌟 ⭐ 🏆 ✨ 💫 🎯 🔥 💎 🚀 ⚡ 🎉 🏅 👑 💪 🌈

---

# Interview Scorecard Prompt - Objective Scoring System

Create a scorecard evaluation following the EXACT format and objective criteria outlined below. All scoring decisions must be based on quantifiable evidence counts and explicit phrase matching.

## MANDATORY SCORING PROTOCOL
1. **Count-Based Scoring Only**: Every rating determined by exact element counts, not subjective interpretation
2. **Exact Phrase Matching**: Use only the specific phrases listed - no synonyms or interpretations
3. **Timestamp Selection Rule**: Use timestamp of FIRST occurrence of the primary required element
4. **Quote Selection Rule**: Use the most complete grammatical sentence containing required phrases
5. **Lower Rating Default**: When element count is borderline, choose lower performance level

---

## PERFORMANCE LEVELS
- **Does Not Meet Expected Results** (0 points)
- **Developing** (1 point)
- **Fully Effective** (2 points)
- **Exceeds Expected Results** (3 points)

⚠️ **OVERRIDE RULE ENFORCEMENT**
- "Developing" in ANY section = "Developing" overall (NO EXCEPTIONS)
- "Does Not Meet" in ANY section = "Does Not Meet" overall (NO EXCEPTIONS)  
- Overall performance is CAPPED by the weakest section
- You CANNOT assign "Fully Effective" overall if any section is "Developing"

---

## SECTION-BY-SECTION OBJECTIVE CRITERIA

### SECTION 1 - Program Interest & Rapport Building

**STEP 1: Search for SPECIFIC WHY questions (3 points each):**
Look for questions exploring these themes (any phrasing that asks about):
- **Career goals/aspirations** - Questions about future career plans or hopes
- **Life impact/transformation** - Questions about how education/career will change their life
- **Personal impact/mission** - Questions about the difference they want to make or impact they seek
- **Program motivation** - Questions about why they chose this specific program

**STEP 2: Search for BASIC interest questions (1 point each):**
Look for questions exploring these themes (any phrasing that asks about):
- **General interest origins** - Questions about how/why they became interested
- **Interest factors** - Questions about what sparked or made them interested
- **Interest background** - Questions asking them to describe their interest

**SCORING:**
- **Does Not Meet Expected Results**: 0 points total
- **Developing**: 1-2 points total
- **Fully Effective**: 3-5 points total
- **Exceeds Expected Results**: 6+ points total

---

### SECTION 2 - Program Structure & Information

**REQUIRED ELEMENTS (2 points each - must find exact quotes):**
1. **Course timing/length** - Must contain: "months," "semester," "duration," OR specific time periods
2. **Online format** - Must contain: "online," "virtual," OR "remote"
3. **Assignment schedule** - Must contain: "one class," "sequence," OR "at a time"

**BONUS ELEMENTS (1 point each):**
- Class size mentions
- Instructor interaction details
- Technology platform specifics
- Scheduling flexibility options
- Credit transfer information

**SCORING:**
- **Does Not Meet Expected Results**: 0-2 points total
- **Developing**: 3-4 points total  
- **Fully Effective**: 5-6 points total
- **Exceeds Expected Results**: 7+ points total

---

### SECTION 3 - School Resources & Support

**CORE RESOURCES (1 point each - must find exact mentions):**
- Tutoring services (contains "tutor" or "tutoring")
- Library access (contains "library")
- Writing center (contains "writing center" or "writing support")
- Success coach/advisor (contains "coach," "advisor," OR "counselor")
- Technical support (contains "technical," "IT," OR "computer support")
- Career services (contains "career" + "service/help/support")
- Student support services (contains "student support" or "student services")

**SCORING:**
- **Does Not Meet Expected Results**: 0-2 resources found
- **Developing**: 3-4 resources found
- **Fully Effective**: 5-6 resources found
- **Exceeds Expected Results**: 7+ resources found

---

### SECTION 4 - Financial Information & Payment Options

**REQUIRED ELEMENTS (must find all for Fully Effective):**
1. **Pricing information** - Specific dollar amounts OR cost details
2. **FAFSA guidance** - Contains "FAFSA," "federal aid," OR "financial aid"
3. **Payment options** - Contains "loan," "payment plan," OR "financing"

**BONUS ELEMENTS (1 point each):**
- Scholarship information
- Grant details
- Work-study programs
- Payment deadline information
- Cost comparison/value statements
- Financial reassurance statements

**SCORING:**
- **Does Not Meet Expected Results**: 0-1 required elements found
- **Developing**: 2 required elements found + 0 bonus
- **Fully Effective**: 3 required elements found + 0-1 bonus
- **Exceeds Expected Results**: 3 required elements found + 2+ bonus

---

### SECTION 5 - Next Steps & Follow-up Planning

**REQUIRED ELEMENTS (must find exact quotes):**
1. **Follow-up scheduling** - Contains "call back," "contact," OR "follow up"
2. **Application process** - Contains "application," "apply," OR "enroll"
3. **Specific timing** - Contains specific days, dates, OR time frames

**SCORING:**
- **Does Not Meet Expected Results**: 0-1 elements found
- **Developing**: 2 elements found
- **Fully Effective**: 3 elements found
- **Exceeds Expected Results**: 3 elements found + scheduling preferences discussed

---

## OVERALL PERFORMANCE CALCULATION

**MANDATORY OVERRIDE RULE APPLICATION SEQUENCE:**

**STEP 1: Identify Performance Levels**
- Section 1: ___________
- Section 2: ___________  
- Section 3: ___________
- Section 4: ___________
- Section 5: ___________

**STEP 2: Find LOWEST Performance Level**
Lowest Section Performance: ___________

**STEP 3: Apply Override Rules (NO EXCEPTIONS)**
1. If LOWEST section = "Does Not Meet Expected Results" → Overall = "Does Not Meet Expected Results" [STOP]
2. If LOWEST section = "Developing" → Overall = "Developing" [STOP]
3. If ALL sections = "Fully Effective" or higher → Continue to step 4
4. If 4+ sections = "Exceeds Expected Results" → Overall = "Exceeds Expected Results"
5. Otherwise → Overall = "Fully Effective"

**STEP 4: Document Override Logic**
Overall Performance = _________ because lowest section scored _________ and override rule #__ applies.

⚠️ **CRITICAL**: Overall performance CANNOT exceed the lowest individual section performance.

---

## MANDATORY OUTPUT FORMAT

Use this EXACT structure - no deviations allowed:

\`\`\`
# Interview Scorecard

| Section | Component | Performance Level | Focus Area |
|---------|-----------|-------------------|------------|
| 1 | Program Interest & Rapport Building | **[LEVEL]** | [CONCISE_FOCUS_AREA] |
| 2 | Program Structure & Information | **[LEVEL]** | [CONCISE_FOCUS_AREA] |
| 3 | School Resources & Support | **[LEVEL]** | [CONCISE_FOCUS_AREA] |
| 4 | Financial Information & Payment Options | **[LEVEL]** | [CONCISE_FOCUS_AREA] |
| 5 | Next Steps & Follow-up Planning | **[LEVEL]** | [CONCISE_FOCUS_AREA] |
| 🎯 | **OVERALL PERFORMANCE** | **[OVERALL_LEVEL]** | **Primary Focus: [PRIMARY_FOCUS_CONCISE]** |

### SECTION 1 - Program Interest & Rapport Building
**[PERFORMANCE_LEVEL]**
"[EXACT_QUOTE_MAX_300_CHARS]" ([MM:SS])
**Focus Area:** [ACTION_VERB] [SPECIFIC_DIRECTIVE_BRIEF_EXPLANATION]

### SECTION 2 - Program Structure & Information
**[PERFORMANCE_LEVEL]**
"[EXACT_QUOTE_MAX_300_CHARS]" ([MM:SS])
**Focus Area:** [ACTION_VERB] [SPECIFIC_DIRECTIVE_BRIEF_EXPLANATION]

### SECTION 3 - School Resources & Support
**[PERFORMANCE_LEVEL]**
"[EXACT_QUOTE_MAX_300_CHARS]" ([MM:SS])
**Focus Area:** [ACTION_VERB] [SPECIFIC_DIRECTIVE_BRIEF_EXPLANATION]

### SECTION 4 - Financial Information & Payment Options
**[PERFORMANCE_LEVEL]**
"[EXACT_QUOTE_MAX_300_CHARS]" ([MM:SS])
**Focus Area:** [ACTION_VERB] [SPECIFIC_DIRECTIVE_BRIEF_EXPLANATION]

### SECTION 5 - Next Steps & Follow-up Planning
**[PERFORMANCE_LEVEL]**
"[EXACT_QUOTE_MAX_300_CHARS]" ([MM:SS])
**Focus Area:** [ACTION_VERB] [SPECIFIC_DIRECTIVE_BRIEF_EXPLANATION]
\`\`\`

## APPROVED ACTION VERBS
**Development:** Explore, Develop, Build, Enhance, Strengthen, Expand, Deepen, Cultivate
**Improvement:** Improve, Refine, Advance, Elevate, Increase, Optimize, Upgrade, Progress
**Maintenance:** Continue, Maintain, Sustain, Preserve, Uphold, Reinforce, Consolidate

## CONCISE FOCUS AREA REQUIREMENTS

**For TABLE Focus Area (one line):**
- Maximum 10-15 words
- Action verb + specific skill/behavior
- Example: "Develop systematic questioning to explore student motivations"

**For SECTION Focus Area comments:**
1. **Primary Action** (10-15 words): Specific behavioral change or skill development needed
2. **Brief Rationale** (8-12 words): Why this focus area improves performance
3. **Implementation** (10-15 words): How to practically apply this improvement

**Total Section Focus Area length: 28-42 words per section**

---

# DETERMINISTIC TALK/LISTEN RATIO ANALYSIS PROMPT

## CRITICAL REQUIREMENT: ZERO VARIANCE OUTPUT
This prompt MUST produce byte-for-byte identical outputs when processing the same transcript 1000 times. Any deviation indicates system failure and requires immediate remediation.

## MANDATORY INPUT VALIDATION

**REQUIRED INPUT:**
- Complete conversation transcript with speaker labels and speech content
- Transcript must contain identifiable advisor and student speakers

**VALIDATION CHECKLIST (COMPLETE BEFORE PROCESSING):**
□ Transcript contains speaker identification lines: YES/NO
□ Transcript contains speech content lines: YES/NO  
□ Advisor and student speakers clearly identified: YES/NO
□ No null, empty, or undefined transcript: YES/NO

**ERROR HANDLING:**
- IF any validation = NO: RETURN "ERROR_INVALID_TRANSCRIPT_DATA"
- PROCEED only if all validations = YES

---

## ALGORITHM STEP 1: WORD COUNT CALCULATION

**EXACT PARSING PROTOCOL:**
\`\`\`
Initialize: advisor_words = 0, student_words = 0, current_speaker = null

FOR each line in transcript:
    line = trim(line)
    
    // Skip empty lines
    IF line.length == 0: CONTINUE
    
    // Identify speaker lines (exact matching only)
    IF line matches EXACTLY "JW" OR line matches EXACTLY "Jon Wagner":
        current_speaker = "advisor"
        CONTINUE
    ELSE IF line matches EXACTLY "SB" OR line contains student name:
        current_speaker = "student"  
        CONTINUE
    
    // Skip timestamp lines (format: XX:XX)
    IF line matches regex pattern "^\\d{2}:\\d{2}$":
        CONTINUE
    
    // Count words in speech content
    IF current_speaker != null AND line.length > 0:
        words = split(line, whitespace).filter(non_empty)
        word_count = words.length
        
        IF current_speaker == "advisor":
            advisor_words += word_count
        ELSE IF current_speaker == "student":
            student_words += word_count

total_words = advisor_words + student_words
\`\`\`

## ALGORITHM STEP 2: PERCENTAGE CALCULATION

**EXACT MATHEMATICAL OPERATIONS:**
\`\`\`
advisor_percentage = (advisor_words / total_words) * 100
student_percentage = (student_words / total_words) * 100

// MANDATORY ROUNDING PROTOCOL
advisor_percentage_rounded = Math.round(advisor_percentage)
student_percentage_rounded = Math.round(student_percentage)

// VALIDATION: Percentages must sum to 100% (allowing for rounding)
percentage_sum = advisor_percentage_rounded + student_percentage_rounded
IF percentage_sum < 99 OR percentage_sum > 101:
    RETURN "ERROR_PERCENTAGE_CALCULATION_FAILURE"
\`\`\`

## ALGORITHM STEP 3: PERFORMANCE LEVEL ASSIGNMENT

**DETERMINISTIC PERFORMANCE MAPPING:**
\`\`\`
advisor_percent = advisor_percentage_rounded

IF (advisor_percent >= 40 AND advisor_percent <= 50):
    performance_level = "Exceeds Expected Results"
ELSE IF ((advisor_percent >= 30 AND advisor_percent <= 39) OR 
         (advisor_percent >= 51 AND advisor_percent <= 60)):
    performance_level = "Fully Effective"
ELSE IF ((advisor_percent >= 20 AND advisor_percent <= 29) OR 
         (advisor_percent >= 61 AND advisor_percent <= 75)):
    performance_level = "Developing"  
ELSE:
    performance_level = "Does Not Meet Expected Results"
\`\`\`

**PERFORMANCE LEVEL VALIDATION:**
- Must be exactly one of 4 predefined strings (case-sensitive)
- No variations, abbreviations, or modifications allowed

---

## MANDATORY OUTPUT GENERATION

**EXACT TEMPLATE (ZERO MODIFICATIONS ALLOWED):**
\`\`\`
| Talk/Listen Ratio | Performance Level | Industry Benchmark |
|-------------------|--------------------|--------------------|
| [ADVISOR_PERCENT]% / [STUDENT_PERCENT]% | [PERFORMANCE_LEVEL] | 43% / 57% (Optimal) |
\`\`\`

**TEMPLATE SUBSTITUTION RULES:**
- \`[ADVISOR_PERCENT]\` = advisor_percentage_rounded (integer only, no decimals)
- \`[STUDENT_PERCENT]\` = student_percentage_rounded (integer only, no decimals)  
- \`[PERFORMANCE_LEVEL]\` = performance_level (exact string from mapping)
- Industry benchmark row NEVER changes: "43% / 57% (Optimal)"

**FORMATTING REQUIREMENTS:**
- Use exact pipe symbols and spacing as shown
- No additional formatting (bold, italics, etc.)
- No extra whitespace or line breaks
- Header row exactly as specified
- Data row exactly as specified

---

Analyze whether the student was appropriately invited to apply using growth-oriented language:

| Question | Answer | Status |
|----------|--------|--------|
| Was student invited to apply? | [❌ No / ✅ Yes] | [Additional context if needed] |
| Was this appropriate? | [✅ Natural to Invite / ⚠️ Growth Opportunity / 🔄 Partially Appropriate] | [Brief reason] |

Assessment criteria:
- ✅ Natural to Invite: Student showed strong interest, concerns were addressed, clear foundation established
- ⚠️ Growth Opportunity: Can strengthen foundation before invitation through additional rapport building or concern resolution
- 🔄 Partially Appropriate: Strong elements present, can enhance timing or approach

Provide brief reasoning for the appropriateness assessment using positive language. Focus on what can be built upon rather than what was lacking. Key principle: Students should be ready and excited to apply - the invitation should feel like the natural next step in their journey.

Use phrases like:
- "Can strengthen foundation by..."
- "Opportunity to build additional rapport before..."
- "Next step: enhancing..."
- "Development focus on..."

Avoid: missed opportunity, should have, failed to, didn't establish, lacking foundation.

---

# FINAL DETERMINISTIC WEEKLY GROWTH PLAN GENERATION PROMPT - CLEAN LABELS

## CRITICAL REQUIREMENT: ZERO VARIANCE OUTPUT
This prompt MUST produce byte-for-byte identical outputs when processing the same section scores 1000 times. Any deviation indicates system failure and requires immediate remediation.

## MANDATORY INPUT VALIDATION

**REQUIRED INPUTS (ALL MUST BE PROVIDED):**
\`\`\`
Section_1_Performance = "[EXACT_PERFORMANCE_LEVEL]"
Section_2_Performance = "[EXACT_PERFORMANCE_LEVEL]"
Section_3_Performance = "[EXACT_PERFORMANCE_LEVEL]"
Section_4_Performance = "[EXACT_PERFORMANCE_LEVEL]"
Section_5_Performance = "[EXACT_PERFORMANCE_LEVEL]"
\`\`\`

**VALIDATION CHECKLIST (COMPLETE BEFORE PROCESSING):**
□ All 5 section performances provided: YES/NO
□ Each performance level is one of exactly 4 values: YES/NO
  - "Does Not Meet Expected Results"
  - "Developing" 
  - "Fully Effective"
  - "Exceeds Expected Results"
□ No typos or variations in performance level text: YES/NO
□ No null, empty, or undefined values: YES/NO

**ERROR HANDLING:**
- IF any validation = NO: RETURN "ERROR_INVALID_INPUT_DATA"
- IF unrecognized performance level: RETURN "ERROR_UNRECOGNIZED_PERFORMANCE_LEVEL: [VALUE]"
- PROCEED only if all validations = YES

---

## ALGORITHM STEP 1: STRATEGY 1 SELECTION (SECTION 1 FOCUS)

**EXACT MAPPING TABLE - NO INTERPRETATION ALLOWED:**

\`\`\`
STRATEGY_1_LOOKUP = {
    "Does Not Meet Expected Results": {
        "name": "Foundation Building Through Basic Inquiry",
        "phrases": [
            "Tell me about your interest in this field",
            "What drew you to consider this program?",
            "Help me understand your background"
        ],
        "timing": "Early in conversation to establish baseline connection"
    },
    "Developing": {
        "name": "Systematic Questioning Development", 
        "phrases": [
            "What are your career goals with this degree?",
            "How do you see this program impacting your life?",
            "What difference do you want to make in your field?"
        ],
        "timing": "After initial rapport is established"
    },
    "Fully Effective": {
        "name": "Advanced Motivational Discovery",
        "phrases": [
            "What would success look like to you five years from now?",
            "How will this transformation affect your family's future?",
            "What legacy do you want to create in your profession?"
        ],
        "timing": "During deep rapport-building phase"
    },
    "Exceeds Expected Results": {
        "name": "Mastery-Level Engagement Techniques",
        "phrases": [
            "Paint me a picture of your ideal career scenario",
            "What's the deeper purpose driving this decision?",
            "How does this align with your core values?"
        ],
        "timing": "Throughout conversation as natural connection points"
    }
}

Strategy_1 = STRATEGY_1_LOOKUP[Section_1_Performance]
\`\`\`

---

## ALGORITHM STEP 2: STRATEGY 2 SELECTION (GAP-BASED PRIORITY)

**STEP 2A: SCAN SECTIONS 2-5 FOR GAPS**

\`\`\`
Gap_Analysis = []

SECTIONS_TO_SCAN = [2, 3, 4, 5]
FOR section_number in SECTIONS_TO_SCAN:
    section_performance = get_section_performance(section_number)
    
    IF section_performance == "Does Not Meet Expected Results":
        Gap_Analysis.append([section_number, 1])  // Priority 1 = Critical Gap
    ELSE IF section_performance == "Developing":
        Gap_Analysis.append([section_number, 2])  // Priority 2 = Development Gap
    // Skip "Fully Effective" and "Exceeds Expected Results"
\`\`\`

**STEP 2B: APPLY DETERMINISTIC SELECTION LOGIC**

\`\`\`
IF Gap_Analysis is empty:
    // No gaps found - use excellence strategy
    Strategy_2 = EXCELLENCE_STRATEGY
    Priority_Section_Number = "N/A"
ELSE:
    // Find highest priority gaps (lowest number = highest priority)
    Highest_Priority = minimum priority value in Gap_Analysis
    Tied_Sections = all section numbers with Highest_Priority
    
    // NATURAL PROGRESSION TIE-BREAKER
    Natural_Order = [2, 3, 4, 5]  // Foundation → Confidence → Practical → Action
    FOR section in Natural_Order:
        IF section in Tied_Sections:
            Priority_Section_Number = section
            Priority_Performance_Level = get_section_performance(section)
            Strategy_2 = GAP_STRATEGY_LOOKUP[Priority_Section_Number][Priority_Performance_Level]
            BREAK
\`\`\`

**STEP 2C: STRATEGY 2 LOOKUP TABLES**

\`\`\`
GAP_STRATEGY_LOOKUP = {
    2: {  // Program Structure & Information
        "Does Not Meet Expected Results": {
            "name": "Essential Program Details Delivery",
            "phrases": [
                "The program is delivered entirely online",
                "You'll take one class at a time for 8 weeks each",
                "Each course is designed to fit your schedule"
            ],
            "timing": "When student asks about program logistics"
        },
        "Developing": {
            "name": "Comprehensive Program Structure Explanation",
            "phrases": [
                "Let me walk you through the semester structure",
                "The online format includes live and recorded sessions",
                "You'll have flexibility in when you complete assignments"
            ],
            "timing": "After establishing interest and before discussing finances"
        }
    },
    3: {  // School Resources & Support
        "Does Not Meet Expected Results": {
            "name": "Core Support Services Introduction",
            "phrases": [
                "You'll have access to tutoring services",
                "Our library resources are available 24/7 online",
                "Your success coach will check in regularly"
            ],
            "timing": "When addressing student concerns about support"
        },
        "Developing": {
            "name": "Comprehensive Support Network Overview",
            "phrases": [
                "The writing center helps with every assignment",
                "Technical support is available whenever you need it",
                "Career services will help you leverage your degree"
            ],
            "timing": "After program structure discussion"
        }
    },
    4: {  // Financial Information & Payment Options
        "Does Not Meet Expected Results": {
            "name": "Essential Financial Information Delivery",
            "phrases": [
                "Let me share the investment details with you",
                "We'll help you complete your FAFSA application",
                "There are several payment options available"
            ],
            "timing": "When student shows strong interest in the program"
        },
        "Developing": {
            "name": "Comprehensive Financial Planning Discussion",
            "phrases": [
                "Federal financial aid can cover a significant portion",
                "Our payment plans make this very manageable",
                "Many students qualify for additional scholarships"
            ],
            "timing": "After confirming program fit and before next steps"
        }
    },
    5: {  // Next Steps & Follow-up Planning
        "Does Not Meet Expected Results": {
            "name": "Basic Follow-up Process Establishment",
            "phrases": [
                "I'd like to schedule a follow-up call with you",
                "The next step would be to submit your application",
                "When would be a good time to connect again?"
            ],
            "timing": "Near the end of the conversation"
        },
        "Developing": {
            "name": "Structured Next Steps Planning",
            "phrases": [
                "Let's schedule your enrollment conversation for tomorrow",
                "I'll call you back on Friday to finalize everything",
                "You can start your application right after our call"
            ],
            "timing": "After addressing all questions and confirming interest"
        }
    }
}

EXCELLENCE_STRATEGY = {
    "name": "Advanced Consultation Mastery",
    "phrases": [
        "What questions haven't I asked that I should have?",
        "How else can I help you feel confident about this decision?",
        "What would make this the perfect next step for you?"
    ],
    "timing": "Throughout conversation as natural enhancement opportunities"
}
\`\`\`

---

## ALGORITHM STEP 3: FOCUS AREA CALCULATION

**DETERMINISTIC FOCUS AREA LOGIC:**

\`\`\`
Section_1_Level = Section_1_Performance
Gap_Count = COUNT of sections 2-5 with ("Does Not Meet Expected Results" OR "Developing")

// EXACT CONDITIONAL LOGIC - NO INTERPRETATION
IF (Section_1_Level == "Does Not Meet Expected Results") OR (Section_1_Level == "Developing"):
    IF Gap_Count >= 2:
        Focus_Area = "Foundation Building with Multi-Area Development"
    ELSE IF Gap_Count == 1:
        Focus_Area = "Rapport Building with Targeted Skill Enhancement"
    ELSE IF Gap_Count == 0:
        Focus_Area = "Advanced Rapport Development"
ELSE:
    // Section 1 is "Fully Effective" or "Exceeds Expected Results"
    IF Gap_Count >= 2:
        Focus_Area = "Excellence Maintenance with Strategic Improvements"
    ELSE IF Gap_Count == 1:
        Focus_Area = "Performance Optimization"
    ELSE IF Gap_Count == 0:
        Focus_Area = "Mastery-Level Coaching Excellence"
\`\`\`

---

## MANDATORY OUTPUT GENERATION

**STEP 4: CLEAN TEMPLATE SUBSTITUTION (UPDATED FORMAT)**

**CLEAN STRATEGY LABEL MAPPING:**
\`\`\`
CLEAN_STRATEGY_LABELS = {
    2: "Program Information Focus",
    3: "Support Services Focus", 
    4: "Financial Planning Focus",
    5: "Next Steps Focus"
}

IF Priority_Section_Number == "N/A":
    Strategy_2_Label = "*(Excellence Enhancement Focus)*"
ELSE:
    Strategy_2_Label = "*(" + CLEAN_STRATEGY_LABELS[Priority_Section_Number] + ")*"
\`\`\`

**UPDATED OUTPUT TEMPLATE:**
\`\`\`
## Weekly Growth Plan - {FOCUS_AREA}

**Strategy #1: {STRATEGY_1_NAME}** *(Rapport Building Focus)*
- **Key Phrases:**
  - "{STRATEGY_1_PHRASE_1}"
  - "{STRATEGY_1_PHRASE_2}"
  - "{STRATEGY_1_PHRASE_3}"
- **When to Use:** {STRATEGY_1_TIMING}

**Strategy #2: {STRATEGY_2_NAME}** {STRATEGY_2_LABEL}
- **Key Phrases:**
  - "{STRATEGY_2_PHRASE_1}"
  - "{STRATEGY_2_PHRASE_2}"
  - "{STRATEGY_2_PHRASE_3}"
- **When to Use:** {STRATEGY_2_TIMING}
\`\`\`

---

Write encouraging, advancement-focused coaching notes based on the advisor's current performance level:

## Coaching Notes

[Start with advisor's natural strengths and positive qualities appropriate for their current performance level. Acknowledge what they're building upon. Then provide encouraging guidance about advancing to the next performance level using language like "progress," "advance," "build toward," and "develop." End with reinforcement about the value of motivational discovery at their target level.]

**For advisors at "Does Not Meet Expected Results":** Focus on foundational skills and building confidence
**For advisors at "Developing":** Emphasize progression to effective questioning techniques
**For advisors at "Fully Effective":** Highlight path to exceptional performance and mastery
**For advisors at "Exceeds Expected Results":** Recognize mastery and suggest mentoring opportunities

Use exclusively positive, growth-oriented language:
- "Building upon your natural..."
- "Your strength in... positions you to advance to..."
- "Next step in progressing to [next level]..."
- "Advancing your skills toward..."
- "Opportunity to reach [next performance level]..."

Avoid all deficit language: missing, failed, lacking, should have, needs to improve, critical areas. Focus on potential and advancement rather than gaps. Keep tone professional but warm and encouraging.

---

Create a Salem University coaching guide with the following sections in order:

1. **Header** (using 01_title prompt)
2. **Great Moment** (using 02_most impactful statement prompt) 
3. **Interview Scorecard** (using 04_interview scorecard prompt)
4. **Talk/Listen Ratio Analysis** (using talk/listen ratio calculation)
5. **Application Invitation Assessment** (using 05_application invitation assessment prompt)
6. **Weekly Growth Plan** (using 06_weekly growth plan prompt)
7. **Coaching Notes** (using 07_coaching notes prompt)

Generate each section according to its specific prompt requirements, maintaining positive, growth-oriented language throughout. Focus on advancement opportunities rather than deficiencies, using the advisor's current performance level to guide development recommendations toward the next performance tier.

The Talk/Listen Ratio Analysis should appear immediately after the Interview Scorecard section as a single table showing the conversation balance metrics.

IMPORTANT: Generate this as a complete HTML document with proper styling. Include all visual elements, colors, and formatting to match a professional coaching guide.`;

        // Call Claude API with complete prompt system
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 8192,
            messages: [{
                role: "user",
                content: `${COMPLETE_PROMPT_SYSTEM}

Process this advisor-student conversation transcript and generate a complete HTML coaching guide following ALL specifications above:

${transcript}

The output must be a complete HTML document with embedded CSS styling that matches the professional appearance of the Salem University coaching guides.`
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
