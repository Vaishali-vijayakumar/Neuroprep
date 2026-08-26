/**
 * CognitiveEmotionalRAGEngine — Friendly Peer Companion & Real-Time RAG Emotional Booster
 * 
 * Generates warm, supportive, friendly replies as if the user is sharing/venting with a caring best friend.
 */

export class CognitiveEmotionalRAGEngine {
  /**
   * Curated RAG psychology & friendly mentorship knowledge base
   */
  static RAG_KNOWLEDGE_BASE = [
    {
      id: 'catastrophizing_rejection',
      triggerKeywords: ['never get placed', 'always fail', 'ruined my placement', 'end of career', 'hopeless', 'rejected everywhere', 'no company will hire me', 'i will fail'],
      distortion: 'Overthinking & Fear of Rejection',
      friendGreeting: 'Hey, take a deep breath. I am right here with you.',
      empathyValidation: 'I hear you, and I know how heavy and exhausting placement pressure can feel right now. It is completely okay to feel down after a tough round — anyone in your shoes would feel the same way. But please do not be too hard on yourself.',
      cognitiveReframe: 'Remember: one rejected interview or difficult test is just a single snapshot, not your whole story or your worth as an engineer. Companies hire in multiple waves all year round, and every single mock is just practice making you sharper for the right offer.',
      friendAdvice: 'Let us take the pressure off tonight. How about we just note down the 2 tricky questions from today so you can look at them with fresh eyes tomorrow morning?',
      neuroAffirmation: 'I am proud of showing up today. My consistency is building my future one step at a time.',
      startingStress: 88,
      reframedStress: 34
    },
    {
      id: 'impostor_peer_comparison',
      triggerKeywords: ['everyone is better', 'batchmates got offers', 'i am lagging behind', 'impostor', 'feel stupid', 'not smart enough', 'everyone else cleared', 'friends placed'],
      distortion: 'Comparing with Friends & Self-Doubt',
      friendGreeting: 'Hey friend, let us talk about this honestly.',
      empathyValidation: 'Seeing classmates get placed while you are still grinding can really sting and make you question yourself. It is so easy to fall into that comparison trap, and your feelings are 100% valid.',
      cognitiveReframe: 'Here is what you need to remember: everyone has their own timeline. Placement is not a race where only the first person wins — it is about finding the team that matches your unique skills. Your hard work is quietly compounding every single day.',
      friendAdvice: 'Let us celebrate your actual progress: think of 2 topics you already understand well (like OOP or basic Arrays). You know more than you give yourself credit for!',
      neuroAffirmation: 'I run my own journey. My dedicated preparation is bringing me closer to the right job every day.',
      startingStress: 82,
      reframedStress: 30
    },
    {
      id: 'coding_dp_burnout',
      triggerKeywords: ['cannot solve coding', 'stuck in dp', 'dynamic programming', 'graph traversal is impossible', 'hate coding', 'mind is blank', 'gave up on problem', 'coding is tough', 'recursion is hard'],
      distortion: 'Hitting a Coding Roadblock',
      friendGreeting: 'Oh I totally get you — that problem sounds brutal!',
      empathyValidation: 'Dynamic Programming and Graphs give even seasoned developers a headache. Hitting a wall does not mean you cannot code; it just means your brain is wrestling with a brand new pattern.',
      cognitiveReframe: 'You do not have to reinvent algorithms from scratch in an interview. Almost all placement problems come down to standard patterns (Memoization, Two Pointers, BFS). Once that pattern clicks, the code flows naturally.',
      friendAdvice: 'Close your laptop for 15 minutes. Go stretch or drink water, then trace just one small test case on pen and paper. No stress, just drawing it out.',
      neuroAffirmation: 'Tricky problems break down into simple patterns. I have the patience to solve them step by step.',
      startingStress: 78,
      reframedStress: 28
    },
    {
      id: 'interview_panic_freeze',
      triggerKeywords: ['blanked out', 'froze in interview', 'hands shaking', 'voice trembling', 'nervous in hr', 'scared of panel', 'panic attack', 'nervous', 'scared'],
      distortion: 'Interview Nervousness & Jitters',
      friendGreeting: 'Hey, breathe easy. You are doing so much better than you think.',
      empathyValidation: 'That nervous adrenaline rush before or during an interview happens to everyone — even toppers and senior engineers feel their heart racing. It just means you care about your goal.',
      cognitiveReframe: 'Interviewers are human beings too, and they do not expect you to be a robot. It is totally fine to pause, take a slow breath, and say: "Let me take 10 seconds to structure my thoughts." Taking a moment actually makes you look calm and composed.',
      friendAdvice: 'Try 2 quick inhales through your nose, followed by a long, slow exhale through your mouth. It resets your heart rate in seconds.',
      neuroAffirmation: 'I speak with calm confidence. My preparation is ready when I take a gentle breath.',
      startingStress: 92,
      reframedStress: 32
    },
    {
      id: 'general_placement_fatigue',
      triggerKeywords: ['tired of studying', 'exhausted', 'burnout', 'cannot study anymore', 'no energy', 'sleep deprived', 'overworked', 'drained', 'tired'],
      distortion: 'Burnout & Needing a Break',
      friendGreeting: 'Hey, listen to me: you need a well-deserved rest!',
      empathyValidation: 'You have been working so hard and carrying a lot of mental weight lately. Feeling tired is not laziness; it is your brain telling you that it needs time to recharge and lock in what you learned.',
      cognitiveReframe: 'Taking time to rest is not "wasting time." Rest is literally when your brain connects neural pathways and stores algorithmic patterns into long-term memory. You will code twice as fast after good sleep.',
      friendAdvice: 'Put away the mock tests for tonight. Watch a comforting show, listen to some music, and get a solid night of sleep.',
      neuroAffirmation: 'Giving my mind rest is a key part of my placement success.',
      startingStress: 74,
      reframedStress: 25
    }
  ];

  /**
   * Real-time semantic analyzer for friendly companion responses
   */
  static analyzeDiaryEmotion(text) {
    const cleanText = (text || '').trim();
    if (!cleanText || cleanText.length < 3) {
      return null;
    }

    const lower = cleanText.toLowerCase();

    // 1. Scan Knowledge Base for best matched friendly RAG trigger
    let bestMatch = null;
    let maxMatches = 0;

    for (const kb of this.RAG_KNOWLEDGE_BASE) {
      const matchCount = kb.triggerKeywords.filter(kw => lower.includes(kw)).length;
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = kb;
      }
    }

    // 2. If matched, generate friendly payload
    if (bestMatch && maxMatches > 0) {
      return {
        hasInsight: true,
        distortionName: bestMatch.distortion,
        greeting: bestMatch.friendGreeting,
        empathy: bestMatch.empathyValidation,
        reframe: bestMatch.cognitiveReframe,
        friendAdvice: bestMatch.friendAdvice,
        balancedTakeaway: `${bestMatch.cognitiveReframe} Friendly tip: ${bestMatch.friendAdvice}`,
        microStep: bestMatch.friendAdvice,
        affirmation: bestMatch.neuroAffirmation,
        startingStress: bestMatch.startingStress,
        reframedStress: bestMatch.reframedStress,
        stressDelta: bestMatch.startingStress - bestMatch.reframedStress,
        detectedKeywords: bestMatch.triggerKeywords.filter(kw => lower.includes(kw))
      };
    }

    // 3. Dynamic Fallback for wins / positive thoughts
    const isPositive = /\b(good|happy|proud|cleared|solved|easy|great|progress|excited|confident|won|win|cracked)\b/i.test(lower);

    if (isPositive) {
      return {
        hasInsight: true,
        distortionName: 'Celebrating Your Win',
        greeting: 'Awesome job! I am so happy to hear that!',
        empathy: 'Celebrating your wins — no matter how small — is huge for building true confidence. You worked hard for this, so take a moment to be proud of yourself!',
        reframe: 'Every problem solved and every concept understood is adding up. Keep this wonderful momentum going into your next practice session!',
        friendAdvice: 'Note down what went well today so you can repeat that positive habit tomorrow.',
        balancedTakeaway: 'I am making real, measurable progress toward my placement goals through consistent daily effort.',
        microStep: 'Keep this winning energy going and review 1 quick topic tomorrow morning.',
        affirmation: 'My preparation is translating into genuine skill and confidence.',
        startingStress: 35,
        reframedStress: 15,
        stressDelta: 20,
        detectedKeywords: ['positive momentum']
      };
    }

    // General reflective thought (Friendly supportive chat)
    return {
      hasInsight: true,
      distortionName: 'Heart-to-Heart Reflection',
      greeting: 'Thanks for sharing that with me.',
      empathy: 'Talking through what happened today is the best way to clear your head. Placement preparation is a marathon, and taking it one day at a time is the secret to succeeding.',
      reframe: 'You are showing up, learning, and trying your best every day. That dedication is what gets candidates placed.',
      friendAdvice: 'Pick just one small topic to focus on tomorrow, and relax for the rest of tonight.',
      balancedTakeaway: 'I am taking control of my placement journey through honest reflection and steady, manageable daily steps.',
      microStep: 'Take a short break and plan 1 focused task for tomorrow.',
      affirmation: 'I focus on steady progress. My daily consistency is creating my future success.',
      startingStress: 60,
      reframedStress: 28,
      stressDelta: 32,
      detectedKeywords: ['reflection']
    };
  }
}
