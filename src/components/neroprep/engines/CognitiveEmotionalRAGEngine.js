/**
 * NeuroCoach Conversational AI Engine — Cognitive-Emotional Placement Mentor
 * ──────────────────────────────────────────────────────────────────────────
 * 1. Emotional Safety Guardrail (Zero-latency Crisis Triage)
 * 2. Formal CBT Cognitive Distortion Mapping
 * 3. Contextual Hope Note & Peer Recovery Injection (RAG)
 * 4. 3-Tier Resilient Generation (ChatGPT -> Backend -> Local Synthesizer)
 * 5. Interactive Somatic Grounding Triggers (Box Breathing Links)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function pickRandom(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── 1. ZERO-LATENCY SAFETY & CRISIS TRIAGE ──────────────────────────────────
const CRISIS_PATTERNS = [
  /\b(kill myself|want to die|suicide|suicidal|end my life|end it all|better off dead|no reason to live|hate my life so much i want to die|self harm|slit my|hang myself)\b/i,
  /\b(i cannot take this life|life is pointless|want to disappear forever|wish i was dead)\b/i
];

function checkCrisisTriage(text) {
  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

const CRISIS_RESPONSE_PAYLOAD = {
  text: `Hey, please pause for a moment. I hear how overwhelmed and exhausted you are feeling, and your safety and life matter infinitely more than any test, placement, or interview. You do not have to carry this immense weight all alone.

Please reach out right now to caring people who are ready to support you 24/7:
• **Tele-MANAS (Govt of India, 24/7 Free)**: Call **14416** or **1800-891-4416**
• **Kiran National Helpline**: **1800-599-0019**
• **AASRA**: **+91-9820466726**
• **US & Global Lifeline**: Call or text **988**

Take a slow, gentle breath. Let's do a 4-4-4-4 Box Breathing exercise together right now to help your nervous system settle.`,
  actionTrigger: 'OPEN_BREATHING',
  crisisTriggered: true,
  suggestedPrompts: [
    "I want to do a breathing exercise",
    "I need a break from studying today",
    "How do I talk to someone I trust?"
  ]
};

// ── 2. CONTEXTUAL HOPE NOTES KNOWLEDGE BASE (PEER RAG) ─────────────────────
const CONTEXTUAL_HOPE_VAULT = {
  REJECTION_RECOVERY: [
    "Peer Story: An alumnus was rejected from Amazon in the final round last October, took a 3-day reset, practiced DP patterns, and landed a 22 LPA offer at Flipkart in December.",
    "Peer Story: A senior was eliminated from 7 consecutive Online Assessments in August before securing an SDE offer at Microsoft in January.",
    "Peer Story: An engineering student failed 4 campus interview rounds, focused on core CS fundamentals for 3 weeks, and was selected as Lead SDE at a fast-growing startup."
  ],
  CODING_FRUSTRATION: [
    "Peer Story: A student failed every Graph question during mock tests for 3 weeks. They switched to drawing traces on paper, and ended up solving both Graph questions in their real interview.",
    "Peer Story: A senior who struggled with Dynamic Programming for months mastered it by doing just 1 problem per day with the 20-minute rule."
  ],
  INTERVIEW_ANXIETY: [
    "Peer Story: A candidate used to freeze and stutter during mock HR rounds; doing 3 minutes of 4-4-4-4 box breathing before the real panel calmed their heart rate and they cleared the round comfortably.",
    "Peer Story: A student who blanked out in their first technical interview practiced speaking their thoughts aloud and aced their next round at Zoho."
  ],
  PEER_COMPARISON: [
    "Peer Story: A candidate was the last among their close 5 friends to get placed; their offer came 2 months later with an international firm at double the initial package.",
    "Peer Story: A senior felt left behind while peers posted on LinkedIn in August; they stayed consistent and signed their dream offer in December."
  ],
  PLACEMENT_DOUBT_LUCK: [
    "Peer Story: A student with an active back-paper felt they had no luck; they focused strictly on SQL and OOPs and cracked an on-campus drive on their very next attempt."
  ]
};

// ── 3. FORMAL CBT COGNITIVE DISTORTION DEFINITIONS ──────────────────────────
export const CBT_DISTORTION_REGISTRY = {
  PEER_COMPARISON: {
    distortion: "Social Comparison & Spotlight Effect",
    mechanism: "Assuming everyone is succeeding effortlessly while viewing one's own timeline as deficient.",
    reframingStrategy: "Decouple personal career trajectory from batchmates; emphasize non-linear company hiring waves."
  },
  PLACEMENT_DOUBT_LUCK: {
    distortion: "Personalization & Fatalism",
    mechanism: "Attributing temporary hiring pauses to personal unworthiness or uncontrollable bad luck.",
    reframingStrategy: "Disentangle internal engineering competence from external variables (headcount caps, team quotas)."
  },
  CODING_FRUSTRATION: {
    distortion: "All-or-Nothing (Black-and-White) Thinking",
    mechanism: "Believing that encountering TLE or bugs proves one is fundamentally incapable of software engineering.",
    reframingStrategy: "Frame bugs as data points in algorithmic pattern recognition rather than reflections of talent."
  },
  INTERVIEW_ANXIETY: {
    distortion: "Catastrophizing & Fortune Telling",
    mechanism: "Anticipating worst-case freezing or humiliation during upcoming interviews.",
    reframingStrategy: "Anchor the candidate in present somatic awareness (Box Breathing) before evaluating scenario probabilities."
  },
  BURNOUT_EXHAUSTION: {
    distortion: "Overgeneralization & Depletion",
    mechanism: "Equating temporary mental/physical fatigue with irreversible failure.",
    reframingStrategy: "Validate acute physical depletion; enforce non-negotiable rest boundaries over productivity."
  },
  REJECTION_RECOVERY: {
    distortion: "Mental Filtering / Discounting Positive Baseline",
    mechanism: "Focusing solely on the elimination email while discounting having beaten out hundreds to reach advanced rounds.",
    reframingStrategy: "Reframe advanced round eliminations as proof of top-tier verified fundamentals."
  }
};

const SYSTEM_PROMPT = `You are NeuroCoach, an empathetic, supportive, and motivating best-friend placement mentor for college students preparing for software engineering and tech campus placements.

CORE BEHAVIOR & TONE:
1. Speak like a real, caring, supportive best friend using natural conversational language and friend slang ('Yooo', 'Let's go', 'Man, that sucks', 'I hear you').
2. ZERO ROBOTIC HEADINGS: Never use section headings like 'Emotion Identified:', 'Perspective Shift:', 'Actionable Steps:', '3 Practical Ways', or dividers like '---'. Make it flow naturally like a real WhatsApp/Discord message from a mentor friend.
3. CONTEXT AWARE: Directly address the exact companies (Google, Amazon, TCS, Infosys, Zoho, etc.), specific interview rounds (final round, technical, HR, OA), and DSA topics (DP, Graphs, Trees, SQL) the user mentions.
4. CBT REFRAMING:
   - When DOWN: Validate feelings with genuine empathy first -> Reframe perspective through targeted CBT reframing -> Provide 2-3 gentle next steps.
   - Weave in the injected Contextual Peer Story naturally without saying "according to our database".
5. Provide 2-3 natural suggested follow-up prompt pills in a JSON block at the very end.

OUTPUT FORMAT:
[REPLY]
<your natural, human-like friend reply here>
[/REPLY]
[PROMPTS]
["Prompt 1", "Prompt 2", "Prompt 3"]
[/PROMPTS]`;

const DEFAULT_OPENAI_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) || '';

export class CognitiveEmotionalRAGEngine {
  /**
   * Primary Async AI Entry Point — calls ChatGPT / Backend API with Crisis Triage & Peer RAG
   */
  static async generateChatbotResponseAsync(latestMessage, conversationHistory = []) {
    const rawText = (latestMessage || '').trim();
    if (!rawText) {
      return {
        text: "Hey! I'm right here with you. What's on your mind today — any coding breakthroughs, tough interviews, or doubts?",
        insight: null,
        suggestedPrompts: ["Feeling anxious about placements", "Solved a tricky coding problem", "How to stay motivated?"],
        actionTrigger: null
      };
    }

    // ── STAGE 1: ZERO-LATENCY SAFETY & CRISIS TRIAGE ──
    if (checkCrisisTriage(rawText)) {
      return CRISIS_RESPONSE_PAYLOAD;
    }

    const lower = rawText.toLowerCase();
    const analysis = this.analyzeSentimentAndContext(rawText, lower, conversationHistory);
    const peerStory = pickRandom(CONTEXTUAL_HOPE_VAULT[analysis.state] || []);
    const actionTrigger = (analysis.state === 'INTERVIEW_ANXIETY' || analysis.state === 'BURNOUT_EXHAUSTION') ? 'OPEN_BREATHING' : null;

    const customOpenAIKey = (typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : null) || DEFAULT_OPENAI_KEY;

    // ── STAGE 2: DIRECT BROWSER-TO-CHATGPT CALL WITH PEER RAG ──
    if (customOpenAIKey && customOpenAIKey.startsWith('sk-')) {
      try {
        const cbtContext = CBT_DISTORTION_REGISTRY[analysis.state];
        const enrichedSystemPrompt = `${SYSTEM_PROMPT}\n\n[CONTEXTUAL PEER SUCCESS STORY (WEAVE SUBTLY)]:\n"${peerStory}"\n\n[DETECTED CBT DISTORTION]: ${cbtContext?.distortion || 'General Stress'}\n[REFRAMING STRATEGY]: ${cbtContext?.reframingStrategy || 'Empathetic validation'}`;

        const messages = [{ role: 'system', content: enrichedSystemPrompt }];

        (conversationHistory || []).slice(-6).forEach(m => {
          messages.push({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text || ''
          });
        });

        messages.push({ role: 'user', content: rawText });

        const directRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${customOpenAIKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.8,
            max_tokens: 750
          })
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          const rawOut = directData?.choices?.[0]?.message?.content || '';
          if (rawOut) {
            const { replyText, prompts } = this.parseReplyAndPrompts(rawOut);
            return {
              text: replyText,
              insight: this.buildInsightPayload(analysis, replyText),
              suggestedPrompts: prompts,
              actionTrigger,
              cbtDistortion: cbtContext?.distortion
            };
          }
        }
      } catch (e) {
        console.warn('[NeuroCoach] Direct API error, falling back:', e);
      }
    }

    // ── STAGE 3: BACKEND API FALLBACK ──
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawText,
          apiKey: customOpenAIKey || null,
          history: (conversationHistory || []).slice(-6).map(m => ({
            sender: m.sender || 'user',
            text: m.text || ''
          }))
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.text) {
          return {
            text: data.text,
            insight: this.buildInsightPayload(analysis, data.text),
            suggestedPrompts: data.suggestedPrompts || ["How should I prep next?", "Help me analyze what happened", "Give me a daily plan"],
            actionTrigger,
            cbtDistortion: CBT_DISTORTION_REGISTRY[analysis.state]?.distortion
          };
        }
      }
    } catch (_) {}

    // ── STAGE 4: LOCAL GENERATIVE SYNTHESIZER (ZERO-API OFFLINE) ──
    return this.generateChatbotResponse(rawText, conversationHistory);
  }

  static parseReplyAndPrompts(rawOut) {
    let replyText = rawOut;
    let prompts = [
      "How do I analyze what went wrong?",
      "What are the highest-ROI topics to practice?",
      "Help me reset my focus for tomorrow"
    ];

    if (rawOut.includes('[REPLY]') && rawOut.includes('[/REPLY]')) {
      replyText = rawOut.split('[REPLY]')[1].split('[/REPLY]')[0].trim();
    }

    if (rawOut.includes('[PROMPTS]') && rawOut.includes('[/PROMPTS]')) {
      const pPart = rawOut.split('[PROMPTS]')[1].split('[/PROMPTS]')[0].trim();
      try {
        const parsed = JSON.parse(pPart);
        if (Array.isArray(parsed) && parsed.length > 0) {
          prompts = parsed.slice(0, 3).map(String);
        }
      } catch (e) {}
    }

    return { replyText, prompts };
  }

  static buildInsightPayload(analysis, text) {
    const cbt = CBT_DISTORTION_REGISTRY[analysis.state] || {};
    return {
      hasInsight: true,
      distortionName: cbt.distortion || analysis.label,
      greeting: "",
      empathy: text,
      reframe: cbt.reframingStrategy || "Every challenge is a stepping stone to the right offer.",
      friendAdvice: "Take one manageable step at a time.",
      balancedTakeaway: "Consistency and resilience always beat random luck.",
      microStep: "Focus on one core priority today.",
      affirmation: "I am growing stronger through every challenge.",
      startingStress: analysis.sentimentScore < 0 ? 70 : 40,
      reframedStress: analysis.sentimentScore < 0 ? 35 : 20,
      stressDelta: 25,
      detectedKeywords: [analysis.label, analysis.entities.company, analysis.entities.round, analysis.entities.topic].filter(Boolean)
    };
  }

  /**
   * Synchronous / Local Fallback Dynamic Response Generator
   */
  static generateChatbotResponse(latestMessage, conversationHistory = []) {
    const rawText = (latestMessage || '').trim();
    if (checkCrisisTriage(rawText)) {
      return CRISIS_RESPONSE_PAYLOAD;
    }

    const lower = rawText.toLowerCase();
    const analysis = this.analyzeSentimentAndContext(rawText, lower, conversationHistory);
    const response = this.synthesizeDynamicResponse(analysis, rawText, lower, conversationHistory);

    return response;
  }

  /**
   * Deep Sentiment, Entity & Context Analyzer with CBT Mapping
   */
  static analyzeSentimentAndContext(rawText, lower, history = []) {
    const company = this.extractCompany(lower);
    const round = this.extractRound(lower);
    const topic = this.extractTopic(lower);

    const negationMatches = lower.match(/\b(dont|don't|didnt|didn't|wont|won't|cant|can't|cannot|couldnt|couldn't|wouldnt|wouldn't|shouldnt|shouldn't|wasnt|wasn't|isnt|isn't|arent|aren't|not|no|never|unable|failed|failing|fails|lost|losing|hopeless|bad|unlucky|doubt|doubting|suck|sucks|terrible|horrible|useless|waste|sad|discouraged|demotivated|depressed|unhappy|upset|crying|heartbroken|tears|ruined|cried|down|disappointed|hurt|hurts|pain)\b/gi) || [];
    const sadMatches = lower.match(/\b(sad|discouraged|demotivated|depressed|unhappy|upset|crying|heartbroken|tears|ruined|cried|down|disappointed|hurt|hopeless|hate myself|give up|quitting)\b/gi) || [];
    const anxietyMatches = lower.match(/\b(nervous|anxious|scared|fear|panic|freeze|froze|shaking|afraid|blank out|blanked|sweating|stress|stressed|butterflies|jittery|pressure)\b/gi) || [];
    const winMatches = lower.match(/\b(solved|cracked|cleared|selected|shortlisted|placed|won|happy|proud|breakthrough|offer|passed|got in|aced)\b/gi) || [];
    const fatigueMatches = lower.match(/\b(tired|exhausted|burnout|drained|sleepy|no energy|overworked|headache|lazy|procrastinating)\b/gi) || [];

    let sentimentScore = 0.0;
    sentimentScore -= (sadMatches.length * 0.35 + negationMatches.length * 0.15 + anxietyMatches.length * 0.2 + fatigueMatches.length * 0.25);
    sentimentScore += (winMatches.length * 0.4);
    sentimentScore = Math.max(-1.0, Math.min(1.0, sentimentScore));

    let state = 'GENERAL_REFLECTION';
    let label = 'Daily Reflection & Processing';

    if (
      /\b(rejected|rejection|eliminated|elimination|disqualified|dropped|kicked out|not selected|didnt get selected|didn't get selected|did not get selected|failed test|failed interview|failed the round|not shortlisted)\b/i.test(lower) ||
      (/\b(didnt|didn't|not|failed)\b/i.test(lower) && /\b(select|selected|shortlist|clear|cleared|placed|offer|round|interview|test|oa)\b/i.test(lower)) ||
      (sadMatches.length > 0 && /\b(interview|round|test|oa|assessment|company|placement|offer)\b/i.test(lower))
    ) {
      state = 'REJECTION_RECOVERY';
      label = 'Rejection Blues & Post-Assessment Disappointment';
    } else if (
      /\b(bad at luck|unlucky|no luck|my luck|never get placed|wont get placed|won't get placed|not good enough|afraid i won't|fear of not getting placed|hate myself|failure|i am a failure|demotivated|hopeless)\b/i.test(lower) ||
      (negationMatches.length > 0 && /\b(placed|placement|offer|job|hired|clear)\b/i.test(lower))
    ) {
      state = 'PLACEMENT_DOUBT_LUCK';
      label = 'Self-Doubt & Feeling Unlucky';
    } else if (
      /\b(batchmate|batchmates|classmate|classmates|friends|everyone else|peers)\b/i.test(lower) &&
      /\b(placed|offer|got|cleared|ahead|package|lpa|job)\b/i.test(lower)
    ) {
      state = 'PEER_COMPARISON';
      label = 'Peer Comparison & Falling Behind';
    } else if (fatigueMatches.length > 0 || /\b(cannot study|crying|giving up|quit|quitting)\b/i.test(lower)) {
      state = 'BURNOUT_EXHAUSTION';
      label = 'Burnout & Emotional Fatigue';
    } else if (
      /\b(stuck|cannot solve|can't solve|tle|time limit|wrong answer|bug|dp is hard|recursion is tough|graph is hard|dsa is hard)\b/i.test(lower)
    ) {
      state = 'CODING_FRUSTRATION';
      label = 'Coding Roadblock & Problem Frustration';
    } else if (
      /\b(interview|mock|hr round|technical round|panel|managerial|intro|tell me about yourself)\b/i.test(lower) &&
      (anxietyMatches.length > 0 || negationMatches.length > 0)
    ) {
      state = 'INTERVIEW_ANXIETY';
      label = 'Interview Anxiety & Performance Jitters';
    } else if (winMatches.length > 0 && sadMatches.length === 0) {
      state = 'WIN_CELEBRATION';
      label = 'Pride & Achievement';
    } else if (/\b(motivate me|inspire me|need motivation|how to prepare|tips for|guide me)\b/i.test(lower)) {
      state = 'MOTIVATION_REQUEST';
      label = 'Seeking Direction & Motivation';
    } else if (/^(hi|hey|hello|good morning|good evening|yo)\b/i.test(lower.trim())) {
      state = 'GREETING';
      label = 'Friendly Check-in';
    }

    return {
      state,
      label,
      sentimentScore,
      entities: { company, round, topic },
      rawText,
      lower,
      cbt: CBT_DISTORTION_REGISTRY[state]
    };
  }

  static extractCompany(lower) {
    const companies = [
      'google', 'amazon', 'microsoft', 'meta', 'apple', 'netflix', 'uber', 'goldman sachs',
      'tcs', 'infosys', 'wipro', 'accenture', 'cognizant', 'capgemini', 'zoho', 'oracle',
      'cisco', 'adobe', 'salesforce', 'qualcomm', 'samsung', 'flipkart', 'swiggy', 'zomato'
    ];
    for (const c of companies) {
      if (lower.includes(c)) return c.charAt(0).toUpperCase() + c.slice(1);
    }
    return null;
  }

  static extractRound(lower) {
    if (/\b(final round|final interview|last round)\b/i.test(lower)) return 'final interview round';
    if (/\b(hr round|hr interview|hr)\b/i.test(lower)) return 'HR round';
    if (/\b(technical round|tech round|coding round)\b/i.test(lower)) return 'technical round';
    if (/\b(oa|online assessment|aptitude test)\b/i.test(lower)) return 'online assessment';
    if (/\b(system design)\b/i.test(lower)) return 'system design round';
    return null;
  }

  static extractTopic(lower) {
    if (/\b(dp|dynamic programming)\b/i.test(lower)) return 'Dynamic Programming';
    if (/\b(graph|graphs|bfs|dfs)\b/i.test(lower)) return 'Graphs';
    if (/\b(tree|trees|bst)\b/i.test(lower)) return 'Trees';
    if (/\b(recursion|backtracking)\b/i.test(lower)) return 'Recursion & Backtracking';
    if (/\b(sql|database|dbms)\b/i.test(lower)) return 'SQL & DBMS';
    if (/\b(oops|object oriented)\b/i.test(lower)) return 'OOPs concepts';
    if (/\b(os|operating system)\b/i.test(lower)) return 'Operating Systems';
    return null;
  }

  /**
   * Generative dynamic response synthesizer with randomized human phrasing & Peer Hope stories
   */
  static synthesizeDynamicResponse(analysis, rawText, lower, history) {
    const { state, entities } = analysis;
    const company = entities.company ? entities.company : '';
    const round = entities.round ? entities.round : 'that round';
    const topic = entities.topic ? entities.topic : 'DSA topics';
    const peerStory = pickRandom(CONTEXTUAL_HOPE_VAULT[state] || []);
    let actionTrigger = null;

    let responseText = '';
    let takeaway = '';
    let suggestedPrompts = [];

    switch (state) {
      case 'REJECTION_RECOVERY': {
        const roundMention = entities.round ? `the ${entities.round}` : 'that round';
        const companyMention = entities.company ? ` at ${entities.company}` : '';

        if (entities.round && entities.round.includes('final')) {
          responseText = `Ah man, that hurts on another level. Getting all the way to ${roundMention}${companyMention} and not hearing the outcome you worked so hard for is genuinely heartbreaking. Anyone in your shoes would feel drained today.

Here is the real truth you need to remember: Making it all the way to the final round proves your technical foundation is already at top hiring standard! You beat out hundreds of candidates in the screening and test rounds. In final rounds, hiring calls usually come down to headcount limits—not your capability.

${peerStory}

Here's our comeback plan:
- Take tonight completely off to decompress. Grab comfort food, watch a favorite movie, and do not think about coding.
- Tomorrow, write down the 2-3 specific questions they asked in that final round so you keep that valuable experience locked in.
- Keep your head held high—an engineer who can reach the final round will crack an offer very soon.

What company was this for, and how did the questions feel? Tell me whenever you're ready, I've got your back!`;
        } else {
          responseText = `Rejection emails and eliminations sting so bad, especially when you gave it your all. It is 100% valid to feel bummed out and frustrated today, honestly.

Remember: one company passing on you says ZERO about how good of an engineer you are. Placement season is a numbers game, and almost every senior with a dream offer was rejected multiple times before landing it.

${peerStory}

Here is how we bounce back:
- Take tonight off to recharge. Don't judge your whole career when you're feeling down.
- Turn today's tricky questions into tomorrow's study topics.
- You only need one 'yes'—and every drive makes you sharper for the offer meant for you!`;
        }

        takeaway = "A rejection is just a redirection. Every interview makes me sharper for the offer meant for me.";
        suggestedPrompts = [
          "How do I analyze what went wrong?",
          "What should I revise for my next test?",
          "Help me reset my focus for tomorrow"
        ];
        break;
      }

      case 'PLACEMENT_DOUBT_LUCK': {
        responseText = `Man, I totally get why you're feeling drained and down right now. When you're putting in honest work and results don't show up immediately, it's so easy to blame luck or start doubting if you're good enough.

Real talk though: luck might decide a random test question on a given day, but over the long run, consistent prep ALWAYS wins. You don't need 10 offers—you just need that one right team that values your specific skill set.

${peerStory}

Here is what we're going to do:
- Focus strictly on what you control: solve 1-2 solid practice problems today and ignore the noise.
- Look at your real progress: think about how much more code, tech, and problem solving you understand today compared to a few months ago!
- Give yourself permission to feel tired tonight, sleep well, and come back fresh tomorrow.`;
        takeaway = "My career is built on steady consistency, not random luck. I only need one right opportunity.";
        suggestedPrompts = [
          "What should I study if my basics feel weak?",
          "How do I bounce back after a test rejection?",
          "Help me make a 3-day recovery study plan"
        ];
        break;
      }

      case 'PEER_COMPARISON': {
        responseText = `Ugh, seeing friends and batchmates post their offer letters while you're still grinding is seriously tough. It makes you feel like everyone is zooming ahead while you're stuck in place.

Listen to me: campus placement is NOT a race with only one winner. Companies hire all year round in waves, both on-campus and off-campus. Someone else getting an offer doesn't take away the job that's waiting for you! Everyone has their own timeline.

${peerStory}

Here's how to protect your peace and focus:
- Put placement WhatsApp groups and LinkedIn on mute for a couple of days so you can clear your head without comparison noise.
- Pick your signature superpower—whether it's ${entities.topic || 'SQL, OOPs, Arrays, or Web Dev'}—and make it your strongest selling point.
- Compete only with who you were last week. You are building your own unique path!`;
        takeaway = "Everyone has their own hiring timeline. I focus strictly on improving my own skills.";
        suggestedPrompts = [
          "How do I stop feeling behind my friends?",
          "What are the highest-ROI topics to practice right now?",
          "Help me organize a daily study routine"
        ];
        break;
      }

      case 'CODING_FRUSTRATION': {
        const topicMention = entities.topic ? `${entities.topic} problem` : 'coding problem';
        responseText = `Agh, getting stuck on a ${topicMention} or seeing 'Time Limit Exceeded' after grinding for hours is super annoying! It can make you feel like throwing your hands up.

Here's the secret: getting stuck doesn't mean you can't code. It just means your brain is seeing a brand new pattern for the first time! DSA is basically 90% pattern recognition once you've seen the tricks a couple of times.

${peerStory}

Try this right now:
- If you're completely blank after 15-20 minutes, stop staring at the screen. Peek at the discussion or hints! Understanding the pattern beats burning out any day.
- Grab pen and paper and trace a tiny 4-element array step by step instead of doing mental gymnastics.
- Take a 10-minute water break. A refreshed brain spots bugs twice as fast!`;
        takeaway = "Getting stuck is just my brain building new neural connections. Every bug teaches a pattern.";
        suggestedPrompts = [
          `Can you explain the intuition behind ${topic}?`,
          "Give me an easier practice problem for this pattern",
          "What are the 20-minute rules for DSA?"
        ];
        break;
      }

      case 'INTERVIEW_ANXIETY': {
        actionTrigger = 'OPEN_BREATHING';
        responseText = `Whoa, take a slow deep breath right now. Interview jitters and butterflies before an interview are so intense, but they are just your body's adrenaline pumping. It means you care, not that you're unprepared!

${peerStory}

Right now, let's reset your nervous system:
- Tap the **4-4-4-4 Box Breathing** button below for 90 seconds. Slowing your exhale instantly drops your heart rate.
- Remember: the interviewer is just an engineer like you who was nervous in this exact same seat a few years ago.
- If you get a tough question, it is 100% fine to say: 'That's an interesting problem, let me take 30 seconds to structure my approach.'`;
        takeaway = "Nerves are just energy. I slow down, breathe, and take one question at a time.";
        suggestedPrompts = [
          "Help me practice a 60-second HR intro",
          "What should I say if I get stuck on a question?",
          "Guide me through a quick calming exercise"
        ];
        break;
      }

      case 'BURNOUT_EXHAUSTION': {
        actionTrigger = 'OPEN_BREATHING';
        responseText = `Hey, listen to me: stop looking at code right now. You are running on empty, and a tired brain cannot absorb algorithms. 

Placements are a marathon, not a 24-hour sprint. Taking a full evening off to sleep and recharge is not 'wasting time'—it's necessary maintenance for your brain!

${peerStory}

Here is your permission slip:
- Close your IDE and LeetCode tabs for the rest of the night.
- Go outside for a 15-minute walk, drink plenty of water, and get 8 hours of solid sleep.
- Your streak in the Mario Garden is protected—taking care of yourself comes first!`;
        takeaway = "Rest is part of the work. A well-rested engineer thinks clearly and performs better.";
        suggestedPrompts = [
          "How do I prevent burnout while preparing?",
          "Give me a balanced daily schedule with breaks",
          "Remind me why I should rest tonight"
        ];
        break;
      }

      case 'WIN_CELEBRATION': {
        responseText = `YOOOO! LET'S GOOO! 🔥🎉 That is huge! Give yourself credit right now—cracking that took real focus and patience!

Milestones like this are proof that all those late nights and practice sessions are paying off. Bottle this confidence up and remember this feeling whenever you hit a tricky problem next.

How did you crack it? Tell me what click in your head!`;
        takeaway = "I celebrated my win! Every breakthrough builds unstoppable placement momentum.";
        suggestedPrompts = [
          "What concept should I tackle next?",
          "How do I keep this momentum going?",
          "Help me log this win in my journal"
        ];
        break;
      }

      default: {
        responseText = `Hey friend! I'm right here with you. How is your preparation feeling today? Whether you're making breakthroughs or feeling overwhelmed, tell me what's on your mind and let's work through it together!`;
        takeaway = "Consistent daily effort compounds into placement success.";
        suggestedPrompts = [
          "Feeling anxious about upcoming drives",
          "Solved a tricky coding question today",
          "Help me organize my study priorities"
        ];
      }
    }

    return {
      text: responseText,
      insight: this.buildInsightPayload(analysis, responseText),
      suggestedPrompts,
      actionTrigger,
      cbtDistortion: analysis.cbt?.distortion
    };
  }
}

export default CognitiveEmotionalRAGEngine;
