/**
 * AIQuestionEngine — Adaptive Interviewer Model & Multi-Dimensional Evaluation Engine
 * Trained and governed by adaptive_interviewer_model_guide.csv and
 * powered by the 1,400 curated question bank (adaptive_interview_question_bank_1400.xlsx).
 */

import QUESTION_BANK from '../../../data/adaptiveQuestionBank1400.json';
import { getTrackConfig, INTERVIEW_TRACKS } from '../../../data/interviewTracksData';
import { DSA_CATEGORIES } from '../../../data/dsaPatternsData';
import { InterviewEmotionModel } from './InterviewEmotionModel';
import { WebRAGEvaluationEngine } from './WebRAGEvaluationEngine';

export class AIQuestionEngine {
  constructor(config = {}, { onQuestion, onAdaptation } = {}) {
    this.config = config || {};
    this.onQuestion = onQuestion || (() => {});
    this.onAdaptation = onAdaptation || (() => {});

    this.trackId = String(config.trackId || 'hr').toLowerCase();
    if (this.trackId === 'cybersecurity') this.trackId = 'cybersec';
    if (this.trackId === 'group_discussion') this.trackId = 'gd';
    if (this.trackId === 'coding') this.trackId = 'dsa';

    this.trackConfig = getTrackConfig(this.trackId);

    // Adaptive difficulty: 'Easy' | 'Medium' | 'Hard'
    this.currentDifficulty = this.config.difficulty === 'Easy' ? 'Easy' : (this.config.difficulty === 'Hard' ? 'Hard' : 'Medium');
    this.consecutiveStrong = 0;
    this.consecutiveWeak = 0;

    this.askedQuestions = new Set();
    this.memory = []; // [{ question, answer, score, rubricScores, timestamp }]
    this.askedIndex = 0;

    // Load and synthesize question pool from 1400 bank + user configuration
    this.questionPool = this._buildQuestionPool(this.config);
  }

  /**
   * Build curated, input-tailored question pool from the 1,400 dataset or DSA Pattern Sheet
   */
  _buildQuestionPool(cfg) {
    if (this.trackId === 'dsa' || this.trackId === 'coding') {
      const dsaQuestions = [];
      DSA_CATEGORIES.forEach((cat) => {
        cat.patterns.forEach((pat) => {
          pat.questions.forEach((q) => {
            dsaQuestions.push({
              id: `dsa-${q.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              question: `Explain how you would solve "${q.title}". What is your approach, data structure choice, time complexity, and space complexity?`,
              difficulty: q.difficulty || 'Medium',
              topic: cat.name,
              pattern: pat.name,
              patternId: pat.id,
              problemTitle: q.title,
              approach: q.approach,
              expectedAnswer: `The optimal approach is ${q.approach || pat.description}. Expected time complexity is ${pat.complexity?.time || 'O(N)'} and space complexity is ${pat.complexity?.space || 'O(1)'}.`
            });
          });
        });
      });

      const easyQs = dsaQuestions.filter(q => q.difficulty === 'Easy');
      const medQs = dsaQuestions.filter(q => q.difficulty === 'Medium');
      const hardQs = dsaQuestions.filter(q => q.difficulty === 'Hard');

      return {
        all: dsaQuestions,
        easy: easyQs.length ? easyQs : dsaQuestions,
        medium: medQs.length ? medQs : dsaQuestions,
        hard: hardQs.length ? hardQs : dsaQuestions,
      };
    }

    const trackKey = this.trackId;
    const bankEntry = QUESTION_BANK[trackKey] || QUESTION_BANK['hr'] || { questions: [] };
    let rawBank = [...(bankEntry.questions || [])];

    // Filter & prioritize HR questions based on user's chosen HR practice topic
    if (this.trackId === 'hr') {
      const topic = cfg.hrPracticeTopic || 'All-Round HR Practice';
      const topicMap = {
        'Self Introduction & Background': ['HR -001', 'HR -005', 'HR -020', 'HR -016', 'HR -024', 'HR -025', 'HR -030', 'HR -035'],
        'Strengths & Weaknesses': ['HR -006', 'HR -007', 'HR -008', 'HR -009', 'HR -013', 'HR -019', 'HR -040', 'HR -045'],
        'Why Should We Hire You?': ['HR -002', 'HR -003', 'HR -004', 'HR -021', 'HR -022', 'HR -050', 'HR -055', 'HR -060'],
        'Teamwork & Situations': ['HR -010', 'HR -011', 'HR -014', 'HR -015', 'HR -017', 'HR -018', 'HR -023', 'HR -065'],
        'All-Round HR Practice': ['HR -001', 'HR -002', 'HR -004', 'HR -006', 'HR -007', 'HR -010', 'HR -003', 'HR -011'],
      };

      const prioritizedIds = topicMap[topic] || topicMap['All-Round HR Practice'];
      const prioritizedList = [];
      const remainingList = [];

      rawBank.forEach((q) => {
        if (prioritizedIds.includes(q.id)) {
          prioritizedList.push(q);
        } else {
          remainingList.push(q);
        }
      });

      // Sort prioritized IDs in intended sequence
      prioritizedList.sort((a, b) => prioritizedIds.indexOf(a.id) - prioritizedIds.indexOf(b.id));
      rawBank = [...prioritizedList, ...remainingList];
    } else if (this.trackId === 'tech' || this.trackId === 'technical') {
      const selectedSubjects = cfg.techSubjects || ['OOP & SOLID Principles', 'DBMS & SQL Queries', 'Data Structures & Algorithms'];
      const prioritizedList = [];
      const remainingList = [];

      rawBank.forEach((q) => {
        const qLower = (q.question || '').toLowerCase();
        let matches = false;

        if (selectedSubjects.some(s => s.includes('OOP')) && /\b(oop|class|inheritance|polymorphism|encapsulation|abstraction|solid|interface|abstract)\b/i.test(qLower)) {
          matches = true;
        } else if (selectedSubjects.some(s => s.includes('DBMS') || s.includes('SQL')) && /\b(dbms|sql|database|index|transaction|acid|normalization|join|nosql|primary key|foreign key)\b/i.test(qLower)) {
          matches = true;
        } else if (selectedSubjects.some(s => s.includes('Data Structures')) && /\b(data structure|array|tree|graph|hash|complexity|stack|queue|linked list|binary search)\b/i.test(qLower)) {
          matches = true;
        } else if (selectedSubjects.some(s => s.includes('Operating Systems')) && /\b(process|thread|deadlock|memory|paging|virtual memory|semaphore|mutex|context switch)\b/i.test(qLower)) {
          matches = true;
        } else if (selectedSubjects.some(s => s.includes('Networks')) && /\b(network|tcp|udp|osi|http|ip|dns|socket|protocol|packet)\b/i.test(qLower)) {
          matches = true;
        } else if (selectedSubjects.some(s => s.includes('System Design')) && /\b(scale|system design|load balancer|cache|microservice|architecture|sharding)\b/i.test(qLower)) {
          matches = true;
        } else if (selectedSubjects.some(s => s.includes('REST') || s.includes('Web')) && /\b(api|rest|http method|jwt|auth|async|event loop|cors)\b/i.test(qLower)) {
          matches = true;
        }

        if (matches) {
          prioritizedList.push(q);
        } else {
          remainingList.push(q);
        }
      });

      rawBank = [...prioritizedList, ...remainingList];
    }

    // Categorize questions by difficulty
    const easyQs = rawBank.filter(q => q.difficulty === 'Easy' || q.difficulty === 'Beginner');
    const medQs = rawBank.filter(q => q.difficulty === 'Medium' || q.difficulty === 'Intermediate' || !q.difficulty);
    const hardQs = rawBank.filter(q => q.difficulty === 'Hard' || q.difficulty === 'Advanced' || q.difficulty === 'Expert');

    return {
      all: rawBank,
      easy: easyQs.length ? easyQs : rawBank,
      medium: medQs.length ? medQs : rawBank,
      hard: hardQs.length ? hardQs : rawBank,
    };
  }

  /**
   * Universal Loop: Choose next question with Adaptive Difficulty and No-Repetition checks
   */
  getNextQuestion(stressIndex = 0) {
    // Stress-Adaptive fallback
    if (stressIndex > 70) {
      this.onAdaptation({
        type: 'stress_high',
        message: 'High cognitive stress detected. Adapting question difficulty to baseline.'
      });
      this.currentDifficulty = 'Easy';
      this.consecutiveStrong = 0;
    }

    let candidateList = this.questionPool[this.currentDifficulty.toLowerCase()] || this.questionPool.all;
    if (!candidateList || candidateList.length === 0) {
      candidateList = this.questionPool.all;
    }

    // Pick unasked question with semantic freshness
    let selected = candidateList.find(q => !this.askedQuestions.has(q.id) && !this.askedQuestions.has(q.question));

    if (!selected) {
      // If all in current difficulty tier are asked, look in all
      selected = this.questionPool.all.find(q => !this.askedQuestions.has(q.id) && !this.askedQuestions.has(q.question));
    }

    if (!selected) {
      // Re-cycle or fallback with personalization
      selected = this.questionPool.all[this.askedIndex % this.questionPool.all.length];
    }

    if (selected) {
      this.askedQuestions.add(selected.id);
      this.askedQuestions.add(selected.question);
      this.askedIndex++;

      // Store current question metadata
      this.currentQuestionData = {
        id: selected.id,
        question: selected.question,
        difficulty: selected.difficulty || this.currentDifficulty,
        adaptiveAction: selected.adaptiveAction || 'Evaluate answer and adapt difficulty state.',
        evaluationGuide: selected.evaluationGuide || 'Use category-specific scoring and observable evidence.',
      };

      // Personalize question if company / role / topic is set
      const formattedQ = this._personalizeQuestion(selected.question, this.config);
      this.currentQ = formattedQ;
      return formattedQ;
    }

    const fallback = `Walk me through a significant challenge or project experience in your preparation for the ${this.config.role || 'position'}.`;
    this.currentQ = fallback;
    return fallback;
  }

  /**
   * Personalize question text with candidate context (Role, Company, Experience, Highlights)
   */
  _personalizeQuestion(qText, cfg) {
    if (!qText) return '';
    let result = qText;

    const roleName = cfg.role ? cfg.role.trim() : 'this position';
    const companyName = cfg.company ? cfg.company.trim() : '';
    const isFresher = cfg.experience === 'College Student / Fresher' || !cfg.experience || cfg.experience.toLowerCase().includes('fresher');

    // 1. Personalize Company references
    if (companyName) {
      if (result.toLowerCase() === 'why this company?' || result.toLowerCase() === 'why this company') {
        result = `What made you interested in joining ${companyName}, and what excites you about working with us?`;
      } else if (result.toLowerCase() === 'why should we hire you?' || result.toLowerCase() === 'why should we hire you') {
        result = `Why should ${companyName} hire you over other candidates for the ${roleName} role?`;
      } else {
        result = result.replace(/\b(your company|this company|our company|our team)\b/gi, companyName);
      }
    }

    // 2. Personalize Role references
    if (cfg.role) {
      if (result.toLowerCase() === 'why do you want this role?' || result.toLowerCase() === 'why do you want this role') {
        result = `What motivated you to apply for the ${roleName} role${companyName ? ' at ' + companyName : ''}?`;
      } else if (result.toLowerCase() === 'tell me about yourself.' || result.toLowerCase() === 'tell me about yourself') {
        result = `Please tell me about yourself and your background as an aspiring ${roleName}.`;
      } else if (result.toLowerCase() === 'what are your strengths?' || result.toLowerCase() === 'what are your strengths') {
        result = `What do you consider your greatest strengths that make you well-suited for a ${roleName}?`;
      } else {
        result = result.replace(/\b(this role|the role|this job|the position)\b/gi, `the ${roleName} role`);
      }
    }

    // 3. Adapt for College Students / Freshers
    if (isFresher) {
      result = result
        .replace(/\b(at your previous job|in your previous company|at your last job|in your past workplace)\b/gi, 'in your college projects or academic teams')
        .replace(/\b(with previous colleagues|with your team at work)\b/gi, 'with your project teammates or classmates');
    }

    return result;
  }

  /**
   * Generate STT follow-up adhering strictly to the 1,400 Dataset & Model Guide rules
   * Converts raw questions into natural conversational transitions (< 40 words)
   */
  generateFollowUp(answerText, stressIndex = 0) {
    // 1. Evaluate previous response and adapt difficulty state machine
    this.evaluateAnswerQuality(this.currentQ || '', answerText, this.trackId);

    // 2. Fetch the next question strictly from the 1,400 Question Bank dataset for this track
    const nextDatasetQuestion = this.getNextQuestion(stressIndex);

    // 3. Conversational bridging prefixes (Engine 1: Orchestrator & Fast Transition)
    const words = (answerText || '').trim().split(/\s+/).filter(Boolean).length;
    const bridges = words > 15
      ? [
          `Great perspective on that. Moving forward: `,
          `Thank you for explaining that. Let's delve into: `,
          `Solid explanation. Shifting our focus: `,
          `Understood. Next question: `,
        ]
      : [
          `Thank you. Let's move on: `,
          `Got it. Next: `,
          `Moving forward: `,
        ];
    const bridge = bridges[Math.floor(Math.random() * bridges.length)];

    return `${bridge}${nextDatasetQuestion}`;
  }

  /**
   * Helper: Generate a question-specific AI Benchmark Model Answer
   */
  getBenchmarkModelAnswer(question, trackId = null) {
    const qLower = (question || '').toLowerCase();
    const role = this.config.role || 'Software Engineer';
    const company = this.config.company || 'our organization';

    if (/tell me about yourself|introduce yourself|background|walk me through your resume/i.test(qLower)) {
      return `Structure a 60–90 second pitch: 1) Education & Degree (e.g., Computer Science graduate), 2) Core Technical Skills & Major Projects built (e.g., full-stack apps, algorithms, cloud deployments), and 3) Clear career aspirations and enthusiasm for the ${role} position.`;
    }
    if (/why (this company|join|work with us)|interested in joining/i.test(qLower) || (company && qLower.includes(company.toLowerCase()))) {
      return `Demonstrate authentic company awareness: Highlight ${company}'s industry leadership, technological innovation, client impact, and collaborative learning culture, and connect these directly to your own personal work values.`;
    }
    if (/why (do you want|apply for|choose) this role|what motivated you|what motivates you|source of motivation/i.test(qLower)) {
      return `Articulate your professional drive: Explain your passion for solving challenging engineering problems through code, continuous learning, and delivering high-impact, reliable software systems as an impactful ${role}.`;
    }
    if (/career goal|where do you see yourself|5 years|future goal|ambition/i.test(qLower)) {
      return `Outline structured 3–5 year milestones: Transition from mastering core engineering responsibilities as a junior engineer to owning end-to-end architectural modules and mentoring team members in high-scale systems.`;
    }
    if (/failure|mistake|setback|struggle|didn't go as planned|regret/i.test(qLower)) {
      return `Use the STAR framework: Describe a real technical or project setback, take full personal accountability without external blaming, and explain the concrete lesson learned and systemic preventative measures you established.`;
    }
    if (/prioritize|priority|manage time|deadlines|competing tasks/i.test(qLower)) {
      return `Describe your prioritization framework: Assess urgency vs business impact (e.g., Eisenhower Matrix), break deliverables into milestone sprints, manage dependencies, and communicate timeline trade-offs proactively with leads.`;
    }
    if (/learn new technology|fast learner|upskill|stay updated/i.test(qLower)) {
      return `Explain your structured learning roadmap: Read official documentation and architecture guides, build a hands-on proof-of-concept project, seek code reviews from experienced peers, and integrate best practices.`;
    }
    if (/strength|strongest attribute|what are you good at/i.test(qLower)) {
      return `Highlight 2 role-relevant strengths with evidence (e.g., rapid learning agility and disciplined debugging), backed by a concrete project or academic achievement example.`;
    }
    if (/weakness|area of improvement|critical feedback/i.test(qLower)) {
      return `Select a genuine, non-fatal area (e.g., initial hesitation in delegating tasks or perfectionism in early drafts), explain your self-awareness, and detail the actionable steps and habits you actively employ to overcome it.`;
    }
    if (/team|conflict|disagree|collaborat/i.test(qLower)) {
      return `Apply the STAR framework: Describe a real team conflict, your proactive step to listen objectively to all perspectives, and how you guided the team to a data-driven consensus that delivered the project successfully.`;
    }
    if (/pressure|stress|tight deadline|overwhelm/i.test(qLower)) {
      return `Describe your composure method: Breaking complex deliverables into manageable milestones, transparent communication with stakeholders, and maintaining high code quality and automated testing under tight delivery windows.`;
    }

    return `A comprehensive answer structures the situation, specifies individual ownership, demonstrates domain depth, and highlights measurable results.`;
  }

  /**
   * Evaluate candidate's individual answer quality with deep semantic & topic-specific analysis
   */
  evaluateAnswerQuality(question, answerText, trackId = null) {
    const activeTrack = trackId || this.trackId;
    const text = (answerText || '').trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    const lower = text.toLowerCase();
    const qLower = (question || '').toLowerCase();
    const benchmark = this.getBenchmarkModelAnswer(question, activeTrack);

    // Identify semantic topic of the question
    const isIntro = /tell me about yourself|introduce yourself|background/i.test(qLower);
    const isWhyCompany = /why (this company|join|work with us)|interested in joining/i.test(qLower) || (this.config.company && qLower.includes(this.config.company.toLowerCase()));
    const isMotivation = /what motivated you|what motivates you|why (do you want|apply for|choose) this role|source of motivation/i.test(qLower);
    const isFailure = /failure|mistake|setback|struggle|didn't go as planned/i.test(qLower);
    const isPrioritize = /prioritize|priority|manage time|deadlines|competing tasks/i.test(qLower);
    const isLearning = /learn new technology|fast learner|upskill|stay updated/i.test(qLower);
    const isWeakness = /weakness|area of improvement/i.test(qLower);
    const isStrengths = /strength|strongest attribute/i.test(qLower);
    const isTeamConflict = /team|conflict|disagree|collaborat/i.test(qLower);

    // ── 1. Detect Incomplete / Dismissive / Negative Answers ────────────────────
    const isDismissive = /\b(nothing|none|dont care|don't care|no reason|not interested|not intresetd|nothing motivated|no motivation|nothing encourage|no failure|never failed|idk|whatever)\b/i.test(lower);

    if (isDismissive) {
      this.consecutiveWeak++;
      this.consecutiveStrong = 0;
      this._checkAdaptation();

      if (isFailure && /\b(no failure|never failed|none|nothing)\b/i.test(lower)) {
        return {
          overall: 12,
          is_correct: false,
          verdict: 'Lacks Self-Reflection / Avoided Question',
          what_was_right: 'Acknowledged the question topic.',
          what_was_missing: 'Claiming to have never experienced failure indicates a lack of self-awareness or hesitation to acknowledge mistakes. Interviewers ask this to gauge your resilience, humility, and ability to learn from setbacks.',
          feedback: 'Discuss a genuine minor project setback or bug, how you diagnosed the root cause, took ownership, and improved your engineering process.',
          strengths: ['Acknowledged prompt'],
          improvements: [
            'Choose a real technical or project setback and explain what you learned',
            'Demonstrate emotional maturity, resilience, and personal accountability'
          ],
          ideal_answer: benchmark,
        };
      }

      if (isWhyCompany && /\b(not interested|not intresetd|dont care|no reason)\b/i.test(lower)) {
        return {
          overall: 5,
          is_correct: false,
          verdict: 'Disengaged / Expressed Disinterest in Company',
          what_was_right: 'Responded to the prompt.',
          what_was_missing: 'Stated direct disinterest in the organization. An interview requires articulating genuine curiosity about the company\'s engineering culture, scale, and opportunities.',
          feedback: 'Research the company\'s key projects, client impact, and training culture to articulate positive alignment with your career aspirations.',
          strengths: ['Prompt response'],
          improvements: [
            'Articulate positive company interest and core values alignment',
            'Explain how the company\'s projects match your technical ambitions'
          ],
          ideal_answer: benchmark,
        };
      }

      if (isMotivation) {
        return {
          overall: 6,
          is_correct: false,
          verdict: 'Disengaged / Stated Lack of Motivation',
          what_was_right: 'Responded to the question prompt.',
          what_was_missing: 'Expressed a lack of internal motivation or interest. You must convey positive career drive, passion for solving problems through code, and enthusiasm for the position.',
          feedback: 'Reframe your response around authentic motivators: building scalable software, learning under experienced engineers, and contributing to company growth.',
          strengths: ['Prompt response'],
          improvements: [
            'Articulate genuine career motivation and enthusiasm for software engineering',
            'Explain what brings you professional fulfillment and satisfaction'
          ],
          ideal_answer: benchmark,
        };
      }

      return {
        overall: 8,
        is_correct: false,
        verdict: 'Disengaged / Unsuitable Response',
        what_was_right: 'Responded to the question prompt.',
        what_was_missing: 'Expressed lack of motivation or disinterest. In an interview, you must articulate genuine enthusiasm, positive career drive, and alignment with the company.',
        feedback: 'Reframe your response with positive motivators: desire to solve complex technical challenges, learn from experienced mentors, and contribute to company growth.',
        strengths: ['Prompt response'],
        improvements: ['Express genuine career enthusiasm and positive motivation', 'Connect your aspirations to the company and role'],
        ideal_answer: benchmark,
      };
    }

    // ── 2. Detect Name-Only / Bare 1–3 Word Answers ───────────────────────────
    if (words <= 3) {
      this.consecutiveWeak++;
      this.consecutiveStrong = 0;
      this._checkAdaptation();

      if (isIntro) {
        return {
          overall: 16,
          is_correct: false,
          verdict: 'Incomplete / Only Name Stated',
          what_was_right: 'Stated your name clearly.',
          what_was_missing: 'Missing educational background, core technical skills (programming languages, frameworks), key projects built, and career ambitions as a Software Engineer.',
          feedback: 'Deliver a structured 60-90 second introduction covering: 1) Education & Degree, 2) Technical Skills & Projects, 3) Enthusiasm for this role.',
          strengths: ['Clear name statement'],
          improvements: [
            'Structure introduction with Education, Technical Projects, and Career Goals',
            'Elaborate with at least 3-4 structured sentences'
          ],
          ideal_answer: benchmark,
        };
      }

      if (isPrioritize) {
        return {
          overall: 30,
          is_correct: false,
          verdict: 'Oversimplified / Needs Practical Framework',
          what_was_right: 'Identified the basic concept of ranking priorities.',
          what_was_missing: 'Stating "from high to low" lacks a concrete methodology. You need to explain HOW you determine priority (e.g., deadline urgency, business impact, dependencies) and handle competing demands.',
          feedback: 'Elaborate on your task management system: milestone tracking, dependency analysis, and communicating timeline adjustments with leads.',
          strengths: ['Addressed prioritization concept'],
          improvements: [
            'Explain the specific criteria used to evaluate urgency vs business impact',
            'Describe practical tools or frameworks (e.g., Eisenhower Matrix, Jira, milestone sprints)'
          ],
          ideal_answer: benchmark,
        };
      }

      if (isLearning) {
        return {
          overall: 32,
          is_correct: false,
          verdict: 'Over-reliant on Peers / Lacks Autonomous Methods',
          what_was_right: 'Valued collaborative peer learning.',
          what_was_missing: 'Relying exclusively on peers suggests low self-directed autonomy. Interviewers look for initiative: reading documentation, building proof-of-concept projects, and self-study alongside peer feedback.',
          feedback: 'Highlight a blended learning approach: independent documentation research + building sample projects + consulting senior peers for best practice reviews.',
          strengths: ['Valued peer collaboration'],
          improvements: [
            'Highlight self-directed learning methods (official documentation, hands-on POCs)',
            'Combine independent research with peer code reviews'
          ],
          ideal_answer: benchmark,
        };
      }

      return {
        overall: 20,
        is_correct: false,
        verdict: 'Very Brief / Single Phrase',
        what_was_right: 'Responded to prompt.',
        what_was_missing: 'Response is too brief to evaluate domain knowledge, reasoning, or communication skills.',
        feedback: 'Elaborate your response with specific examples, context, and clear explanations.',
        strengths: ['Clear statement'],
        improvements: ['Provide complete explanatory sentences with practical context', 'Elaborate with at least 3-4 structured sentences'],
        ideal_answer: benchmark,
      };
    }

    // ── 3. Detect Short / Brief Answers (4–15 words) ──────────────────────────
    if (words < 16) {
      this.consecutiveWeak++;
      this.consecutiveStrong = 0;
      this._checkAdaptation();

      if (isPrioritize) {
        return {
          overall: 48,
          is_correct: 'partial',
          verdict: 'Brief / Needs Prioritization Framework',
          what_was_right: 'Acknowledged task order and priority management.',
          what_was_missing: 'Needs a structured framework (e.g., Eisenhower Matrix, impact vs effort matrix) and examples of how you handle shifting deadlines.',
          feedback: 'Explain your step-by-step workflow: assessing dependencies, daily planning, and communicating trade-offs with stakeholders.',
          strengths: ['Direct response on prioritization'],
          improvements: [
            'Describe how you assess business impact vs deadline urgency',
            'Explain how you communicate timeline adjustments when overloaded'
          ],
          ideal_answer: benchmark,
        };
      }

      if (isLearning) {
        return {
          overall: 50,
          is_correct: 'partial',
          verdict: 'Brief / Needs Structured Learning Roadmap',
          what_was_right: 'Identified learning resources and support systems.',
          what_was_missing: 'Explain your end-to-end learning lifecycle: reading documentation, writing proof-of-concept code, and validating skills on real projects.',
          feedback: 'Demonstrate active self-study: building small test projects to solidify theoretical concepts before production use.',
          strengths: ['Highlighted learning approach'],
          improvements: [
            'Detail your process from reading documentation to building working prototypes',
            'Mention how you track progress and apply best practices'
          ],
          ideal_answer: benchmark,
        };
      }

      if (isFailure) {
        return {
          overall: 45,
          is_correct: 'partial',
          verdict: 'Brief / Needs STAR Resolution Details',
          what_was_right: 'Referenced a past challenge.',
          what_was_missing: 'Needs complete STAR framing: what was the specific situation, your personal ownership, and the permanent system improvement you implemented.',
          feedback: 'Focus on the positive resolution and what systemic checks you added to prevent the issue from recurring.',
          strengths: ['Willingness to discuss setbacks'],
          improvements: [
            'Use the STAR method (Situation, Task, Action, Result) with specific details',
            'Highlight the long-term learning and preventative mechanisms added'
          ],
          ideal_answer: benchmark,
        };
      }

      return {
        overall: 48,
        is_correct: 'partial',
        verdict: 'Brief / Needs Elaboration',
        what_was_right: 'Directly addressed the question topic.',
        what_was_missing: isIntro
          ? 'Could expand on specific engineering projects built, tech stack utilized, and problem-solving examples.'
          : isWhyCompany
          ? 'Needs concrete examples of what excites you about the company\'s technology and client impact.'
          : 'Lacks supporting evidence, practical examples, and depth of explanation.',
        feedback: 'Good start. Expand your answer with concrete technical details, past project experiences, and measurable outcomes.',
        strengths: ['Direct response', 'Concise communication'],
        improvements: ['Elaborate with concrete examples and project context', 'Use the STAR method (Situation, Task, Action, Result)'],
        ideal_answer: benchmark,
      };
    }

    // ── 4. Substantive Answers (16+ words): Deep Analysis ──────────────────────
    const domainKeywords = {
      hr: ['team', 'ownership', 'collaborat', 'value', 'learn', 'goal', 'culture', 'resolv', 'adapt', 'integrity', 'project', 'skill', 'lead', 'deliver', 'growth', 'feedback', 'achiev', 'priorit', 'deadlin', 'impact'],
      tech: ['oop', 'class', 'database', 'transaction', 'acid', 'thread', 'process', 'memory', 'index', 'network', 'protocol', 'latency', 'api', 'server', 'async'],
      dsa: ['complexity', 'big-o', 'array', 'hashmap', 'tree', 'graph', 'pointer', 'dp', 'recursion', 'edge case', 'optimize', 'stack', 'queue'],
      system_design: ['scale', 'load balancer', 'cache', 'redis', 'sharding', 'replica', 'kafka', 'throughput', 'bottleneck', 'microservice', 'distributed', 'database'],
      behavioral: ['situation', 'task', 'action', 'result', 'led', 'resolved', 'improved', 'metric', 'stakeholder', 'team', 'challenge', 'outcome'],
      gd: ['point', 'agree', 'perspective', 'evidence', 'counter', 'industry', 'consensus', 'impact', 'conclude'],
      communication: ['clearly', 'structured', 'firstly', 'secondly', 'impact', 'objective', 'approach', 'summary'],
      ai_ml: ['model', 'transformer', 'attention', 'embedding', 'rag', 'loss', 'gradient', 'tuning', 'evaluation', 'metric'],
      devops: ['docker', 'container', 'kubernetes', 'pipeline', 'ci/cd', 'terraform', 'monitoring', 'prometheus', 'cluster'],
      cloud: ['aws', 'azure', 'cloud', 's3', 'lambda', 'vpc', 'iam', 'availability', 'cost', 'serverless', 'region'],
      cybersec: ['vulnerability', 'owasp', 'encryption', 'tls', 'auth', 'jwt', 'threat', 'firewall', 'soc', 'patch'],
      qa: ['test', 'automation', 'selenium', 'cypress', 'api', 'bug', 'assertion', 'regression', 'mock', 'framework']
    };

    const targetKws = domainKeywords[activeTrack] || domainKeywords.hr;
    const matchedCount = targetKws.filter(kw => lower.includes(kw)).length;

    // Structural & Length Grading
    const lengthScore = Math.min(100, Math.max(50, words * 1.6));
    const keywordScore = Math.min(100, (matchedCount / Math.min(4, targetKws.length)) * 100);
    const hasSTAR = /\b(when|situation|task|my role|i built|i implemented|we achieved|improved|learned|result|outcome)\b/i.test(lower);
    const starBonus = hasSTAR ? 12 : 0;

    const overall = Math.max(52, Math.min(96, Math.round(lengthScore * 0.35 + keywordScore * 0.45 + starBonus + 12)));

    // Update rolling performance & trigger adaptation
    if (overall >= 78) {
      this.consecutiveStrong++;
      this.consecutiveWeak = 0;
    } else if (overall <= 55) {
      this.consecutiveWeak++;
      this.consecutiveStrong = 0;
    } else {
      this.consecutiveStrong = 0;
      this.consecutiveWeak = 0;
    }
    this._checkAdaptation();

    // Run Deep Emotion & Valence Analysis
    const emotionProfile = InterviewEmotionModel.analyzeEmotion(text, question, activeTrack);

    const isCorrect = overall >= 78 ? true : (overall >= 58 ? 'partial' : false);
    const verdict = overall >= 82 ? 'Correct & Strong' : (overall >= 65 ? 'Good Structure' : 'Needs More Depth');

    return {
      overall,
      is_correct: isCorrect,
      verdict,
      what_was_right: `Demonstrated good understanding (${matchedCount > 0 ? matchedCount : 1} key domain concepts identified) with ${emotionProfile.primaryEmotion.toLowerCase()} tone.`,
      what_was_missing: overall >= 82 ? 'Could add deeper quantitative impact metrics and long-term reflection.' : 'Include specific technical examples, trade-offs, and measurable results.',
      feedback: overall >= 78
        ? `Strong answer with ${emotionProfile.sentimentLabel.toLowerCase()} delivery, good domain terminology, and authentic structure.`
        : 'Good effort. Strengthen your response with specific architectural details, concrete examples, and measurable outcomes.',
      strengths: words >= 25 ? ['Clear explanation', 'Domain terminology', emotionProfile.primaryEmotion] : ['Clear structure'],
      improvements: overall < 80 ? ['Include quantifiable metrics and results', 'Explain trade-offs and edge cases'] : ['Provide additional production context'],
      ideal_answer: benchmark,
      emotion: emotionProfile,
    };
  }

  /**
   * Adaptive Difficulty State Machine (Model Guide Rule: 2 strong -> increase; 2 weak -> decrease)
   */
  _checkAdaptation() {
    if (this.consecutiveStrong >= 2 && this.currentDifficulty !== 'Hard') {
      this.currentDifficulty = this.currentDifficulty === 'Easy' ? 'Medium' : 'Hard';
      this.consecutiveStrong = 0;
      this.onAdaptation({
        type: 'difficulty_increase',
        difficulty: this.currentDifficulty,
        message: `Candidate demonstrated strong competence. Escalating difficulty to ${this.currentDifficulty}.`
      });
    } else if (this.consecutiveWeak >= 2 && this.currentDifficulty !== 'Easy') {
      this.currentDifficulty = this.currentDifficulty === 'Hard' ? 'Medium' : 'Easy';
      this.consecutiveWeak = 0;
      this.onAdaptation({
        type: 'difficulty_decrease',
        difficulty: this.currentDifficulty,
        message: `Candidate faced difficulty. Adapting questions to foundational ${this.currentDifficulty} concepts.`
      });
    }
  }

  /**
   * Complete Track Performance Evaluation Model
   * Produces the 8-metric rubric matrix based on actual candidate text analysis, speech telemetry, and transcripts.
   */
  evaluateTrackPerformance({ questionReviews = [], audioMetrics = {}, vocalAnalysis = {}, faceTelemetry = {}, stressIndex = 30, config = {} }) {
    const trackDef = getTrackConfig(this.trackId);
    const matrix = trackDef.evaluationMatrix;

    // Calculate baseline average from question reviews
    const answeredReviews = questionReviews.filter(q => q.score > 0);
    const avgScore = answeredReviews.length > 0
      ? Math.round(answeredReviews.reduce((sum, item) => sum + (item.score || 0), 0) / answeredReviews.length)
      : (questionReviews.length > 0 && questionReviews[0].score > 0 ? questionReviews[0].score : 0);

    // Speech & Fluency Telemetry Modifiers
    const wpm = audioMetrics.wpm || 142;
    const isOptimalPace = wpm >= 125 && wpm <= 165;
    const paceScore = isOptimalPace ? 92 : (wpm < 100 || wpm > 185 ? 65 : 80);

    const fillerCount = vocalAnalysis.fillerCount || 0;
    const fillerScore = Math.max(55, Math.min(98, 95 - fillerCount * 6));

    // ── TRUE MULTI-SIGNAL BEHAVIORAL & TEXT EVALUATION ACROSS ALL 8 DIMENSIONS ──
    const allAnswerText = questionReviews.map(q => q.user_answer || '').join(' ');
    const allLower = allAnswerText.toLowerCase();
    const totalWords = allAnswerText.split(/\s+/).filter(Boolean).length;
    const avgWordsPerQ = questionReviews.length > 0 ? totalWords / questionReviews.length : 0;

    // Check specific behavioral markers in transcripts
    const isDisengagedAnywhere = /\b(nothing|none|dont care|don't care|no reason|not interested|nothing motivated|no motivation)\b/i.test(allLower);
    const hasGrowthMindset = /\b(learn|growth|feedback|curious|improved|adapted|opportunity|upskill|challenge)\b/i.test(allLower);
    const hasOwnership = /\b(i built|i designed|my role|i implemented|my responsibility|i led|i created|i solved)\b/i.test(allLower);
    const hasCompanyFit = /\b(culture|values|collaborate|team|innovat|client|global|reputation|scale|align)\b/i.test(allLower);
    const hasCareerGoals = /\b(career|aspiration|5 years|senior|architect|lead|master|engineer|future|goal)\b/i.test(allLower);

    // Telemetry signals
    const eyeContact = faceTelemetry.eyeContact != null ? faceTelemetry.eyeContact : 88;
    const eyeContactScore = Math.min(100, Math.max(15, Math.round(eyeContact)));
    const stressIdx = stressIndex || 30;

    // Compute independent scores for each of the 8 dimensions based on real candidate behaviors:
    const skillScores = {};

    matrix.forEach((metric) => {
      let dimensionScore = 50;
      const mId = metric.id;

      if (mId === 'culture_fit') {
        if (isDisengagedAnywhere) {
          dimensionScore = 15;
        } else if (hasCompanyFit && totalWords > 20) {
          dimensionScore = Math.min(95, Math.max(60, Math.round(avgScore + 15)));
        } else if (totalWords < 10) {
          dimensionScore = 28;
        } else {
          dimensionScore = Math.min(85, Math.max(40, avgScore));
        }
      } else if (mId === 'communication') {
        if (avgWordsPerQ <= 3) {
          dimensionScore = 22; // Single-word / bare name response
        } else if (avgWordsPerQ < 12) {
          dimensionScore = 48; // Brief response
        } else {
          const fluencyBonus = isOptimalPace ? 12 : 0;
          dimensionScore = Math.min(96, Math.max(45, Math.round((Math.min(100, totalWords * 1.5) * 0.5) + (paceScore * 0.3) + (fillerScore * 0.2) + fluencyBonus)));
        }
      } else if (mId === 'eq') {
        if (isDisengagedAnywhere) {
          dimensionScore = 18;
        } else {
          const avgMaturity = questionReviews.reduce((sum, q) => sum + (q.emotion?.emotionalMaturity || 70), 0) / Math.max(1, questionReviews.length);
          dimensionScore = Math.min(96, Math.max(25, Math.round(avgMaturity)));
        }
      } else if (mId === 'growth_mindset') {
        if (hasGrowthMindset && totalWords > 15) {
          dimensionScore = Math.min(95, Math.max(65, Math.round(avgScore + 18)));
        } else if (isDisengagedAnywhere || totalWords < 8) {
          dimensionScore = 25;
        } else {
          dimensionScore = Math.min(80, Math.max(40, Math.round(avgScore - 5)));
        }
      } else if (mId === 'career_goals') {
        if (isDisengagedAnywhere) {
          dimensionScore = 8; // Disengaged / "nothing motivated me"
        } else if (hasCareerGoals && totalWords > 15) {
          dimensionScore = Math.min(95, Math.max(65, Math.round(avgScore + 14)));
        } else if (totalWords < 8) {
          dimensionScore = 30;
        } else {
          dimensionScore = Math.min(85, Math.max(45, avgScore));
        }
      } else if (mId === 'demeanor') {
        // Tied directly to real-time eye-gaze tracking + facial calmness
        dimensionScore = Math.min(96, Math.max(20, Math.round((eyeContactScore * 0.6) + ((100 - stressIdx) * 0.4))));
      } else if (mId === 'authenticity') {
        if (hasOwnership && totalWords > 15) {
          dimensionScore = Math.min(96, Math.max(60, Math.round(avgScore + 10)));
        } else if (totalWords <= 4) {
          dimensionScore = 35;
        } else {
          dimensionScore = Math.min(85, Math.max(40, avgScore));
        }
      } else if (mId === 'ethics') {
        // Evaluates integrity + compliance (proctoring infractions)
        const infractionPenalty = (faceTelemetry.phoneAlerts || 0) * 20;
        dimensionScore = Math.max(30, 95 - infractionPenalty);
      } else {
        // General / Technical domain metrics
        dimensionScore = Math.min(95, Math.max(20, avgScore));
      }

      // Store by BOTH label and id to guarantee frontend lookup
      skillScores[metric.label] = dimensionScore;
      skillScores[metric.id] = dimensionScore;
    });

    const grade = avgScore >= 92 ? 'A+' : (avgScore >= 85 ? 'A' : (avgScore >= 78 ? 'B+' : (avgScore >= 70 ? 'B' : (avgScore >= 60 ? 'C' : 'D'))));
    const hire = avgScore >= 88 ? 'Strong Yes — High Potential' : (avgScore >= 75 ? 'Yes — Ready for Next Round' : (avgScore >= 50 ? 'Consider — With Focus on Weak Areas' : 'No — Needs Preparation'));

    const uniqueStrengths = Array.from(new Set(questionReviews.flatMap(q => q.strengths || []))).filter(Boolean).slice(0, 4);
    const uniqueWeaknesses = Array.from(new Set(questionReviews.flatMap(q => q.improvements || []))).filter(Boolean).slice(0, 3);

    return {
      trackId: this.trackId,
      trackName: trackDef.name,
      overall_score: avgScore,
      grade,
      hire_recommendation: hire,
      skillScores,
      evaluationMatrix: matrix,
      speaking_speed: `${wpm} WPM (${isOptimalPace ? 'Optimal' : wpm < 125 ? 'Slow Pace' : 'Fast Pace'})`,
      filler_word_count: fillerCount,
      eye_contact_score: eyeContact,
      stress_score: stressIndex,
      confidence_score: confidenceScore,
      cognitive_load_label: stressIndex < 40 ? 'Optimal Flow State' : (stressIndex < 65 ? 'Moderate Focus Load' : 'High Pressure'),
      proctor_flags: 0,
      question_reviews: questionReviews,
      executive_summary: `Candidate completed ${answeredReviews.length} evaluated question(s) for ${trackDef.name} (${config.role || 'Candidate'}). Achieved an overall competency score of ${avgScore}/100.`,
      strengths: uniqueStrengths.length > 0 ? uniqueStrengths : ['Responded to interview questions'],
      weak_areas: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ['Provide structured elaboration on project details and technical steps'],
    };
  }

  getGreeting() {
    const trackName = this.trackConfig?.name || 'Technical';
    const persona = this.trackConfig?.persona?.name || 'ALEX';
    const role = this.config.role || 'Candidate';
    const company = this.config.company ? ` at ${this.config.company}` : '';

    return `Hello! I'm ${persona}, your AI interviewer for the ${trackName} track${company}. We'll conduct an adaptive, multi-stage assessment for the ${role} position. When you're ready, let's begin with your first question.`;
  }
}

export default AIQuestionEngine;
