/**
 * NeuroPrep Deep Emotion & Valence Evaluation Model
 * 
 * Multi-dimensional sentiment, emotion, and psychological tone classifier
 * tailored for interview transcripts and vocal responses.
 *
 * Evaluates:
 * 1. Valence (Positivity vs Negativity scale -100 to +100)
 * 2. Emotional Tone (Optimism, Growth Mindset, Hesitation, Disengagement, Defensiveness, Confidence)
 * 3. Question-Response Emotional Alignment (EQ Maturity)
 */

// Lexicon and semantic weight matrix for interview emotional valence
const POSITIVE_LEXICON = {
  // High Enthusiasm & Passion (+3 to +4)
  'passionate': 4, 'excited': 4, 'love': 3, 'thrilled': 4, 'eager': 3, 'delighted': 3, 'fascinated': 4, 'thrive': 3,
  // Growth Mindset & Learning (+3)
  'learn': 3, 'grow': 3, 'improve': 3, 'curious': 3, 'opportunity': 3, 'develop': 3, 'challenge': 2, 'adapt': 3, 'progress': 3, 'expand': 3,
  // Ownership & Proactiveness (+3)
  'ownership': 3, 'initiative': 3, 'built': 3, 'implemented': 3, 'solved': 3, 'led': 3, 'achieved': 3, 'delivered': 3, 'designed': 3, 'created': 3,
  // Collaboration & Team Harmony (+2 to +3)
  'collaborate': 3, 'team': 2, 'support': 2, 'share': 2, 'empathy': 3, 'listen': 2, 'partner': 2, 'mentor': 3, 'respect': 3, 'align': 2,
  // Optimism & Constructive Outcome (+2 to +3)
  'success': 3, 'positive': 3, 'effective': 2, 'valuable': 3, 'confident': 3, 'efficient': 2, 'impact': 3, 'beneficial': 2, 'satisfied': 2,
};

const NEGATIVE_LEXICON = {
  // Disengagement & Apathy (-4 to -5)
  'nothing': -4, 'none': -3, 'dont care': -5, "don't care": -5, 'no reason': -4, 'not interested': -5, 'bored': -4, 'idk': -3, 'whatever': -5,
  // Defensiveness & Blame (-4)
  'fault': -4, 'blame': -4, 'their problem': -4, 'unfair': -3, 'annoying': -3, 'stupid': -4, 'forced': -3, 'hated': -4, 'refused': -3,
  // Extreme Defeatism & Helplessness (-3 to -4)
  'impossible': -3, 'gave up': -4, 'quit': -3, 'useless': -4, 'hopeless': -4, 'terrible': -3, 'failed completely': -4, 'waste': -4,
  // Excessive Hedging & Uncertainty (-1 to -2)
  'maybe': -1, 'i guess': -2, 'probably': -1, 'dunno': -2, 'sort of': -1, 'kind of': -1, 'not sure': -2,
};

// Emotional Dimension Classifiers
export class InterviewEmotionModel {
  /**
   * Run multi-dimensional emotion & sentiment inference on candidate text
   * @param {string} text - Spoken / submitted candidate response
   * @param {string} question - Interview question prompt
   * @param {string} trackId - Interview track (hr, tech, behavioral, etc.)
   */
  static analyzeEmotion(text = '', question = '', trackId = 'hr') {
    const raw = (text || '').trim();
    const lower = raw.toLowerCase();
    const qLower = (question || '').toLowerCase();
    const words = lower.split(/[\s,.;!?]+/).filter(Boolean);

    if (words.length === 0) {
      return {
        valenceScore: 0,
        sentimentLabel: 'Neutral / No Response',
        positivityRatio: 50,
        negativityRatio: 50,
        emotionalMaturity: 0,
        primaryEmotion: 'Unanswered',
        secondaryEmotions: [],
        coachingAdvice: 'Speak or type your answer to receive real-time emotional and vocal tone insights.',
        isAppropriateTone: false,
      };
    }

    let positiveScore = 0;
    let negativeScore = 0;
    const detectedPositiveKeywords = [];
    const detectedNegativeKeywords = [];

    // 1. Lexicon Vector Scoring with Negation Window
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const prevWord = i > 0 ? words[i - 1] : '';
      const isNegated = ['not', "n't", 'no', 'never', 'hardly', 'barely', 'without'].includes(prevWord);

      if (POSITIVE_LEXICON[word]) {
        const val = POSITIVE_LEXICON[word];
        if (isNegated) {
          negativeScore += val * 0.8;
          detectedNegativeKeywords.push(`not ${word}`);
        } else {
          positiveScore += val;
          detectedPositiveKeywords.push(word);
        }
      }

      if (NEGATIVE_LEXICON[word]) {
        const val = Math.abs(NEGATIVE_LEXICON[word]);
        if (isNegated) {
          positiveScore += val * 0.6;
          detectedPositiveKeywords.push(`not ${word}`);
        } else {
          negativeScore += val;
          detectedNegativeKeywords.push(word);
        }
      }
    }

    // Check multi-word negative phrases
    Object.keys(NEGATIVE_LEXICON).filter(k => k.includes(' ')).forEach(phrase => {
      if (lower.includes(phrase)) {
        negativeScore += Math.abs(NEGATIVE_LEXICON[phrase]);
        detectedNegativeKeywords.push(phrase);
      }
    });

    // 2. High-Level Semantic Patterns
    const hasGrowthMindset = /\b(learned from|feedback helped|improved my|reflected on|stepped up|proactive|solution)\b/i.test(lower);
    const hasEnthusiasm = /\b(excited to|passionate about|look forward|thrilled|great opportunity|deep interest)\b/i.test(lower);
    const hasOwnership = /\b(my responsibility|i designed|i spearheaded|i led|i took the initiative|we succeeded)\b/i.test(lower);
    const isDisengaged = /\b(nothing|none|dont care|don't care|no reason|not interested|nothing motivated)\b/i.test(lower);
    const isDefensive = /\b(it wasn't my fault|their mistake|they blamed|not my problem|poor leadership)\b/i.test(lower);

    if (hasGrowthMindset) positiveScore += 4;
    if (hasEnthusiasm) positiveScore += 4;
    if (hasOwnership) positiveScore += 3;
    if (isDisengaged) negativeScore += 6;
    if (isDefensive) negativeScore += 5;

    // 3. Normalize Valence to [-100, +100]
    const totalImpact = positiveScore + negativeScore;
    let valenceScore = 0;
    if (totalImpact > 0) {
      valenceScore = Math.round(((positiveScore - negativeScore) / (positiveScore + negativeScore)) * 100);
    } else {
      valenceScore = 10; // Default neutral baseline
    }

    // 4. Determine Primary & Secondary Emotion
    let primaryEmotion = 'Professional & Objective';
    const secondaryEmotions = [];

    if (isDisengaged) {
      primaryEmotion = 'Disengaged / Apathetic';
      secondaryEmotions.push('Low Motivation', 'Indifference');
    } else if (isDefensive) {
      primaryEmotion = 'Defensive / External Blaming';
      secondaryEmotions.push('Friction', 'Low Self-Awareness');
    } else if (hasEnthusiasm && hasGrowthMindset) {
      primaryEmotion = 'High Passion & Growth Mindset';
      secondaryEmotions.push('Optimistic', 'Proactive');
    } else if (hasEnthusiasm) {
      primaryEmotion = 'Enthusiastic & Positive';
      secondaryEmotions.push('Energetic', 'Goal-Oriented');
    } else if (hasGrowthMindset || hasOwnership) {
      primaryEmotion = 'Accountable & Constructive';
      secondaryEmotions.push('Growth Mindset', 'Ownership');
    } else if (valenceScore > 20) {
      primaryEmotion = 'Constructive & Optimistic';
      secondaryEmotions.push('Positive Delivery');
    } else if (valenceScore < -20) {
      primaryEmotion = 'Cautious / Critical';
      secondaryEmotions.push('Hesitant');
    }

    // 5. Emotional Maturity / EQ Score (0 - 100)
    let emotionalMaturity = 75; // Baseline
    if (isDisengaged) {
      emotionalMaturity = 15;
    } else if (isDefensive) {
      emotionalMaturity = 25;
    } else {
      emotionalMaturity = Math.min(98, Math.max(40, 65 + (hasGrowthMindset ? 15 : 0) + (hasOwnership ? 10 : 0) - (negativeScore > 3 ? 12 : 0)));
    }

    // 6. Positivity vs Negativity Ratio
    const posRatio = Math.max(5, Math.min(95, Math.round((Math.max(0, valenceScore + 100) / 200) * 100)));
    const negRatio = 100 - posRatio;

    // 7. Sentiment Label
    let sentimentLabel = 'Neutral / Objective';
    if (valenceScore >= 50) sentimentLabel = 'Highly Positive & Enthusiastic';
    else if (valenceScore >= 15) sentimentLabel = 'Positive & Constructive';
    else if (valenceScore <= -40) sentimentLabel = 'Significantly Negative / Disengaged';
    else if (valenceScore < -10) sentimentLabel = 'Slightly Hesitant / Critical';

    // 8. Question-Context Alignment & Coaching Advice
    let coachingAdvice = 'Your emotional tone was constructive and professionally composed.';
    if (isDisengaged) {
      coachingAdvice = 'Avoid dismissive words like "nothing" or "don\'t care". Express positive curiosity and clear career motivation.';
    } else if (isDefensive) {
      coachingAdvice = 'Shift from external blaming to personal accountability and what you learned from difficult situations.';
    } else if (/weakness|failure|conflict/i.test(qLower) && hasGrowthMindset) {
      coachingAdvice = 'Excellent EQ: You framed a past challenge constructively and highlighted your proactive solution.';
    } else if (valenceScore >= 40) {
      coachingAdvice = 'Strong positive energy: Your genuine enthusiasm and structured ownership stand out.';
    }

    return {
      valenceScore,
      sentimentLabel,
      positivityRatio: posRatio,
      negativityRatio: negRatio,
      emotionalMaturity,
      primaryEmotion,
      secondaryEmotions,
      positiveKeywords: Array.from(new Set(detectedPositiveKeywords)).slice(0, 5),
      negativeKeywords: Array.from(new Set(detectedNegativeKeywords)).slice(0, 4),
      coachingAdvice,
      isAppropriateTone: !isDisengaged && !isDefensive,
    };
  }
}

export default InterviewEmotionModel;
