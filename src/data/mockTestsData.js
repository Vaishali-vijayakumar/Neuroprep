// 20 Mock Tests Dataset
// Each test contains 40 questions across Quantitative, Logical, Verbal, Non-Verbal, and Data Interpretation.

const DIFFICULTY_LEVELS = [
  "Moderate", "High", "Moderate", "Hard", "Moderate", 
  "Moderate", "Moderate", "High", "Hard", "Moderate", 
  "High", "Moderate", "Moderate", "Moderate", "Hard", 
  "Hard", "Moderate", "Moderate", "Moderate", "Hard"
];

// Helper to construct 40 questions per test
function generateMockTestQuestions(testIndex) {
  const difficulty = DIFFICULTY_LEVELS[testIndex % DIFFICULTY_LEVELS.length];
  const questions = [];

  // 1. Quantitative Aptitude (12 Qs)
  const quantTemplates = [
    (i) => ({
      section: 'Quant',
      question: `A can finish a task in ${10 + (i % 5)} days and B in ${15 + (i % 6)} days. If they work together for ${2 + (i % 3)} days, what fraction of work is left?`,
      options: [
        `${((i % 4) + 1)}/${12 + (i % 5)}`,
        `${5 + (i % 3)}/${12 + (i % 4)}`,
        `${7 + (i % 2)}/${20 + (i % 5)}`,
        `${3 + (i % 2)}/${10 + (i % 3)}`
      ],
      correctIndex: 1,
      explanation: `Combined 1-day work = 1/${10 + (i % 5)} + 1/${15 + (i % 6)}. Multiply by ${2 + (i % 3)} days completed, then subtract from 1 to find remaining fraction.`
    }),
    (i) => ({
      section: 'Quant',
      question: `A train running at ${50 + (i * 4)} km/hr crosses a platform of length ${200 + (i * 20)} m in ${24 + (i % 6)} seconds. Find the length of the train.`,
      options: [`${120 + (i * 10)} m`, `${150 + (i * 10)} m`, `${180 + (i * 10)} m`, `${210 + (i * 10)} m`],
      correctIndex: 1,
      explanation: `Speed in m/s = (${50 + (i * 4)} * 5 / 18) m/s. Total Distance = Speed * Time = Length of train + Length of platform (${200 + (i * 20)} m). Deduct platform length to get train length.`
    }),
    (i) => ({
      section: 'Quant',
      question: `The ratio of ages of two friends P and Q is ${3 + (i % 3)}:${4 + (i % 3)}. After ${6 + (i % 4)} years, their ratio becomes ${4 + (i % 3)}:${5 + (i % 3)}. Find the present age of P.`,
      options: [`${18 + (i * 2)} years`, `${24 + (i * 2)} years`, `${30 + (i * 2)} years`, `${36 + (i * 2)} years`],
      correctIndex: 0,
      explanation: `Let ages be ${3 + (i % 3)}x and ${4 + (i % 3)}x. (${3 + (i % 3)}x + ${6 + (i % 4)}) / (${4 + (i % 3)}x + ${6 + (i % 4)}) = ${4 + (i % 3)}/${5 + (i % 3)}. Solving for x gives present age of P.`
    }),
    (i) => ({
      section: 'Quant',
      question: `A merchant sells an item at a profit of ${15 + (i % 10)}%. If he had bought it for ${10 + (i % 5)}% less and sold it for Rs. ${20 + (i * 5)} less, he would have gained ${25}%. Find the Cost Price.`,
      options: [`Rs. ${400 + (i * 50)}`, `Rs. ${500 + (i * 50)}`, `Rs. ${600 + (i * 50)}`, `Rs. ${750 + (i * 50)}`],
      correctIndex: 1,
      explanation: `Let CP = x. SP1 = ${1 + (15 + (i % 10)) / 100}x. New CP = ${1 - (10 + (i % 5)) / 100}x. Solve equation using 25% profit margin on new CP.`
    }),
    (i) => ({
      section: 'Quant',
      question: `Find the compound interest on Rs. ${10000 + (i * 1000)} at ${10}% per annum for ${2} years compounded annually.`,
      options: [`Rs. ${2100 + (i * 210)}`, `Rs. ${2200 + (i * 210)}`, `Rs. ${2300 + (i * 210)}`, `Rs. ${2400 + (i * 210)}`],
      correctIndex: 0,
      explanation: `Amount = P(1 + R/100)^n = ${10000 + (i * 1000)} * (1.1)^2 = ${10000 + (i * 1000)} * 1.21. CI = Amount - Principal = Rs. ${2100 + (i * 210)}.`
    }),
    (i) => ({
      section: 'Quant',
      question: `In how many different ways can the letters of the word "${['ALPHA', 'BETA', 'GAMMA', 'DELTA', 'OMEGA'][i % 5]}" be arranged?`,
      options: [
        `${[60, 24, 60, 120, 120][i % 5]}`,
        `${[120, 48, 120, 240, 240][i % 5]}`,
        `${[30, 12, 30, 60, 60][i % 5]}`,
        `${[180, 36, 180, 360, 360][i % 5]}`
      ],
      correctIndex: 0,
      explanation: `Number of permutations = n! / (r1! * r2!...). Factor in repeating letters where applicable.`
    }),
    (i) => ({
      section: 'Quant',
      question: `Two pipes A and B can fill a tank in ${15 + (i % 5)} hours and ${20 + (i % 5)} hours respectively. If both are opened together, how long will it take to fill the tank?`,
      options: [`${(8 + (i % 3)).toFixed(2)} hours`, `${(9 + (i % 3)).toFixed(2)} hours`, `${(10 + (i % 3)).toFixed(2)} hours`, `${(11 + (i % 3)).toFixed(2)} hours`],
      correctIndex: 0,
      explanation: `Combined rate = 1/${15 + (i % 5)} + 1/${20 + (i % 5)}. Inverting the sum gives total time.`
    }),
    (i) => ({
      section: 'Quant',
      question: `What is the probability of drawing an Ace or a King from a well-shuffled deck of 52 playing cards?`,
      options: ['2/13', '1/13', '4/13', '3/26'],
      correctIndex: 0,
      explanation: 'Total Aces = 4, Total Kings = 4. Total favorable = 8. Probability = 8/52 = 2/13.'
    }),
    (i) => ({
      section: 'Quant',
      question: `An angle between the hour hand and minute hand of a clock at ${3 + (i % 4)}:${20 + (i % 10)} PM is:`,
      options: [`${20 + (i * 2.5)}°`, `${35 + (i * 2.5)}°`, `${50 + (i * 2.5)}°`, `${65 + (i * 2.5)}°`],
      correctIndex: 0,
      explanation: 'Formula: Angle = |30H - 5.5M|. Substitute Hour and Minute values to calculate absolute angular difference.'
    }),
    (i) => ({
      section: 'Quant',
      question: `If ${20 + (i * 2)}% of a number is equal to ${30 + (i * 2)}% of another number, what is the ratio of the first number to the second?`,
      options: [`3:2`, `2:3`, `4:3`, `3:4`],
      correctIndex: 0,
      explanation: `0.20 * A = 0.30 * B => A / B = 30 / 20 = 3:2.`
    }),
    (i) => ({
      section: 'Quant',
      question: `Find the HCF of ${36 + (i * 6)}, ${54 + (i * 6)}, and ${90 + (i * 6)}.`,
      options: [`${18}`, `${9}`, `${12}`, `${6}`],
      correctIndex: 0,
      explanation: `Highest Common Factor of numbers obtained by prime factorization decomposition.`
    }),
    (i) => ({
      section: 'Quant',
      question: `The average score of a class of ${30 + (i % 10)} students is ${75 + (i % 5)}. If the instructor's score of ${95} is included, the new average becomes:`,
      options: [`${(75.5 + (i % 5)).toFixed(2)}`, `${(76.2 + (i % 5)).toFixed(2)}`, `${(77.0 + (i % 5)).toFixed(2)}`, `${(78.1 + (i % 5)).toFixed(2)}`],
      correctIndex: 0,
      explanation: `New Average = (Total previous sum + 95) / (${31 + (i % 10)}).`
    })
  ];

  // 2. Logical Reasoning (10 Qs)
  const logicalTemplates = [
    (i) => ({
      section: 'Logical',
      question: `If 'CODING' is written as 'EQFKPI', how will 'PLACEMENT' be written in that code?`,
      options: ['RNCAGOGPV', 'RNBAGOGPV', 'RNCBGOGPV', 'QMBDLNFOU'],
      correctIndex: 0,
      explanation: 'Rule: Each letter is shifted forward by +2 positions in the alphabet (C->E, O->Q, D->F...). P(+2)->R, L(+2)->N, A(+2)->C, C(+2)->E, E(+2)->G, M(+2)->O, E(+2)->G, N(+2)->P, T(+2)->V.'
    }),
    (i) => ({
      section: 'Logical',
      question: `Pointing to a photo, Anita said, 'He is the son of the only son of my grandfather.' How is the boy in the photo related to Anita?`,
      options: ['Brother', 'Uncle', 'Cousin', 'Father'],
      correctIndex: 0,
      explanation: "Only son of Anita's grandfather = Anita's father. Son of Anita's father = Anita's brother."
    }),
    (i) => ({
      section: 'Logical',
      question: `Find the next term in the series: ${5 + i}, ${10 + i * 2}, ${20 + i * 4}, ${40 + i * 8}, ?`,
      options: [`${80 + i * 16}`, `${70 + i * 14}`, `${90 + i * 18}`, `${85 + i * 15}`],
      correctIndex: 0,
      explanation: 'Geometric progression doubling pattern: each term is multiplied by 2.'
    }),
    (i) => ({
      section: 'Logical',
      question: `A person walks 10m North, turns right and walks 15m, then turns right again and walks 10m. How far and in which direction is he from the starting point?`,
      options: ['15m East', '15m West', '10m North', '25m East'],
      correctIndex: 0,
      explanation: 'The North movement (10m) is cancelled by the Southward movement (10m). The remaining offset is 15m East.'
    }),
    (i) => ({
      section: 'Logical',
      question: `Five people A, B, C, D, E are sitting in a row facing North. C is sitting in the middle. A is to the left of B, and D is to the right of E. If E is at the extreme left, who is at the extreme right?`,
      options: ['B', 'A', 'D', 'C'],
      correctIndex: 0,
      explanation: 'Seating order from left to right: E - D - C - A - B. Extreme right is B.'
    }),
    (i) => ({
      section: 'Logical',
      question: `Statements: Some software are bugs. All bugs are errors.\nConclusions:\nI. Some software are errors.\nII. No bug is a software.`,
      options: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'],
      correctIndex: 0,
      explanation: 'Since Software overlaps with Bugs, and Bugs are inside Errors, Software must overlap with Errors (Conclusion I follows). II contradicts the given statement.'
    }),
    (i) => ({
      section: 'Logical',
      question: `Which number replaces the question mark in the matrix? [ 4, 9, 20 | 8, 5, 18 | 6, 7, ? ]`,
      options: ['20', '22', '24', '19'],
      correctIndex: 0,
      explanation: 'Row rule: (First * 2) + Second + 3 = Third. (6 * 2) + 7 + 1 = 20.'
    }),
    (i) => ({
      section: 'Logical',
      question: `If TODAY is Tuesday, what day of the week will it be after ${60 + (i % 7)} days?`,
      options: [['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][(i % 7)], 'Friday', 'Sunday', 'Monday'],
      correctIndex: 0,
      explanation: `Divide ${60 + (i % 7)} by 7 to find remainder odd days. Add odd days to Tuesday.`
    }),
    (i) => ({
      section: 'Logical',
      question: `In a class of 50 students, Rohan ranks 15th from the top. What is his rank from the bottom?`,
      options: ['36th', '35th', '37th', '34th'],
      correctIndex: 0,
      explanation: 'Rank from bottom = Total students - Rank from top + 1 = 50 - 15 + 1 = 36th.'
    }),
    (i) => ({
      section: 'Logical',
      question: `Statement: "Join our intensive training program to qualify for advanced roles in 90 days." - Advertisement.\nAssumption I: Candidates desire career advancement.\nAssumption II: The program has structured training modules.`,
      options: ['Both I and II are implicit', 'Only I is implicit', 'Only II is implicit', 'Neither is implicit'],
      correctIndex: 0,
      explanation: 'Advertisements assume target audiences seek the benefit offered (I) and that the program possesses structured delivery capability (II).'
    })
  ];

  // 3. Verbal Ability (10 Qs)
  const verbalTemplates = [
    (i) => ({
      section: 'Verbal',
      question: `Choose the antonym for the word "PRUDENT":`,
      options: ['Reckless', 'Cautious', 'Wise', 'Discreet'],
      correctIndex: 0,
      explanation: 'Prudent means showing care and thought for the future. Opposite: Reckless.'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Select the word nearest in meaning to "PERSEVERANCE":`,
      options: ['Persistence', 'Hesitation', 'Indolence', 'Weakness'],
      correctIndex: 0,
      explanation: 'Perseverance means continued effort to achieve something despite difficulties. Synonym: Persistence.'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Fill in the blank: "The team members were congratulated _____ their outstanding performance in the national competition."`,
      options: ['on', 'for', 'with', 'at'],
      correctIndex: 0,
      explanation: 'The verb "congratulated" takes the preposition "on" (congratulate someone ON an achievement).'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Spot the error: "Each of the candidates (A) / were given (B) / a booklet for (C) / the examination. (D)"`,
      options: ['B', 'A', 'C', 'No error'],
      correctIndex: 0,
      explanation: '"Each of" is singular and requires a singular verb "was given" instead of "were given". Error in segment B.'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Rearrange the parts into a meaningful sentence: P: to enhance system security / Q: engineers must update / R: all server dependencies / S: regularly`,
      options: ['Q R P S', 'P Q R S', 'Q P R S', 'S P Q R'],
      correctIndex: 0,
      explanation: 'Logical sequence: Q (engineers must update) -> R (all server dependencies) -> P (to enhance system security) -> S (regularly).'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Identify the correctly spelled word:`,
      options: ['ACCOMMODATE', 'ACOMMODATE', 'ACCOMODATE', 'ACOMMODATT'],
      correctIndex: 0,
      explanation: 'Correct spelling has double C and double M: ACCOMMODATE.'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Choose the correct idiom meaning for "To burn the midnight oil":`,
      options: ['To work or study late into the night', 'To waste resources', 'To cause a fire hazard', 'To sleep early'],
      correctIndex: 0,
      explanation: '"Burn the midnight oil" means studying or working hard late into the night.'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Complete the sentence: "Hardly had the evaluator announced the results _____ the candidates started cheering."`,
      options: ['when', 'than', 'then', 'so'],
      correctIndex: 0,
      explanation: 'The adverbial conjunction "Hardly... when" is a mandatory pair in formal grammar.'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Select the sentence with correct punctuation:`,
      options: [
        '"We are ready," said the lead engineer, "to deploy the microservices."',
        'We are ready said the lead engineer to deploy the microservices',
        '"We are ready" said the lead engineer "to deploy the microservices"',
        'We are ready, said the lead engineer "to deploy the microservices."'
      ],
      correctIndex: 0,
      explanation: 'Direct dialogue interrupted by attribution requires commas inside quotes.'
    }),
    (i) => ({
      section: 'Verbal',
      question: `Reading Comprehension: "Artificial Intelligence is transforming assessment procedures by automating initial resume screening..." What is the main theme of the passage?`,
      options: ['Automation in candidate screening', 'Manual interview techniques', 'Salary negotiation tactics', 'Campus infrastructure'],
      correctIndex: 0,
      explanation: 'The passage directly discusses AI automation in candidate evaluation.'
    })
  ];

  // 4. Non-Verbal Reasoning (4 Qs)
  const nonVerbalTemplates = [
    (i) => ({
      section: 'NonVerbal',
      question: `Select the figure that continues the series: [Triangle (3 sides) -> Square (4 sides) -> Pentagon (5 sides) -> ?]`,
      options: ['Hexagon (6 sides)', 'Heptagon (7 sides)', 'Circle', 'Octagon (8 sides)'],
      correctIndex: 0,
      explanation: 'Pattern increases number of geometric sides by +1 at each step: 3, 4, 5 -> Hexagon (6).'
    }),
    (i) => ({
      section: 'NonVerbal',
      question: `Find the mirror image of the geometric shape "▲●■" reflected across a vertical right mirror:`,
      options: ['■●▲', '▲●■', '●■▲', '▲■●'],
      correctIndex: 0,
      explanation: 'Horizontal mirror reflection reverses the left-to-right sequence of shapes.'
    }),
    (i) => ({
      section: 'NonVerbal',
      question: `A square paper folded twice into a quadrant is punched with two holes. When unfolded completely, how many total holes will appear?`,
      options: ['8 holes', '4 holes', '6 holes', '16 holes'],
      correctIndex: 0,
      explanation: 'Folding twice creates 4 layers. 2 holes * 4 layers = 8 total holes upon unfolding.'
    }),
    (i) => ({
      section: 'NonVerbal',
      question: `Identify which option figure contains the given embedded figure "X" shape inside it:`,
      options: ['Figure A (Cross grid)', 'Figure B (Plain square)', 'Figure C (Circle)', 'Figure D (Parallel lines)'],
      correctIndex: 0,
      explanation: 'The diagonal cross lines forming an X shape are embedded within Figure A.'
    })
  ];

  // 5. Data Interpretation (4 Qs)
  const diTemplates = [
    (i) => ({
      section: 'DI',
      question: `Table Data: Candidates registered across 4 colleges: A=400, B=600, C=500, D=500. Total cleared = 1000. What % of total candidates cleared?`,
      options: ['50%', '45%', '55%', '60%'],
      correctIndex: 0,
      explanation: 'Total candidates = 400 + 600 + 500 + 500 = 2000. Cleared = 1000. Percentage = (1000 / 2000) * 100 = 50%.'
    }),
    (i) => ({
      section: 'DI',
      question: `Bar Chart: Candidate intake over 3 years: 2021=1200, 2022=1500, 2023=1800. What is the average annual intake?`,
      options: ['1500', '1400', '1600', '1700'],
      correctIndex: 0,
      explanation: 'Average = (1200 + 1500 + 1800) / 3 = 4500 / 3 = 1500.'
    }),
    (i) => ({
      section: 'DI',
      question: `Pie Chart: Department expenditure: R&D (30%), Infrastructure (25%), Salaries (35%), Marketing (10%). If total budget is Rs. 10 Crores, how much is spent on R&D?`,
      options: ['Rs. 3 Crores', 'Rs. 2.5 Crores', 'Rs. 3.5 Crores', 'Rs. 1 Crore'],
      correctIndex: 0,
      explanation: 'R&D spend = 30% of 10 Crores = 0.30 * 10 = Rs. 3 Crores.'
    }),
    (i) => ({
      section: 'DI',
      question: `Line Graph: Student pass rate: Test 1 (60%), Test 2 (70%), Test 3 (85%). What is the net percentage point increase from Test 1 to Test 3?`,
      options: ['25 percentage points', '15 percentage points', '20 percentage points', '30 percentage points'],
      correctIndex: 0,
      explanation: 'Difference = 85% - 60% = 25 percentage points.'
    })
  ];

  let qIdx = 1;

  for (let k = 0; k < 12; k++) {
    const fn = quantTemplates[k % quantTemplates.length];
    const q = fn(testIndex * 12 + k);
    q.id = `m${testIndex + 1}-q${qIdx++}`;
    questions.push(q);
  }

  for (let k = 0; k < 10; k++) {
    const fn = logicalTemplates[k % logicalTemplates.length];
    const q = fn(testIndex * 10 + k);
    q.id = `m${testIndex + 1}-q${qIdx++}`;
    questions.push(q);
  }

  for (let k = 0; k < 10; k++) {
    const fn = verbalTemplates[k % verbalTemplates.length];
    const q = fn(testIndex * 10 + k);
    q.id = `m${testIndex + 1}-q${qIdx++}`;
    questions.push(q);
  }

  for (let k = 0; k < 4; k++) {
    const fn = nonVerbalTemplates[k % nonVerbalTemplates.length];
    const q = fn(testIndex * 4 + k);
    q.id = `m${testIndex + 1}-q${qIdx++}`;
    questions.push(q);
  }

  for (let k = 0; k < 4; k++) {
    const fn = diTemplates[k % diTemplates.length];
    const q = fn(testIndex * 4 + k);
    q.id = `m${testIndex + 1}-q${qIdx++}`;
    questions.push(q);
  }

  return questions;
}

export const MOCK_TEST_CATEGORIES = [
  {
    id: 'foundation',
    title: 'Foundation Level Tests',
    level: 'Foundation',
    badgeColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#065F46',
    desc: 'Core arithmetic, elementary logical deduction, basic verbal grammar, and foundational problem solving.'
  },
  {
    id: 'intermediate',
    title: 'Intermediate Level Tests',
    level: 'Intermediate',
    badgeColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    textColor: '#1E40AF',
    desc: 'Standard commercial arithmetic, speed calculations, data analysis, and multi-step reasoning drills.'
  },
  {
    id: 'advanced',
    title: 'Advanced Level Tests',
    level: 'Advanced',
    badgeColor: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#92400E',
    desc: 'Complex permutations, probability distributions, matrix puzzles, abstract syllogisms, and multi-chart DI.'
  },
  {
    id: 'expert',
    title: 'Expert Level Tests',
    level: 'Expert',
    badgeColor: '#FFF1F2',
    borderColor: '#FECDD3',
    textColor: '#9F1239',
    desc: 'Full-length high-rigour placement assessment simulations with stringent timing and comprehensive all-topic coverage.'
  }
];

export const MOCK_TEST_DEFINITIONS = [
  // Foundation Level
  { id: 'mock-test-1', sectionId: 'foundation', title: 'Foundation Arithmetic & Core Reasoning', level: 'Foundation', focus: 'Numbers, Ratios & Elementary Logic', difficulty: 'Foundation' },
  { id: 'mock-test-2', sectionId: 'foundation', title: 'Basic Numerical & Verbal Essentials', level: 'Foundation', focus: 'Percentages, Grammar & Word Analogies', difficulty: 'Foundation' },
  { id: 'mock-test-3', sectionId: 'foundation', title: 'Elementary Data & Series Foundations', level: 'Foundation', focus: 'Table Analysis, Series & Deductions', difficulty: 'Foundation' },
  { id: 'mock-test-4', sectionId: 'foundation', title: 'Speed Math & Logic Fundamentals', level: 'Foundation', focus: 'Simplification, Clocks & Basic Puzzles', difficulty: 'Foundation' },
  { id: 'mock-test-5', sectionId: 'foundation', title: 'Fundamental Quantitative Readiness', level: 'Foundation', focus: 'Time-Work, Averages & Verbal Cloze', difficulty: 'Foundation' },

  // Intermediate Level
  { id: 'mock-test-6', sectionId: 'intermediate', title: 'Intermediate Quantitative Proficiency', level: 'Intermediate', focus: 'Profit-Loss, Partnerships & Syllogisms', difficulty: 'Intermediate' },
  { id: 'mock-test-7', sectionId: 'intermediate', title: 'Standard Deductive & Analytical Drill', level: 'Intermediate', focus: 'Blood Relations, Direction & Venn Diagrams', difficulty: 'Intermediate' },
  { id: 'mock-test-8', sectionId: 'intermediate', title: 'Commercial Mathematics & Data Tables', level: 'Intermediate', focus: 'SI-CI, Mixtures & Bar Chart Analysis', difficulty: 'Intermediate' },
  { id: 'mock-test-9', sectionId: 'intermediate', title: 'Speed-Distance & Verbal Reasoning', level: 'Intermediate', focus: 'Trains, Boats, Pipes & Sentence Correction', difficulty: 'Intermediate' },
  { id: 'mock-test-10', sectionId: 'intermediate', title: 'Applied Aptitude & Critical Thinking', level: 'Intermediate', focus: 'Logical Connectives & Word Problems', difficulty: 'Intermediate' },

  // Advanced Level
  { id: 'mock-test-11', sectionId: 'advanced', title: 'Advanced Quantitative & Probability Diagnostic', level: 'Advanced', focus: 'Probability Distributions & Combinatorics', difficulty: 'Advanced' },
  { id: 'mock-test-12', sectionId: 'advanced', title: 'Complex Logical & Diagrammatic Matrices', level: 'Advanced', focus: 'Seating Arrangements & Non-Verbal Figures', difficulty: 'Advanced' },
  { id: 'mock-test-13', sectionId: 'advanced', title: 'Advanced Multi-Chart Data Interpretation', level: 'Advanced', focus: 'Mixed Pie-Line Charts & Data Sufficiency', difficulty: 'Advanced' },
  { id: 'mock-test-14', sectionId: 'advanced', title: 'Abstract Reasoning & Critical Syllogisms', level: 'Advanced', focus: 'Statement-Assumptions & Deductive Logic', difficulty: 'Advanced' },
  { id: 'mock-test-15', sectionId: 'advanced', title: 'High-Velocity Quantitative Problem Solving', level: 'Advanced', focus: 'Advanced Geometry, Algebra & Rapid Math', difficulty: 'Advanced' },

  // Expert Level
  { id: 'mock-test-16', sectionId: 'expert', title: 'Expert Placement Comprehensive Simulation', level: 'Expert', focus: 'All-Section Full Simulation Drill', difficulty: 'Expert' },
  { id: 'mock-test-17', sectionId: 'expert', title: 'Master Multi-Discipline Speed Challenge', level: 'Expert', focus: 'Time-Pressured High-Complexity Scenarios', difficulty: 'Expert' },
  { id: 'mock-test-18', sectionId: 'expert', title: 'Strategic Analytical & Reasoning Benchmark', level: 'Expert', focus: 'Caselet Interpretation & Conditional Logic', difficulty: 'Expert' },
  { id: 'mock-test-19', sectionId: 'expert', title: 'Comprehensive Aptitude Final Assessment', level: 'Expert', focus: 'Advanced Numerical & Verbal Rigour', difficulty: 'Expert' },
  { id: 'mock-test-20', sectionId: 'expert', title: 'Grand Placement Diagnostic Benchmark', level: 'Expert', focus: 'Ultimate Pre-Placement Readiness Assessment', difficulty: 'Expert' },
];

export const MOCK_TESTS_CATALOG = MOCK_TEST_DEFINITIONS.map((def, index) => {
  return {
    id: def.id,
    sectionId: def.sectionId,
    testNumber: index + 1,
    title: def.title,
    level: def.level,
    focus: def.focus,
    difficulty: def.difficulty,
    totalQuestions: 40,
    timeLimitMinutes: 45,
    passingScore: 28,
    sectionsBreakdown: {
      Quant: 12,
      Logical: 10,
      Verbal: 10,
      NonVerbal: 4,
      DI: 4
    },
    questions: generateMockTestQuestions(index)
  };
});
