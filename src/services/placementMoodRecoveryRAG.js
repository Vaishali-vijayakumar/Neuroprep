/**
 * placementMoodRecoveryRAG.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Friendly, caring placement recovery companion.
 * Helps students gently unpack interview rejections, overcome self-doubt,
 * and bounce back with real-world context and inspiring senior stories.
 */

// ── 1. CARING KNOWLEDGE BASE ──────────────────────────────────────────────────
export const KNOWLEDGE_CHUNKS = [
  // ── Kind Mindset Shifts
  {
    id: "mindset_not_good_enough",
    domain: "kind_mindset",
    title: "Feeling like you're not smart enough or not cut out for this",
    content: (
      "When an interview doesn't go well, our mind often tells us: 'Maybe I'm just not meant to be a software developer.' " +
      "It is completely normal to feel that way when you're hurt. But getting stuck on one problem or getting nervous under pressure " +
      "is just a small moment in time—it has nothing to do with your overall intelligence or your talent."
    ),
    metadata: { type: "mindset", pattern: "self_doubt", targetTopic: "dsa_concepts" }
  },
  {
    id: "mindset_comparing_to_others",
    domain: "kind_mindset",
    title: "Comparing yourself to friends who already got placed",
    content: (
      "Watching friends celebrate their offers while you're still waiting can feel so heavy and lonely. " +
      "Please remind yourself: everyone moves at their own pace. Some people land offers in August, and others find their best role in January or March. " +
      "Your friend's success does not mean you are falling behind—your moment is coming too."
    ),
    metadata: { type: "mindset", pattern: "comparison", targetTopic: "general_rejection" }
  },
  {
    id: "mindset_self_blame",
    domain: "kind_mindset",
    title: "Blaming yourself and thinking everything was your fault",
    content: (
      "It's easy to replay the interview in your head and beat yourself up over every small word. " +
      "In reality, campus placements involve so many things outside your control—interviewer fatigue, company hiring limits, and plain luck. " +
      "Please be gentle with yourself. You tried your best with the energy you had."
    ),
    metadata: { type: "mindset", pattern: "self_blame", targetTopic: "self_worth" }
  },
  {
    id: "mindset_fear_of_future",
    domain: "kind_mindset",
    title: "Worrying that you will never find a good job",
    content: (
      "A rejection can make the future look dark, making you worry that no company will ever choose you. " +
      "Take comfort knowing that placement season is a marathon with many waves throughout the college year. " +
      "One 'no' from one company simply means that this wasn't the right match today—not that you won't build a wonderful career."
    ),
    metadata: { type: "mindset", pattern: "future_worry", targetTopic: "future_panic" }
  },

  // ── Real Hiring Facts
  {
    id: "facts_seat_limits_round2",
    domain: "hiring_facts",
    title: "Why Round 2 rejections are mostly about limited seats",
    content: (
      "Companies often interview 80 to 100 really talented students, but they may only have budget to hire 10 or 12. " +
      "That means over 70 wonderful students get turned away simply because seats ran out, not because their answers were bad. " +
      "Getting dropped in Round 2 does not mean you didn't do well—it just means the room was very crowded."
    ),
    metadata: { type: "reality", round: "technical_2", focus: "seat_limits" }
  },
  {
    id: "facts_online_tests_quirks",
    domain: "hiring_facts",
    title: "Why online screening tests can feel unfair",
    content: (
      "Automated coding platforms judge everything on hidden test cases and split-second timers. " +
      "Missing a single corner case or an unexpected input format can drop a score, even if your algorithm logic was brilliant. " +
      "Failing an online test is just a tiny platform hurdle, never a measure of whether you're a good programmer."
    ),
    metadata: { type: "reality", round: "oa", focus: "test_quirks" }
  },
  {
    id: "facts_interviewer_luck",
    domain: "hiring_facts",
    title: "How much interviewer luck plays a role",
    content: (
      "Every interviewer has their own personal style and favorite questions. Some are patient and give friendly hints, " +
      "while others might be stressed or quiet. A candidate who gets a 'not this time' from one interviewer often gets " +
      "high praise for the exact same answers from a different panel. It is never all on you."
    ),
    metadata: { type: "reality", round: "technical_1", focus: "interviewer_luck" }
  },
  {
    id: "facts_placement_waves",
    domain: "hiring_facts",
    title: "The truth about placement waves and second chances",
    content: (
      "Campus drives happen in several waves across the entire school year. In fact, more than half of graduating students " +
      "receive their highest offer in later drives between October and March, once the initial rush calms down. " +
      "You have plenty of time and plenty of opportunities ahead."
    ),
    metadata: { type: "reality", round: "final_round", focus: "waves" }
  },

  // ── Inspiring Real Senior Stories
  {
    id: "senior_story_graph_rebound",
    domain: "senior_stories",
    title: "Getting stuck on a graph question to landing an 18 LPA dream offer",
    content: (
      "A senior got completely stuck on a graph problem in Round 2 and left the room holding back tears. " +
      "They took a restful evening, practiced just 4 similar questions the next couple of days, " +
      "and cleared their next company drive only 6 days later, securing an 18 LPA software role."
    ),
    metadata: { type: "story", topic: "graphs", daysToBounce: 6 }
  },
  {
    id: "senior_story_dp_comeback",
    domain: "senior_stories",
    title: "From a fintech rejection to a top cloud engineering role",
    content: (
      "A student went blank during a dynamic programming question in Round 2 and felt like giving up on coding. " +
      "Instead of restarting everything, they spent two days sketching out simple table patterns and resting. " +
      "Less than two weeks later, they cracked an interview at a global cloud tech company."
    ),
    metadata: { type: "story", topic: "dp", daysToBounce: 11 }
  },
  {
    id: "senior_story_multiple_test_failures",
    domain: "senior_stories",
    title: "Bouncing back after failing 5 tests in a row",
    content: (
      "One senior was rejected from 5 campus tests in August and felt like an imposter while peers got placed. " +
      "With a friend's help, they found it was just a tiny integer overflow bug in their templates. " +
      "Once resolved, they cleared 3 interview rounds in October and had their pick of offers."
    ),
    metadata: { type: "story", topic: "oa_recovery", daysToBounce: 14 }
  },
  {
    id: "senior_story_interview_freeze",
    domain: "senior_stories",
    title: "Overcoming a live interview freeze to get placed at a top company",
    content: (
      "A student froze up completely during a live coding interview and couldn't type a single line. " +
      "They learned to take a calm breath and say: 'Let me take 30 seconds to think out loud with you.' " +
      "In their very next drive, the interviewers praised how pleasant and clear they were to talk to."
    ),
    metadata: { type: "story", topic: "speech_anxiety", daysToBounce: 7 }
  }
];

// ── 2. CARING RETRIEVER ───────────────────────────────────────────────────────
export function retrieveGroundingChunks(userVent, stage = 'technical_2', targetTopic = '') {
  const query = `${userVent} ${stage} ${targetTopic}`.toLowerCase();
  
  const scored = KNOWLEDGE_CHUNKS.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();
    const titleLower = chunk.title.toLowerCase();

    const queryWords = query.split(/\W+/).filter(w => w.length > 2);
    queryWords.forEach(word => {
      if (titleLower.includes(word)) score += 3.5;
      if (contentLower.includes(word)) score += 1.5;
    });

    if (stage && chunk.metadata.round && chunk.metadata.round.includes(stage.toLowerCase())) {
      score += 4.0;
    }
    if (targetTopic && chunk.metadata.topic && chunk.metadata.topic.includes(targetTopic.toLowerCase())) {
      score += 4.5;
    }

    if (/not cut out|give up|quit|never|worthless|hopeless|dumb/i.test(userVent) && chunk.metadata.pattern === 'self_doubt') {
      score += 4.0;
    }
    if (/everyone else|everybody|friends|batch|unplaced/i.test(userVent) && chunk.metadata.pattern === 'comparison') {
      score += 4.0;
    }
    if (/round 2|seat|quota|shortlist/i.test(userVent) && chunk.id === 'facts_seat_limits_round2') {
      score += 5.0;
    }

    return { ...chunk, score };
  });

  const bestMindset = scored.filter(c => c.domain === 'kind_mindset').sort((a, b) => b.score - a.score)[0] || KNOWLEDGE_CHUNKS[0];
  const bestFact = scored.filter(c => c.domain === 'hiring_facts').sort((a, b) => b.score - a.score)[0] || KNOWLEDGE_CHUNKS[4];
  const bestStory = scored.filter(c => c.domain === 'senior_stories').sort((a, b) => b.score - a.score)[0] || KNOWLEDGE_CHUNKS[8];

  return [bestMindset, bestFact, bestStory];
}

// ── 3. FRIENDLY, WARM RECOVERY GENERATOR ──────────────────────────────────────
export async function generateMoodRecoveryRAG({
  userVent,
  stage = 'technical_2',
  companyType = 'Campus Drive',
  specificTopic = ''
}) {
  const retrievedChunks = retrieveGroundingChunks(userVent, stage, specificTopic);
  const [mindsetDoc, factDoc, storyDoc] = retrievedChunks;

  // Gentle, empathetic pattern identification
  let thoughtPattern = "Feeling like you're not good enough or that you failed";
  let gentleExplanation = "Your mind is being extra hard on you right now because you care so much. It's trying to turn one difficult moment into a big story about your whole future, but that simply isn't true.";

  if (/everyone|everybody|friends|batch|left behind/i.test(userVent)) {
    thoughtPattern = "Comparing your journey to everyone around you";
    gentleExplanation = "Seeing friends get placed while you're still waiting makes you feel left out. But their timeline is not yours, and your moment to shine will come very soon.";
  } else if (/quit|give up|not built|not cut out|dumb|useless/i.test(userVent)) {
    thoughtPattern = "The fear that you aren't cut out for software engineering";
    gentleExplanation = "When one round doesn't go your way, it feels like proof that you can't do this. But that's just the disappointment speaking, not the truth of your talent.";
  } else if (/future|never get placed|doomed|unemployed/i.test(userVent)) {
    thoughtPattern = "Worrying about your entire career over one company";
    gentleExplanation = "It's so easy to worry that one rejected drive means you'll never get placed. But placement season is long and full of fresh starts.";
  }

  // Identify what small detail was tricky
  let trickyThing = "a tricky question or an unexpected test case";
  if (/graph|tree|dfs|bfs|traversal/i.test(userVent)) {
    trickyThing = "a tricky graph or tree problem";
  } else if (/dp|dynamic programming|memoization|knapsack/i.test(userVent)) {
    trickyThing = "a dynamic programming question";
  } else if (/sql|database|query|joins/i.test(userVent)) {
    trickyThing = "a complex database query";
  } else if (/freeze|blank|stutter|nervous|speech/i.test(userVent)) {
    trickyThing = "getting nervous and feeling on the spot in the live interview";
  } else if (/oa|timeout|test case|tle/i.test(userVent)) {
    trickyThing = "strict time limits on hidden test cases";
  }

  return {
    success: true,
    retrievedEvidence: retrievedChunks,
    diagnosis: {
      distortionType: thoughtPattern,
      mechanism: gentleExplanation,
      cbtAnchor: mindsetDoc.content
    },
    realityCheck: {
      pipelineMetric: factDoc.title,
      factualContext: factDoc.content,
      stageAnalysis: `In campus drives, companies have very tight seat limits. Getting turned away is mostly about crowded rooms, not whether you are capable.`
    },
    gapSeparation: {
      isolatedVariable: trickyThing,
      competenceVsWorth: `Getting stuck on ${trickyThing} today doesn't take away all the hours you've put in. You are still the same smart, hardworking student with so much to offer.`
    },
    precedentAnchor: {
      caseTitle: storyDoc.title,
      alumniTrajectory: storyDoc.content,
      actionableReboundPlan: [
        "Take the rest of today completely off to rest, eat something you love, and give your mind a gentle break.",
        `Tomorrow, spend just 30 calm minutes looking over ${trickyThing} without any pressure or self-judgment.`,
        "Remember that new campus drives and opportunities arrive every week. Your story isn't over—it's just getting started."
      ]
    }
  };
}
