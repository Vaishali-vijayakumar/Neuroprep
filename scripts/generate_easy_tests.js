const fs = require('fs');
const path = require('path');

// Generator for Tests 1 to 5 (Foundation / Easy Level)
// Total: 5 tests * 40 questions = 200 questions
// Breakdown per test: 12 Quant, 10 Logical, 10 Verbal, 4 NonVerbal, 4 DI

const easyTests = [
  // Test 1: Foundation Arithmetic & Core Reasoning
  {
    id: 'mock-test-1',
    sectionId: 'foundation',
    testNumber: 1,
    title: 'Foundation Arithmetic & Core Reasoning',
    level: 'Foundation',
    focus: 'Numbers, Ratios & Elementary Logic',
    difficulty: 'Foundation',
    totalQuestions: 40,
    timeLimitMinutes: 45,
    passingScore: 28,
    sectionsBreakdown: { Quant: 12, Logical: 10, Verbal: 10, NonVerbal: 4, DI: 4 },
    questions: [
      // Quant 1-12
      {
        id: 'm1-q1',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'What is the greatest common divisor (HCF) of 54 and 90?',
        options: ['9', '18', '27', '36'],
        correctIndex: 1,
        explanation: 'Step 1: Prime factorization: 54 = 2 * 3^3, 90 = 2 * 3^2 * 5.\nStep 2: Take the product of common prime factors with lowest powers: 2^1 * 3^2 = 2 * 9 = 18.\nTherefore, the HCF is 18.'
      },
      {
        id: 'm1-q2',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'If 40% of a number is 160, what is 75% of that same number?',
        options: ['240', '280', '300', '320'],
        correctIndex: 2,
        explanation: 'Step 1: Let the number be x. 0.40 * x = 160 => x = 160 / 0.40 = 400.\nStep 2: 75% of 400 = 0.75 * 400 = 300.'
      },
      {
        id: 'm1-q3',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'A can finish a task in 12 days and B can finish it in 24 days. Working together, how many days will they take to complete the task?',
        options: ['6 days', '8 days', '10 days', '16 days'],
        correctIndex: 1,
        explanation: "Step 1: A's 1-day work = 1/12, B's 1-day work = 1/24.\nStep 2: Combined 1-day work = 1/12 + 1/24 = 2/24 + 1/24 = 3/24 = 1/8.\nStep 3: Total time required = 8 days."
      },
      {
        id: 'm1-q4',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'A car travels a distance of 180 km in 3 hours. If it increases its speed by 20 km/hr, how long will it take to travel the same distance?',
        options: ['2 hours', '2.25 hours', '2.5 hours', '2.75 hours'],
        correctIndex: 1,
        explanation: 'Step 1: Initial speed = 180 km / 3 hrs = 60 km/hr.\nStep 2: New speed = 60 + 20 = 80 km/hr.\nStep 3: New time = 180 / 80 = 9/4 = 2.25 hours (2 hours 15 minutes).'
      },
      {
        id: 'm1-q5',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'An item bought for Rs. 800 is sold for Rs. 960. Find the profit percentage.',
        options: ['16%', '18%', '20%', '25%'],
        correctIndex: 2,
        explanation: 'Step 1: Profit = Selling Price - Cost Price = 960 - 800 = Rs. 160.\nStep 2: Profit % = (160 / 800) * 100 = 20%.'
      },
      {
        id: 'm1-q6',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'The average of four numbers is 35. If the first three numbers are 28, 36, and 42, find the fourth number.',
        options: ['30', '34', '36', '40'],
        correctIndex: 1,
        explanation: 'Step 1: Sum of all 4 numbers = 4 * 35 = 140.\nStep 2: Sum of first 3 numbers = 28 + 36 + 42 = 106.\nStep 3: Fourth number = 140 - 106 = 34.'
      },
      {
        id: 'm1-q7',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'Find the simple interest on a principal amount of Rs. 12,000 for 2 years at an annual interest rate of 6.5%.',
        options: ['Rs. 1,440', 'Rs. 1,560', 'Rs. 1,620', 'Rs. 1,750'],
        correctIndex: 1,
        explanation: 'Step 1: SI formula = (P * R * T) / 100.\nStep 2: SI = (12000 * 6.5 * 2) / 100 = 120 * 13 = Rs. 1,560.'
      },
      {
        id: 'm1-q8',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'Two numbers are in the ratio 5 : 8. If their difference is 36, what is the value of the larger number?',
        options: ['60', '84', '96', '108'],
        correctIndex: 2,
        explanation: 'Step 1: Let the numbers be 5x and 8x.\nStep 2: Difference = 8x - 5x = 3x = 36 => x = 12.\nStep 3: Larger number = 8x = 8 * 12 = 96.'
      },
      {
        id: 'm1-q9',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'Pipe A can fill a tank in 6 hours and Pipe B can fill the same tank in 9 hours. If both pipes are opened together, how long will it take to fill the tank?',
        options: ['3.2 hours', '3.6 hours', '4.0 hours', '4.5 hours'],
        correctIndex: 1,
        explanation: 'Step 1: Net filling rate per hour = 1/6 + 1/9 = (3 + 2)/18 = 5/18.\nStep 2: Time taken = 18 / 5 = 3.6 hours (3 hours 36 minutes).'
      },
      {
        id: 'm1-q10',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'The ratio of present ages of father and son is 7 : 2. If the father is 35 years older than the son, find the son’s present age.',
        options: ['10 years', '12 years', '14 years', '15 years'],
        correctIndex: 2,
        explanation: 'Step 1: Let ages be 7x and 2x.\nStep 2: 7x - 2x = 5x = 35 => x = 7.\nStep 3: Son’s age = 2x = 2 * 7 = 14 years.'
      },
      {
        id: 'm1-q11',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'A square field has a perimeter of 160 meters. What is the area of the field in square meters?',
        options: ['1,200 sq m', '1,440 sq m', '1,600 sq m', '1,800 sq m'],
        correctIndex: 2,
        explanation: 'Step 1: Side of square = Perimeter / 4 = 160 / 4 = 40 meters.\nStep 2: Area = Side^2 = 40^2 = 1,600 sq meters.'
      },
      {
        id: 'm1-q12',
        section: 'Quant',
        difficulty: 'Foundation',
        question: 'What is the unit digit of 7^43?',
        options: ['1', '3', '7', '9'],
        correctIndex: 1,
        explanation: 'Step 1: Cyclicity of powers of 7 is 4 (7^1=7, 7^2=49 (9), 7^3=343 (3), 7^4=2401 (1)).\nStep 2: Divide exponent 43 by 4: 43 mod 4 = 3.\nStep 3: The unit digit is given by 7^3 = 343, so the unit digit is 3.'
      },

      // Logical 13-22
      {
        id: 'm1-q13',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'In a certain code language, "LIGHT" is written as "MJHIU". How is "FLAME" written in that code?',
        options: ['GMBNF', 'GMBLE', 'GKALF', 'GLAMF'],
        correctIndex: 0,
        explanation: 'Step 1: L(+1)=M, I(+1)=J, G(+1)=H, H(+1)=I, T(+1)=U. Each letter shifts forward by +1.\nStep 2: F(+1)=G, L(+1)=M, A(+1)=B, M(+1)=N, E(+1)=F => GMBNF.'
      },
      {
        id: 'm1-q14',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
        options: ['95', '112', '127', '135'],
        correctIndex: 2,
        explanation: 'Step 1: Pattern is (Current * 2) + 1:\n3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63.\nStep 2: Next term = 63 * 2 + 1 = 126 + 1 = 127.'
      },
      {
        id: 'm1-q15',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'Pointing to a photograph, a woman says, "He is the son of the only daughter of my father." How is the boy in the photograph related to the woman?',
        options: ['Brother', 'Son', 'Nephew', 'Father'],
        correctIndex: 1,
        explanation: 'Step 1: "My father\'s only daughter" is the woman herself (since she is female).\nStep 2: "The son of the woman" means the boy is her Son.'
      },
      {
        id: 'm1-q16',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'A person walks 12 meters South, turns left and walks 5 meters. How far is he from his starting position?',
        options: ['13 m', '15 m', '17 m', '19 m'],
        correctIndex: 0,
        explanation: 'Step 1: South 12m and East 5m form a right-angled triangle.\nStep 2: Using Pythagoras theorem: Distance = sqrt(12^2 + 5^2) = sqrt(144 + 25) = sqrt(169) = 13 meters.'
      },
      {
        id: 'm1-q17',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'In a row of 30 students, Karan ranks 8th from the left. What is his rank from the right end?',
        options: ['22nd', '23rd', '24th', '25th'],
        correctIndex: 1,
        explanation: 'Step 1: Rank from right = Total students - Rank from left + 1.\nStep 2: Rank = 30 - 8 + 1 = 22 + 1 = 23rd.'
      },
      {
        id: 'm1-q18',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'Find the odd one out: Mercury, Venus, Moon, Mars, Jupiter.',
        options: ['Venus', 'Moon', 'Mars', 'Mercury'],
        correctIndex: 1,
        explanation: 'Step 1: Mercury, Venus, Mars, and Jupiter are planets revolving around the Sun.\nStep 2: Moon is a natural satellite revolving around the Earth. Therefore, Moon is the odd one out.'
      },
      {
        id: 'm1-q19',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'Statements:\n1. All roses are flowers.\n2. All flowers are plants.\nConclusions:\nI. All roses are plants.\nII. Some plants are roses.',
        options: ['Only I follows', 'Only II follows', 'Neither follows', 'Both I and II follow'],
        correctIndex: 3,
        explanation: 'Step 1: All roses are subset of flowers, which are subset of plants. Thus, all roses are plants (I follows).\nStep 2: Since roses are part of plants, some plants are roses (II follows).\nBoth conclusions follow.'
      },
      {
        id: 'm1-q20',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'If CAT is coded as 24 and DOG is coded as 26, how is TIGER coded using standard alphabetical positions?',
        options: ['54', '59', '62', '65'],
        correctIndex: 1,
        explanation: 'Step 1: CAT = 3 + 1 + 20 = 24. DOG = 4 + 15 + 7 = 26.\nStep 2: TIGER = T(20) + I(9) + G(7) + E(5) + R(18) = 20 + 9 + 7 + 5 + 18 = 59.'
      },
      {
        id: 'm1-q21',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'Four friends A, B, C, and D are sitting on a bench facing North. B is to the immediate right of A. C is to the left of A. D is to the immediate right of B. Who is at the extreme left?',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 2,
        explanation: 'Step 1: C is left of A => C, A.\nStep 2: B is immediate right of A => C, A, B.\nStep 3: D is immediate right of B => C, A, B, D.\nTherefore, C is at the extreme left.'
      },
      {
        id: 'm1-q22',
        section: 'Logical',
        difficulty: 'Foundation',
        question: 'If January 1st of a non-leap year is a Friday, what day of the week will January 31st be of the same year?',
        options: ['Friday', 'Saturday', 'Sunday', 'Monday'],
        correctIndex: 2,
        explanation: 'Step 1: Number of elapsed days from Jan 1 to Jan 31 = 30 days.\nStep 2: 30 mod 7 = 2 odd days.\nStep 3: Friday + 2 days = Sunday.'
      },

      // Verbal 23-32
      {
        id: 'm1-q23',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Select the synonym for "DILIGENT":',
        options: ['Careless', 'Hardworking', 'Hesitant', 'Arrogant'],
        correctIndex: 1,
        explanation: 'Step 1: "Diligent" means having or showing care and conscientiousness in one\'s work or duties.\nStep 2: "Hardworking" is the direct synonym.'
      },
      {
        id: 'm1-q24',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Choose the antonym for "TRANSPARENT":',
        options: ['Clear', 'Lucid', 'Opaque', 'Translucent'],
        correctIndex: 2,
        explanation: 'Step 1: "Transparent" means permitting light to pass through so that objects behind can be distinctly seen.\nStep 2: "Opaque" means not able to be seen through; not transparent.'
      },
      {
        id: 'm1-q25',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Identify the sentence with correct subject-verb agreement:',
        options: ['The group of students were studying late.', 'The group of students was studying late.', 'The group of students are studying late.', 'The group of students have studied late.'],
        correctIndex: 1,
        explanation: 'Step 1: The head noun of the subject phrase is the singular collective noun "group" (The group of students).\nStep 2: Therefore, it takes the singular verb "was studying".'
      },
      {
        id: 'm1-q26',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Fill in the blank: "He has been living in Bengaluru _____ 2018."',
        options: ['for', 'since', 'from', 'in'],
        correctIndex: 1,
        explanation: 'Step 1: With present perfect continuous tense referring to a specific starting point in time (2018), "since" is the correct preposition.'
      },
      {
        id: 'm1-q27',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Choose the correctly spelled word:',
        options: ['Occurrence', 'Occurence', 'Ocurrence', 'Occurrance'],
        correctIndex: 0,
        explanation: 'Step 1: The correct spelling is OCCURRENCE (double c, double r, ends in -ence).'
      },
      {
        id: 'm1-q28',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'What is the meaning of the idiom "Break the ice"?',
        options: ['To crack a frozen surface', 'To initiate conversation in a social setting and ease tension', 'To end a long friendship', 'To cause an argument'],
        correctIndex: 1,
        explanation: 'Step 1: "Break the ice" means to say or do something that makes people feel more relaxed and comfortable in a social situation.'
      },
      {
        id: 'm1-q29',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Spot the error: "Each of the participants (A) / were given a certificate (B) / after the seminar (C) / ended. (D)"',
        options: ['A', 'B', 'C', 'D'],
        correctIndex: 1,
        explanation: 'Step 1: "Each of" takes a singular verb. "were given" is plural.\nStep 2: Correct form is "was given". Hence the error is in Segment B.'
      },
      {
        id: 'm1-q30',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Fill in the blank: "She is _____ European scientist who won the prestigious award."',
        options: ['a', 'an', 'the', 'no article required'],
        correctIndex: 0,
        explanation: 'Step 1: Although "European" begins with the vowel letter \'E\', it begins with the consonant sound /juː/ (yoo-ropean).\nStep 2: Words beginning with consonant sounds take the indefinite article "a".'
      },
      {
        id: 'm1-q31',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Rearrange the segments into a coherent sentence:\nP: to build efficient algorithms\nQ: software developers must\nR: understand data structures\nS: before optimizing code',
        options: ['Q - R - P - S', 'P - Q - R - S', 'S - Q - P - R', 'R - Q - P - S'],
        correctIndex: 0,
        explanation: 'Step 1: Q provides subject + modal verb: "Software developers must".\nStep 2: R provides main verb + object: "understand data structures".\nStep 3: P provides purpose infinitive: "to build efficient algorithms".\nStep 4: S provides conditional time phrase: "before optimizing code".'
      },
      {
        id: 'm1-q32',
        section: 'Verbal',
        difficulty: 'Foundation',
        question: 'Complete the analogy:\nBook : Author :: Symphony : ?',
        options: ['Musician', 'Composer', 'Pianist', 'Conductor'],
        correctIndex: 1,
        explanation: 'Step 1: An author creates a book.\nStep 2: A composer creates a musical symphony.'
      },

      // Non-Verbal 33-36
      {
        id: 'm1-q33',
        section: 'NonVerbal',
        difficulty: 'Foundation',
        question: 'Identify the next term in the geometric pattern: [1 Dot, 3 Dots in a triangle, 6 Dots in a triangle, 10 Dots in a triangle, ?]',
        options: ['12 Dots', '15 Dots', '18 Dots', '20 Dots'],
        correctIndex: 1,
        explanation: 'Step 1: These are triangular numbers given by T_n = n(n+1)/2.\nStep 2: T1=1, T2=3, T3=6, T4=10.\nStep 3: T5 = 5 * 6 / 2 = 15 Dots.'
      },
      {
        id: 'm1-q34',
        section: 'NonVerbal',
        difficulty: 'Foundation',
        question: 'What is the reflection of the word "CODE" across a horizontal mirror placed directly below the word (Water Image)?',
        options: ['CODE (inverted vertically)', 'EDOC', 'CODB', 'GODE'],
        correctIndex: 0,
        explanation: 'Step 1: A horizontal mirror reflects vertically upside-down.\nStep 2: C, O, D, E all have horizontal symmetry axes, so their water reflection shapes remain recognizable with inverted orientation.'
      },
      {
        id: 'm1-q35',
        section: 'NonVerbal',
        difficulty: 'Foundation',
        question: 'A square paper is folded in half diagonally, and then folded in half again along the altitude. Three small circular holes are punched through all layers. How many holes are present when unfolded?',
        options: ['6 holes', '8 holes', '12 holes', '16 holes'],
        correctIndex: 2,
        explanation: 'Step 1: Folding diagonally once creates 2 layers.\nStep 2: Folding in half again creates 2 * 2 = 4 layers.\nStep 3: Punching 3 holes through 4 layers produces 3 * 4 = 12 holes upon full unfolding.'
      },
      {
        id: 'm1-q36',
        section: 'NonVerbal',
        difficulty: 'Foundation',
        question: 'A clock face shows 3:00. If the minute hand is rotated 90 degrees clockwise, what new time does it point to?',
        options: ['3:10', '3:15', '3:20', '3:30'],
        correctIndex: 1,
        explanation: 'Step 1: At 3:00, the minute hand points at 12 (0°).\nStep 2: Each minute equals 6° on a clock face (360° / 60 = 6°/min).\nStep 3: 90° clockwise = 90 / 6 = 15 minutes.\nStep 4: Minute hand points at 3, representing 15 minutes past the hour (3:15).'
      },

      // DI 37-40
      {
        id: 'm1-q37',
        section: 'DI',
        difficulty: 'Foundation',
        question: 'Table Data: Enrollment in 4 branches: CS = 180, IT = 120, ECE = 150, ME = 90. What percentage of the total students are enrolled in Computer Science (CS)?',
        options: ['30%', '33.33%', '35%', '37.5%'],
        correctIndex: 1,
        explanation: 'Step 1: Total students = 180 + 120 + 150 + 90 = 540.\nStep 2: Percentage in CS = (180 / 540) * 100 = 1/3 * 100 = 33.33%.'
      },
      {
        id: 'm1-q38',
        section: 'DI',
        difficulty: 'Foundation',
        question: 'Bar Chart: Production of units (in thousands) over 3 years: 2021 = 40k, 2022 = 60k, 2023 = 75k. What is the average annual production?',
        options: ['55k', '58.33k', '60k', '62.5k'],
        correctIndex: 1,
        explanation: 'Step 1: Total production = 40 + 60 + 75 = 175k.\nStep 2: Average = 175k / 3 = 58.33k (58,333.33 units).'
      },
      {
        id: 'm1-q39',
        section: 'DI',
        difficulty: 'Foundation',
        question: 'In a company expense pie chart, Marketing accounts for 72°. If total expenses are $500,000, what is the marketing expense?',
        options: ['$75,000', '$100,000', '$120,000', '$150,000'],
        correctIndex: 1,
        explanation: 'Step 1: Angle fraction = 72° / 360° = 1/5 = 20%.\nStep 2: Expense = 20% of $500,000 = 0.20 * 500,000 = $100,000.'
      },
      {
        id: 'm1-q40',
        section: 'DI',
        difficulty: 'Foundation',
        question: 'A line graph tracking revenue shows: Jan = $20k, Feb = $25k, Mar = $30k, Apr = $40k. What is the absolute percentage increase from Jan to Apr?',
        options: ['50%', '75%', '100%', '125%'],
        correctIndex: 2,
        explanation: 'Step 1: Increase = $40k - $20k = $20k.\nStep 2: Percentage increase = (20 / 20) * 100 = 100%.'
      }
    ]
  }
];

console.log("Easy test 1 defined with 40 questions.");
