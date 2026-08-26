// NeuroPrep Cognitive Decision Engine & Analytics Service

// Authentic Cognitive Behavioral Therapy (CBT) Distortion Database
export const DISTORTIONS = {
  CATASTROPHIZING: {
    name: "Catastrophizing",
    keywords: ["always fail", "never get placed", "ruined", "end of my career", "disaster", "impossible", "hopeless", "ruin", "rejected everywhere"],
    explanation: "Assuming the worst possible outcome will occur without factual evidence.",
    reframingQuestion: "What is the objective, most probable outcome based on your past preparation?",
    balancedThought: "One difficult interview or test does not determine my entire placement outcome. I can refine weak areas and succeed in upcoming drives."
  },
  OVERGENERALIZATION: {
    name: "Overgeneralization",
    keywords: ["everyone else is better", "i always", "i never", "no one", "every single time", "all companies", "every test"],
    explanation: "Interpreting a single setback as an endless pattern of defeat.",
    reframingQuestion: "Have you successfully solved coding problems or cleared academic assessments before?",
    balancedThought: "This specific problem set was challenging, but I have mastered other concepts through practice."
  },
  MIND_READING: {
    name: "Mind Reading",
    keywords: ["interviewer thinks i am dumb", "they hated me", "they will reject me", "everybody judges me", "people think i can't"],
    explanation: "Presuming to know what interviewers or evaluators think without objective proof.",
    reframingQuestion: "What concrete feedback was provided during the technical assessment?",
    balancedThought: "Interviewers evaluate technical clarity against standard rubrics; neutral expressions are standard interview protocol."
  },
  BLACK_AND_WHITE: {
    name: "Black-and-White Thinking",
    keywords: ["perfect or failure", "complete waste", "either 100% or zero", "useless", "worthless", "failed"],
    explanation: "Viewing performance in extreme all-or-nothing terms rather than recognizing partial mastery.",
    reframingQuestion: "What progress did you demonstrate even if the final result wasn't 100%?",
    balancedThought: "I correctly implemented core logic even if edge cases were tricky. I am making steady progress."
  }
};

/**
 * Calculates Placement Readiness Score based on 5 weighted dimensions.
 */
export function calculatePlacementReadiness({
  codingScore = 0,
  interviewScore = 0,
  aptitudeScore = 0,
  communicationScore = 0,
  profileCompletion = 0,
  stressManagement = 0
}) {
  const aptiScoreValue = aptitudeScore || communicationScore || 0;
  const readiness = 
    (codingScore * 0.35) +
    (interviewScore * 0.25) +
    (aptiScoreValue * 0.20) +
    (profileCompletion * 0.10) +
    (stressManagement * 0.10);

  return Math.min(100, Math.max(0, Math.round(readiness)));
}

/**
 * Calculates Stress-Adaptive Mock Interview parameters.
 */
export function getAdaptiveInterviewSettings(stressLevel, confidenceLevel) {
  if (stressLevel >= 7 || confidenceLevel <= 3) {
    return {
      difficulty: "Foundation / Easy",
      speakingSpeed: "Slower Pace (120 WPM)",
      hintsEnabled: true,
      adaptiveTone: "Supportive, Encouraging & Patient",
      questionComplexity: "Fundamental concepts & guided coding prompts",
      timeLimitSeconds: 120,
      stressCategory: "High Stress"
    };
  } else if (stressLevel >= 4 || confidenceLevel <= 6) {
    return {
      difficulty: "Intermediate",
      speakingSpeed: "Standard Pace (150 WPM)",
      hintsEnabled: true,
      adaptiveTone: "Constructive & Professional",
      questionComplexity: "Standard algorithmic & scenario questions",
      timeLimitSeconds: 90,
      stressCategory: "Moderate Stress"
    };
  } else {
    return {
      difficulty: "Advanced / Pressure Test",
      speakingSpeed: "Rapid & Demanding (180 WPM)",
      hintsEnabled: false,
      adaptiveTone: "Strict, Realistic Placement Panel Tone",
      questionComplexity: "Complex system design, edge cases & rapid follow-ups",
      timeLimitSeconds: 60,
      stressCategory: "Low Stress / High Confidence"
    };
  }
}

/**
 * Analyzes journal text for emotional balance, supportive effort validation ("Here's what I noticed"),
 * thinking patterns to explore (soft CBT), positive memory extraction, hope extraction, and 3-part positive conclusion.
 */
export function analyzeThoughtText(text) {
  if (!text || text.trim().length === 0) {
    return {
      emotionalBalance: "🌤 Mixed Day",
      validation: "Writing out your feelings is a gentle, healthy step toward mental clarity. Taking a moment for yourself today matters.",
      thinkingPattern: null,
      reframingQuestions: {
        evidenceFor: "What evidence makes this thought feel true right now?",
        evidenceAgainst: "What evidence shows you have handled challenges before?",
        bestFriendAdvice: "What would you tell your best friend if they were feeling this way?",
        alternativeExplanation: "Could there be another explanation that is gentler on yourself?"
      },
      positiveMemoriesExtracted: [],
      hopeNoteExtracted: null,
      positiveConclusion: {
        whatYouDidToday: "You took time out of your busy schedule to pause, reflect, and check in with yourself.",
        whatYouMightTryTomorrow: "Take one small 15-minute step toward your target company prep without pressure.",
        gentleReminder: "Progress during placement preparation is built through many small efforts. Today's entry is one of them."
      },
      suggestedActions: [
        { category: "🌿 Calm Corner", action: "Take 2 minutes for slow Box Breathing", tab: "recovery" },
        { category: "🎯 Gentle Step", action: "Review 1 fundamental concept without pressure", tab: "aptitude" }
      ]
    };
  }

  const lowerText = text.toLowerCase();
  const detected = [];

  Object.keys(DISTORTIONS).forEach(key => {
    const dist = DISTORTIONS[key];
    const matched = dist.keywords.some(word => lowerText.includes(word));
    if (matched) {
      detected.push(dist);
    }
  });

  // Emotional Balance rating (replacing Sentiment Score)
  let emotionalBalance = "🌤 Mixed Day";
  const hasNegativeWords = lowerText.includes("fail") || lowerText.includes("sad") || lowerText.includes("stress") || lowerText.includes("anxious") || lowerText.includes("scared") || lowerText.includes("worried") || lowerText.includes("overwhelmed") || lowerText.includes("exhausted");
  const hasPositiveWords = lowerText.includes("good") || lowerText.includes("happy") || lowerText.includes("confident") || lowerText.includes("cleared") || lowerText.includes("solved") || lowerText.includes("proud") || lowerText.includes("hope") || lowerText.includes("improved");

  if (hasPositiveWords && !hasNegativeWords) {
    emotionalBalance = "☀ Mostly Positive Day";
  } else if (hasNegativeWords && !hasPositiveWords) {
    emotionalBalance = "🌧 Mostly Difficult Day";
  } else {
    emotionalBalance = "🌤 Mixed Day";
  }

  // Determine core theme
  let theme = "General Placement Reflection";
  if (lowerText.includes("code") || lowerText.includes("dsa") || lowerText.includes("leet") || lowerText.includes("test case") || lowerText.includes("bug") || lowerText.includes("tree") || lowerText.includes("array")) {
    theme = "Coding & Technical Progress";
  } else if (lowerText.includes("interview") || lowerText.includes("speak") || lowerText.includes("hr") || lowerText.includes("panel") || lowerText.includes("mock")) {
    theme = "Mock Interview & Speaking";
  } else if (lowerText.includes("peer") || lowerText.includes("friend") || lowerText.includes("everyone") || lowerText.includes("placed") || lowerText.includes("compare")) {
    theme = "Peer Experience & Placement Journey";
  } else if (lowerText.includes("time") || lowerText.includes("late") || lowerText.includes("exam") || lowerText.includes("deadline") || lowerText.includes("tired")) {
    theme = "Energy & Daily Balance";
  }

  // Effort-validating "Here's what I noticed" narrative
  let validation = "";
  let whatYouDidToday = "";
  let whatYouMightTryTomorrow = "";
  let gentleReminder = "Progress during placement preparation is built through many small efforts. Today's entry is one of them.";

  switch (theme) {
    case "Coding & Technical Progress":
      validation = "You seem to be tackling complex technical topics today. Even when code doesn't compile or test cases fail on the first try, your persistence shows you are building real algorithmic intuition.";
      whatYouDidToday = "You engaged with coding logic and stayed focused on problem-solving despite technical friction.";
      whatYouMightTryTomorrow = "Break down 1 complex algorithm into pseudocode on paper before writing code.";
      break;

    case "Mock Interview & Speaking":
      validation = "Putting your thoughts into words under pressure takes effort. You reflected on your interview communication today, which proves your determination to improve.";
      whatYouDidToday = "You acknowledged your performance openly and prioritized communication growth.";
      whatYouMightTryTomorrow = "Practice speaking your thoughts aloud for 3 minutes during an easy mock question.";
      break;

    case "Peer Experience & Placement Journey":
      validation = "Campus placement season creates intense noise. You took time today to focus inward on your own journey, which is a key sign of emotional self-awareness.";
      whatYouDidToday = "You honored your unique timeline instead of getting lost in surrounding chatter.";
      whatYouMightTryTomorrow = "Focus on your custom target company checklist and celebrate your own milestones.";
      break;

    case "Energy & Daily Balance":
      validation = "You worked hard today even while feeling tired or managing multiple academic deadlines. Recognizing your energy level is a strength, not a weakness.";
      whatYouDidToday = "You pushed through a heavy day and took a quiet moment to record your thoughts.";
      whatYouMightTryTomorrow = "Ensure you get 7+ hours of rest and start tomorrow with a 5-minute stretch.";
      break;

    default:
      validation = "You took time to write down your thoughts today. Staying consistent with self-reflection during placement prep builds mental resilience.";
      whatYouDidToday = "You checked in with yourself and gave your thoughts a safe space to breathe.";
      whatYouMightTryTomorrow = "Pick one tiny action item for tomorrow and complete it with zero pressure.";
      break;
  }

  // Thinking Pattern to Explore (Soft CBT)
  let thinkingPattern = null;
  if (detected.length > 0) {
    const first = detected[0];
    thinkingPattern = {
      name: first.name === "Catastrophizing" ? "All-or-Nothing Thinking" : first.name,
      originalThought: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
      explanation: first.explanation,
      reframingQuestions: {
        evidenceFor: "What evidence makes this thought feel true right now?",
        evidenceAgainst: "What achievements or past successes contradict this worry?",
        bestFriendAdvice: "What compassionate advice would you give your closest friend in this situation?",
        alternativeExplanation: first.reframingQuestion
      },
      balancedPerspective: first.balancedThought
    };
  } else if (hasNegativeWords) {
    thinkingPattern = {
      name: "Focusing on set-backs over progress",
      originalThought: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
      explanation: "Temporarily zooming in on current difficulty while overlooking your steady cumulative growth.",
      reframingQuestions: {
        evidenceFor: "What specific hurdle is making things feel tough today?",
        evidenceAgainst: "What skills have you learned over the past few weeks that you didn't have before?",
        bestFriendAdvice: "How would you comfort a peer facing this exact challenge?",
        alternativeExplanation: "Is today just one difficult step in a much longer successful journey?"
      },
      balancedPerspective: "I struggled today, but one day or test does not define my abilities or my potential."
    };
  }

  // Automatic Positive Memory Extraction (Item 11)
  const positiveMemoriesExtracted = [];
  const lowerLines = text.split(/[.\n!?]+/);
  lowerLines.forEach(line => {
    const l = line.trim();
    if (!l) return;
    const lLower = l.toLowerCase();
    if (lLower.includes("solved") || lLower.includes("understood") || lLower.includes("appreciated") || lLower.includes("cleared") || lLower.includes("proud") || lLower.includes("finished") || lLower.includes("completed") || lLower.includes("mastered")) {
      positiveMemoriesExtracted.push(l);
    }
  });

  // Automatic Hope Note Extraction (Item 18)
  let hopeNoteExtracted = null;
  lowerLines.forEach(line => {
    const l = line.trim();
    if (!l) return;
    const lLower = l.toLowerCase();
    if (lLower.includes("keep trying") || lLower.includes("won't quit") || lLower.includes("wont quit") || lLower.includes("improved") || lLower.includes("getting better") || lLower.includes("will get") || lLower.includes("hopeful") || lLower.includes("can do it") || lLower.includes("try my best")) {
      hopeNoteExtracted = l;
    }
  });

  return {
    emotionalBalance,
    theme,
    validation, // "Here's what I noticed..."
    thinkingPattern, // Thinking patterns you might explore
    detectedDistortions: detected,
    positiveMemoriesExtracted,
    hopeNoteExtracted,
    positiveConclusion: {
      whatYouDidToday,
      whatYouMightTryTomorrow,
      gentleReminder
    },
    suggestedActions: [
      { category: "🌿 Calm Corner", action: "Spend 2 minutes in Box Breathing", tab: "recovery" },
      { category: "🌱 Tiny Action Plan", action: "Review 1 fundamental concept without pressure", tab: "aptitude" }
    ]
  };
}

/**
 * Analyzes speech communication transcripts for WPM, filler words, and fluency.
 */
export function analyzeSpeechCommunication(transcript, durationSeconds = 30) {
  if (!transcript || transcript.trim().length === 0) {
    return {
      wpm: 0,
      fillerCount: 0,
      detectedFillers: [],
      clarityScore: 70,
      fluencyRating: "Needs Spoken Response"
    };
  }

  const words = transcript.trim().split(/\s+/);
  const totalWords = words.length;
  const minutes = durationSeconds / 60;
  const wpm = Math.round(totalWords / (minutes || 1));

  const fillerList = ["um", "uh", "like", "basically", "actually", "you know", "literally", "so"];
  const detectedFillers = words.filter(w => fillerList.includes(w.toLowerCase().replace(/[^a-z]/g, '')));
  const fillerCount = detectedFillers.length;

  let clarityScore = 90 - (fillerCount * 5);
  if (wpm < 100 || wpm > 190) clarityScore -= 10;
  clarityScore = Math.max(40, Math.min(100, clarityScore));

  let fluencyRating = "Optimal Pace & Fluency";
  if (fillerCount > 5) fluencyRating = "High Filler Words Detected";
  else if (wpm < 110) fluencyRating = "Speaking Speed Too Slow";
  else if (wpm > 180) fluencyRating = "Speaking Speed Too Rapid";

  return {
    wpm,
    totalWords,
    fillerCount,
    detectedFillers: Array.from(new Set(detectedFillers)),
    clarityScore,
    fluencyRating
  };
}

/**
 * Online Compiler Test Case Runner Simulator
 */
export function runCompilerTestCases(code, language) {
  const hasSyntaxError = !code || code.trim().length < 10;
  if (hasSyntaxError) {
    return {
      passed: false,
      passCount: 0,
      totalCount: 5,
      time: "0ms",
      error: "Syntax Error or Empty Implementation"
    };
  }

  // Simulate test case passes
  return {
    passed: true,
    passCount: 5,
    totalCount: 5,
    time: "32ms",
    error: null
  };
}

/**
 * Simulates detailed PDF resume analysis and ATS scoring (Module 1).
 */
export function simulateResumeAnalysis(fileName, resumeText = "", targetRole = "Fullstack Developer") {
  const text = (resumeText || "").trim();
  const name = (fileName || "").toLowerCase();
  
  // 1. Core lists of tech tags to search for
  const tagDb = {
    languages: ["java", "python", "javascript", "typescript", "sql", "c++", "go", "rust", "ruby", "html", "css", "php", "swift"],
    frameworks: ["react", "angular", "vue", "node.js", "express", "django", "flask", "spring boot", "fastapi", "next.js", "jquery", "laravel"],
    tools_cloud: ["docker", "kubernetes", "aws", "git", "postgresql", "mongodb", "redis", "mysql", "ci/cd", "jenkins", "terraform", "firebase", "gcp"]
  };

  const foundSkills = {
    languages: [],
    frameworks: [],
    tools_cloud: []
  };

  let textToParse = text;
  
  // If no text is pasted, but a file is uploaded, let's create a simulated text based on the file name to feed the scanner!
  if (!textToParse) {
    if (name.includes("react") || name.includes("frontend") || name.includes("web") || name.includes("ui")) {
      textToParse = "React Developer. Skills: JavaScript, React, HTML, CSS, Git, Web Design. Created high performance frontend projects. 2 years experience.";
    } else if (name.includes("python") || name.includes("django") || name.includes("ml") || name.includes("data") || name.includes("ai")) {
      textToParse = "Python Engineer. Skills: Python, SQL, Git, Django, FastAPI, MongoDB. Worked on databases. 1 year of experience.";
    } else if (name.includes("java") || name.includes("spring") || name.includes("backend")) {
      textToParse = "Java Specialist. Skills: Java, Spring Boot, SQL, PostgreSQL, Git, Docker, microservices. Optimised queries. 3 years experience.";
    } else if (name.includes("senior") || name.includes("lead") || name.includes("experienced") || name.includes("resume_2")) {
      textToParse = "Senior Architect. Skills: Java, Python, TypeScript, Spring Boot, Docker, Kubernetes, AWS, SQL, Redis, CI/CD, Terraform. Managed team of 5. Improved latency by 40% and scale to 10k users. 5 years experience.";
    } else {
      // Default fallback profile based on the filename (e.g. appa.pdf)
      textToParse = `Candidate Resume for ${fileName || "Developer"}. Skills: Java, Python, JavaScript, SQL, React, Express, Node.js, Docker, Git, PostgreSQL, MongoDB. Experienced in building web services.`;
    }
  }

  const cleanText = textToParse.toLowerCase();

  // 2. Scan text for skills
  Object.keys(tagDb).forEach(category => {
    tagDb[category].forEach(tag => {
      // Escape regex special characters (like + in c++ or . in node.js)
      const escapedTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Use negative lookarounds instead of \b so that non-word endings like c++ match correctly
      const regex = new RegExp(`(?<!\\w)${escapedTag}(?!\\w)`, "i");
      if (regex.test(cleanText)) {
        const formattedTag = tag === "node.js" ? "Node.js" : tag === "spring boot" ? "Spring Boot" : tag === "fastapi" ? "FastAPI" : tag === "next.js" ? "Next.js" : tag.charAt(0).toUpperCase() + tag.slice(1);
        foundSkills[category].push(formattedTag);
      }
    });
  });

  // Ensure there's at least some fallback skills if parsing results in empty
  if (foundSkills.languages.length === 0 && foundSkills.frameworks.length === 0 && foundSkills.tools_cloud.length === 0) {
    foundSkills.languages = ["Java", "SQL"];
    foundSkills.frameworks = ["React"];
    foundSkills.tools_cloud = ["Git"];
  }

  // 3. Extract Links
  const githubMatch = textToParse.match(/github\.com\/[a-zA-Z0-9_-]+/i);
  const linkedinMatch = textToParse.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  
  const contact = {
    github: githubMatch ? `https://${githubMatch[0]}` : "https://github.com/candidate-developer",
    linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "https://linkedin.com/in/candidate-placement-ready"
  };

  // 4. Extract Experience Level
  let experienceLevel = "Beginner (0-1 Years)";
  const expMatch = textToParse.match(/(\d+)\+?\s*(?:year|yr)s?\s*(?:of)?\s*(?:exp|experience)/i);
  if (expMatch) {
    const years = parseInt(expMatch[1]);
    if (years >= 5) experienceLevel = "Experienced (5+ Years)";
    else if (years >= 2) experienceLevel = "Experienced (2-4 Years)";
    else experienceLevel = `Beginner (${years} Year${years > 1 ? 's' : ''})`;
  } else {
    if (cleanText.includes("senior") || cleanText.includes("lead") || cleanText.includes("architect")) {
      experienceLevel = "Experienced (3-5 Years)";
    } else if (cleanText.includes("intern") || cleanText.includes("student") || cleanText.includes("fresher")) {
      experienceLevel = "Beginner (0-1 Years)";
    }
  }

  // 5. Scanners for Metrics presence
  const hasMetrics = cleanText.includes("%") || 
                     cleanText.includes("percent") || 
                     cleanText.includes("latency") || 
                     cleanText.includes("uptime") || 
                     /\b\d+(?:k|m|million|usd)\b/.test(cleanText) ||
                     /\b(reduced|optimized|increased|saved|led|managed)\b.*\d+/.test(cleanText);

  // 6. Compute scoring components dynamically
  const roleTargetKeywords = {
    "frontend developer": ["javascript", "typescript", "react", "html", "css", "next.js", "tailwind", "sass", "webpack"],
    "backend engineer": ["java", "spring boot", "python", "fastapi", "sql", "postgresql", "docker", "redis", "mongodb", "kafka", "express"],
    "fullstack developer": ["java", "python", "javascript", "react", "docker", "git", "sql", "node.js", "express", "mongodb"],
    "data scientist / ai engineer": ["python", "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn", "sql", "r", "math"],
    "devops & cloud engineer": ["aws", "docker", "kubernetes", "terraform", "jenkins", "git", "ci/cd", "linux", "ansible"]
  };

  const normRole = targetRole.toLowerCase().trim();
  let targetKeywords = roleTargetKeywords["fullstack developer"];
  for (const [key, list] of Object.entries(roleTargetKeywords)) {
    if (normRole.includes(key) || key.includes(normRole)) {
      targetKeywords = list;
      break;
    }
  }

  const matchedTargetCount = targetKeywords.filter(tk => cleanText.includes(tk)).length;
  const keyword_alignment_score = Math.min(100, Math.max(40, 40 + Math.round(matchedTargetCount * (50 / targetKeywords.length)) + (Object.values(foundSkills).flat().length * 1.5)));

  const quantifiable_impact_score = hasMetrics ? Math.floor(82 + Math.random() * 12) : Math.floor(55 + Math.random() * 15);

  const lengthPen = Math.max(10, Math.min(30, textToParse.length / 25));
  const formatting_readability_score = Math.min(98, Math.max(50, 70 + lengthPen));

  const overall_score = Math.round(
    (keyword_alignment_score * 0.4) + 
    (quantifiable_impact_score * 0.3) + 
    (formatting_readability_score * 0.3)
  );

  // 7. Missing keywords checks
  const roleKeywords = {
    "frontend developer": ["TypeScript", "Tailwind CSS", "Next.js", "GraphQL", "Auto-testing", "Webpack", "Redux Toolkit", "Sass"],
    "backend engineer": ["Redis Caching", "Kafka Streams", "Docker Setup", "Kubernetes", "API Security", "PostgreSQL", "GraphQL", "CI/CD Setup"],
    "fullstack developer": ["Cloud Setup", "Caching", "Auto-testing", "TypeScript", "AWS Hosting", "GraphQL", "Kubernetes", "CI/CD Setup"],
    "data scientist / ai engineer": ["TensorFlow", "PyTorch", "scikit-learn", "SQL Querying", "Pandas DataFrames", "Docker", "Model Tuning", "MLOps"],
    "devops & cloud engineer": ["Kubernetes", "Terraform IaC", "Jenkins CI/CD", "Ansible Playbooks", "AWS Hosting", "Docker", "Linux Shell", "Prometheus"]
  };

  const normalizedRole = targetRole.toLowerCase().trim();
  let allKeywordsList = roleKeywords["fullstack developer"];
  for (const [key, list] of Object.entries(roleKeywords)) {
    if (normalizedRole.includes(key) || key.includes(normalizedRole)) {
      allKeywordsList = list;
      break;
    }
  }

  const currentSkillsSet = new Set(Object.values(foundSkills).flat().map(s => s.toLowerCase()));
  const missing_high_priority_keywords = allKeywordsList.filter(kw => !currentSkillsSet.has(kw.toLowerCase())).slice(0, 5);

  // Strong domains
  const detected_strong_domains = [];
  if (cleanText.includes("react") || cleanText.includes("html") || cleanText.includes("css")) {
    detected_strong_domains.push("Frontend Web Design");
  }
  if (cleanText.includes("node") || cleanText.includes("java") || cleanText.includes("python") || cleanText.includes("django")) {
    detected_strong_domains.push("API Creation");
  }
  if (cleanText.includes("sql") || cleanText.includes("postgres") || cleanText.includes("mongodb")) {
    detected_strong_domains.push("Database Setup");
  }
  if (detected_strong_domains.length === 0) {
    detected_strong_domains.push("General Coding");
  }

  // Improvements
  const actionable_resume_improvements = [];
  if (!hasMetrics) {
    actionable_resume_improvements.push("Try adding some simple numbers to your projects! For example, tell us how many people used your app, or how much faster it became after your changes.");
  } else {
    actionable_resume_improvements.push("Great job adding numbers! To make it even stronger, connect each number to what you specifically did (e.g. 'Reduced loading time by 20% by optimization').");
  }
  
  const hasCloud = cleanText.includes("aws") || cleanText.includes("docker") || cleanText.includes("cloud") || cleanText.includes("kubernetes");
  if (!hasCloud) {
    actionable_resume_improvements.push("Adding a mention of how you shared your project online (like hosting it on GitHub Pages, Netlify, or AWS) is a great way to show practical skills.");
  } else {
    actionable_resume_improvements.push("You mentioned cloud hosting. Adding how you automate testing or deployment (using GitHub Actions, for example) shows excellent workflow skills!");
  }

  return {
    overall_score,
    keyword_alignment_score,
    quantifiable_impact_score,
    formatting_readability_score,
    parsed_profile: {
      contact,
      technical_skills: foundSkills,
      projects: [
        {
          title: "Stress-Adaptive Placement Aider",
          technologies: ["React", "Vanilla CSS", "Vite"],
          has_metrics: hasMetrics,
          raw_text: textToParse.substring(0, 150)
        }
      ],
      experience_level: experienceLevel,
      education: [
        {
          degree: "B.Tech in Computer Science and Engineering",
          year: "2026"
        }
      ]
    },
    ats_insights: {
      missing_high_priority_keywords,
      detected_strong_domains,
      actionable_resume_improvements
    }
  };
}

/**
 * Parses code structure on client side to simulate static AST Complexity Analysis (Module 4).
 */
export function analyzeASTComplexity(code, language) {
  if (!code || code.trim().length < 10) {
    return {
      cyclomaticComplexity: 1,
      nestingDepth: 0,
      timeComplexity: "O(1)",
      spaceComplexity: "O(1)",
      issues: ["Empty or too short implementation"]
    };
  }

  const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, ""); // strip comments
  
  // Calculate simulated cyclomatic complexity by counting control structures
  const controls = (cleanCode.match(/\b(if|for|while|catch|&&|\|\||case)\b/g) || []).length;
  const cyclomaticComplexity = controls + 1;

  // Calculate simulated nesting depth by counting curly brace depths
  let maxDepth = 0;
  let currentDepth = 0;
  for (let char of cleanCode) {
    if (char === '{') {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    } else if (char === '}') {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }

  // Guess time complexity by checking loop patterns
  let timeComplexity = "O(1)";
  const forMatches = (cleanCode.match(/\b(for|while)\b/g) || []).length;
  if (forMatches === 1) {
    timeComplexity = "O(N)";
  } else if (forMatches > 1) {
    // Check if loops are nested by looking at braces depth sequence or simply guess O(N^2)
    timeComplexity = maxDepth >= 2 ? "O(N^2)" : "O(N)";
  }

  // Guess space complexity by checking dynamic storage keywords
  let spaceComplexity = "O(1)";
  if (cleanCode.includes("new Set") || cleanCode.includes("new Map") || cleanCode.includes("[]") || cleanCode.includes("new ArrayList") || cleanCode.includes("new HashMap") || cleanCode.includes("set()") || cleanCode.includes("dict()")) {
    spaceComplexity = "O(N)";
  }

  const issues = [];
  if (cyclomaticComplexity > 6) {
    issues.push("High branching complexity detected. Consider breaking logic into smaller helper functions.");
  }
  if (maxDepth > 3) {
    issues.push("Deep nesting detected (level " + maxDepth + "). Clean up nested conditionals or loops.");
  }

  return {
    cyclomaticComplexity,
    nestingDepth: maxDepth,
    timeComplexity,
    spaceComplexity,
    issues: issues.length > 0 ? issues : ["Code structure is clean & follows standard practices."]
  };
}

/**
 * Returns simulated AI responses for the Multi-Agent Group Discussion (Module 3 - Round 3).
 * Personas: Analyst (Data/Metrics), Skeptic (Challenges), Moderator (Flow/Pacing).
 */
export function getGroupDiscussionResponse(userMessage, turnCount = 0) {
  const userMsgClean = (userMessage || "").toLowerCase();
  
  // Personas respond sequentially or concurrently with unique angles
  const responses = [
    {
      agent: "Moderator",
      avatar: "👤",
      style: "border-left: 3px solid #111827",
      message: turnCount === 0 
        ? "Welcome, everyone. Today's group discussion focuses on system design trade-offs: Monolithic vs Microservices architectures. Candidate, thank you for starting. Let's hear the reactions of our group before moving on." 
        : `Thank you for those points, Candidate. Let us weigh this. Analyst, could you give us the performance metrics of the candidate's proposed design?`
    },
    {
      agent: "Analyst",
      avatar: "📈",
      style: "border-left: 3px solid #6B7280",
      message: userMsgClean.includes("microservice") || userMsgClean.includes("scale") 
        ? "Checking the metrics: Microservice deployments see a 40% rise in operational latency due to network hops. However, development speed increases by 35% across larger teams. Candidate's point on separation of concern is highly valid in modular code bases." 
        : "Looking at the data structure, database indexing can speed up lookups by 85% at the cost of 12% storage overhead. We must optimize the read-to-write ratios of our system configuration before making a deployment layout decision."
    },
    {
      agent: "Skeptic",
      avatar: "🧐",
      style: "border-left: 3px solid #E5E7EB",
      message: userMsgClean.includes("nosql") || userMsgClean.includes("sql") 
        ? "That database scaling strategy sounds nice, but what about ACID compliance? If network partitions happen—which CAP theorem states will happen—how will you prevent stale data reads? Candidate, you overlooked consistency constraints." 
        : "Is this approach really modular? If one microservice fails, cascading failures can bring down the entire API gateway unless circuit breakers are introduced. I challenge this layout as a potential single point of failure."
    }
  ];

  return responses;
}

/**
 * Simulates XGBoost Fusion Engine telemetry points over time (Module 7).
 */
export function generateFusionTelemetry(secondsElapsed = 0) {
  // Generate random stress, confidence and readiness metrics with consistent trend lines
  const time = secondsElapsed;
  
  // Stress cycles: starts moderate, goes high during difficult queries, recovers
  let stress = 45 + Math.sin(time / 20) * 15 + (Math.random() - 0.5) * 8;
  // Confidence increases slowly as user handles more questions
  let confidence = 50 + (time / 10) + Math.cos(time / 30) * 10 + (Math.random() - 0.5) * 5;
  // Readiness is a weighted fusion of both
  let readiness = (confidence * 1.2) - (stress * 0.4) + 20;

  stress = Math.min(100, Math.max(10, Math.round(stress)));
  confidence = Math.min(100, Math.max(10, Math.round(confidence)));
  readiness = Math.min(100, Math.max(10, Math.round(readiness)));

  return {
    time,
    stress,
    confidence,
    readiness
  };
}

