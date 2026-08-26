// Aptitude and Reasoning Formula Reference Data

export const FORMULA_SECTORS = [
  { id: 'Quant', label: 'Quantitative Aptitude' },
  { id: 'Logical', label: 'Logical Reasoning' },
  { id: 'Verbal', label: 'Verbal Ability' },
  { id: 'NonVerbal', label: 'Non-Verbal Reasoning' },
  { id: 'DI', label: 'Data Interpretation' }
];

export const TOPIC_FORMULAS = {
  Quant: [
    {
      topic: 'Time and Work / Pipes and Cisterns',
      importance: 'Frequency: 3-4 Questions',
      timeLimit: '45 seconds per question',
      formulas: [
        'If A completes work in X days and B in Y days, combined time = (X * Y) / (X + Y) days.',
        'If A, B, and C complete work in X, Y, and Z days, combined rate per day = 1/X + 1/Y + 1/Z.',
        'Efficiency Ratio Rule: If A is K times as efficient as B, then time ratio A:B = 1:K.',
        'Pipes & Cisterns: Inlet rate = +1/X per hour, Outlet rate = -1/Y per hour. Net filling rate = 1/X - 1/Y.'
      ],
      speedTricks: [
        'LCM Method: Define total work units as the LCM of individual days. Example: 12 and 16 days gives 48 units. A completes 4 units/day, B completes 3 units/day.',
        'Remaining Work Formula: Remaining Work = 1 - (Days Worked * Combined Daily Rate).'
      ],
      proTip: 'For questions involving Men, Women, and Children, convert all work rates to a single equivalent worker unit before solving.'
    },
    {
      topic: 'Speed, Time and Distance / Trains / Boats',
      importance: 'Frequency: 2-3 Questions',
      timeLimit: '50 seconds per question',
      formulas: [
        'Unit Conversion: km/hr to m/s = Multiply by 5/18. m/s to km/hr = Multiply by 18/5.',
        'Average Speed for Equal Distances = (2 * S1 * S2) / (S1 + S2).',
        'Train crossing a stationary point object (pole, person): Distance = Length of Train.',
        'Train crossing a platform or bridge: Distance = Length of Train + Length of Platform.',
        'Relative Speed: Same direction = |S1 - S2|. Opposite direction = S1 + S2.',
        'Boats & Streams: Downstream Speed = U + V; Upstream Speed = U - V; Boat Speed in Still Water = (Downstream + Upstream) / 2.'
      ],
      speedTricks: [
        'If time is constant, distance is directly proportional to speed.',
        'If distance is constant, speed is inversely proportional to time.'
      ],
      proTip: 'Verify measurement units (meters with seconds, kilometers with hours) before calculating.'
    },
    {
      topic: 'Profit, Loss and Discounts',
      importance: 'Frequency: 2-3 Questions',
      timeLimit: '40 seconds per question',
      formulas: [
        'Profit Percentage = (Profit / Cost Price) * 100.',
        'Loss Percentage = (Loss / Cost Price) * 100.',
        'Selling Price = Cost Price * (1 + Profit%/100) or Cost Price * (1 - Loss%/100).',
        'Discount Percentage = (Marked Price - Selling Price) / Marked Price * 100.',
        'Net Discount for Successive Discounts D1% and D2% = D1 + D2 - (D1 * D2 / 100).'
      ],
      speedTricks: [
        'If Cost Price of X articles equals Selling Price of Y articles, Profit % = ((X - Y) / Y) * 100.',
        'False Weight Profit % = (Error / (True Weight - Error)) * 100.'
      ],
      proTip: 'Set Cost Price to 100 as a base value for percentage calculations.'
    },
    {
      topic: 'Percentages, Ratios and Averages',
      importance: 'Frequency: Core Requirement',
      timeLimit: '30 seconds per question',
      formulas: [
        'Percentage Change = (Final Value - Initial Value) / Initial Value * 100.',
        'If A is P% greater than B, B is [P / (100 + P)] * 100% less than A.',
        'Average = Sum of Observations / Total Number of Observations.',
        'Weighted Average = (N1 * A1 + N2 * A2) / (N1 + N2).'
      ],
      speedTricks: [
        'Fraction Conversions: 1/2 = 50%, 1/3 = 33.33%, 1/4 = 25%, 1/5 = 20%, 1/6 = 16.66%, 1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%.',
        'Symmetry Property: X% of Y is equal to Y% of X.'
      ],
      proTip: 'Use deviation from assumed mean to compute averages of large datasets quickly.'
    },
    {
      topic: 'Permutations, Combinations and Probability',
      importance: 'Frequency: 2 Questions',
      timeLimit: '50 seconds per question',
      formulas: [
        'Permutation (Arrangement): nPr = n! / (n - r)!',
        'Combination (Selection): nCr = n! / [r! * (n - r)!]',
        'Permutations of N items with R identical items = N! / R!',
        'Probability P(Event) = Favorable Outcomes / Total Sample Space.',
        'Complement Rule: P(At least 1 success) = 1 - P(Zero successes).'
      ],
      speedTricks: [
        'Handshake / Pairing Formula: Total pairs for N items = nCr(N, 2) = N * (N - 1) / 2.',
        'Standard Deck Details: 52 cards divided into 4 suits of 13 cards each, containing 12 face cards.'
      ],
      proTip: 'Use 1 - P(None) when solving "at least one" probability conditions.'
    },
    {
      topic: 'Clocks and Calendars',
      importance: 'Frequency: 1-2 Questions',
      timeLimit: '35 seconds per question',
      formulas: [
        'Clock Angle Formula: Angle = |30 * Hours - 5.5 * Minutes| degrees.',
        'Hand Speeds: Minute hand moves at 6° per minute. Hour hand moves at 0.5° per minute.',
        'Coincidence (0°): Hands coincide 22 times in 24 hours.',
        'Perpendicularity (90°): Hands are perpendicular 44 times in 24 hours.',
        'Calendar Odd Days: Standard year = 1 odd day. Leap year = 2 odd days.',
        'Century Odd Days: 100 years = 5, 200 years = 3, 300 years = 1, 400 years = 0.'
      ],
      speedTricks: [
        'A year is a leap year if divisible by 4 (or 400 for century years).',
        'Calendars repeat every 28 years for leap years and every 11 years for standard years.'
      ],
      proTip: 'If the calculated angle exceeds 180 degrees, subtract from 360 degrees to find the interior angle.'
    }
  ],
  Logical: [
    {
      topic: 'Coding-Decoding and Alphabet Series',
      importance: 'Frequency: 3 Questions',
      timeLimit: '30 seconds per question',
      formulas: [
        'Alphabet Positions (EJOTY Index): E=5, J=10, O=15, T=20, Y=25.',
        'Reverse Position Formula: Reverse Index = 27 - Forward Index.',
        'Opposite Letter Pairs: A-Z, B-Y, C-X, D-W, E-V, F-U, G-T, H-S, I-R, J-Q, K-P, L-O, M-N.'
      ],
      speedTricks: [
        'Write letter position indices 1-13 (A-M) and 14-26 (N-Z) on rough sheet prior to section start.'
      ],
      proTip: 'Identify whether the pattern uses positional shifts, reverse ordering, or letter substitutions.'
    },
    {
      topic: 'Blood Relations',
      importance: 'Frequency: 2 Questions',
      timeLimit: '40 seconds per question',
      formulas: [
        'Notation System: Male = (+), Female = (-), Married Pair = (=), Parent-Child = Vertical Line.',
        'Terminology: Maternal = Mother Side, Paternal = Father Side, Nephew = Sibling Son, Niece = Sibling Daughter.'
      ],
      speedTricks: [
        'Deconstruct complex relationship statements backwards from the narrator.'
      ],
      proTip: 'Determine gender strictly from explicit terms rather than names.'
    },
    {
      topic: 'Direction and Distance Sense',
      importance: 'Frequency: 1-2 Questions',
      timeLimit: '35 seconds per question',
      formulas: [
        'Shortest Distance: Resultant Distance = Square Root of (X^2 + Y^2).',
        'Cardinal Directions: North, South, East, West.',
        'Shadow Rules: Morning shadow points West. Evening shadow points East. Solar noon produces minimal shadow.'
      ],
      speedTricks: [
        'Track net horizontal and vertical displacements separately.'
      ],
      proTip: 'Sketch initial direction vectors on paper before computing final position.'
    },
    {
      topic: 'Syllogism',
      importance: 'Frequency: 2-3 Questions',
      timeLimit: '45 seconds per question',
      formulas: [
        'Standard Categorical Forms: Universal Positive (All A are B), Universal Negative (No A is B), Particular Positive (Some A are B), Particular Negative (Some A are not B).',
        'Venn Diagram Method: Represent statements using minimal overlapping circles.'
      ],
      speedTricks: [
        'A conclusion is valid only if it holds across every possible diagram layout.'
      ],
      proTip: 'Verify complementary pair conditions when evaluating Either-Or options.'
    },
    {
      topic: 'Seating Arrangement (Linear and Circular)',
      importance: 'Frequency: 4-5 Question Sets',
      timeLimit: '90 seconds per set',
      formulas: [
        'Inward Facing Circle: Clockwise = Left, Counter-Clockwise = Right.',
        'Outward Facing Circle: Clockwise = Right, Counter-Clockwise = Left.',
        'North Facing Line: Left = Westward, Right = Eastward.'
      ],
      speedTricks: [
        'Place fixed position constraints first before testing conditional variables.'
      ],
      proTip: 'Maintain parallel diagrams if multiple valid arrangements emerge initially.'
    }
  ],
  Verbal: [
    {
      topic: 'Subject-Verb Agreement and Grammar Rules',
      importance: 'Frequency: 3-4 Questions',
      timeLimit: '25 seconds per question',
      formulas: [
        'Rule 1: Expressions such as "Neither of", "Either of", "Each of", and "One of" require singular verbs.',
        'Rule 2: Subjects joined by "as well as", "together with", or "along with" govern verb agreement based on the first subject.',
        'Rule 3: Subjects joined by "Either...or" or "Neither...nor" govern verb agreement based on the nearest subject.',
        'Rule 4: Correlative structures: "Hardly/Scarcely...when" and "No sooner...than".'
      ],
      speedTricks: [
        'Isolate the core subject by ignoring intervening prepositional modifiers.'
      ],
      proTip: 'Ensure tense consistency across main and subordinate clauses.'
    },
    {
      topic: 'Vocabulary: Synonyms and Antonyms',
      importance: 'Frequency: 3 Questions',
      timeLimit: '15 seconds per question',
      formulas: [
        'Common Roots: Mal- (bad), Bene- (good), Anti- (against), Chrono- (time), Loqu- (speech), Omni- (all).',
        'Prefix Markers: Un-, In-, Dis-, Mis- indicate negation.'
      ],
      speedTricks: [
        'Evaluate context tone (positive, negative, neutral) to eliminate mismatched options.'
      ],
      proTip: 'Substitute options into the sentence to verify context compatibility.'
    },
    {
      topic: 'Sentence Rearrangement (Para Jumbles)',
      importance: 'Frequency: 2-3 Questions',
      timeLimit: '45 seconds per question',
      formulas: [
        'Noun-Pronoun Precedence: Nouns must precede demonstrative or personal pronouns.',
        'Structural Sequence: Introduction -> Explanation -> Evidence -> Conclusion.'
      ],
      speedTricks: [
        'Identify mandatory pairs using conjunctions and transition phrases.'
      ],
      proTip: 'Test option sequence combinations directly to save time.'
    }
  ],
  NonVerbal: [
    {
      topic: 'Pattern Series and Matrix Analogy',
      importance: 'Frequency: 2-3 Questions',
      timeLimit: '25 seconds per question',
      formulas: [
        'Rotational Tracking: Observe step rotations of 45°, 90°, or 180° degrees.',
        'Element Count: Monitor incremental changes in object count per step.',
        'Shading Shift: Track alternating shading patterns across matrix positions.'
      ],
      speedTricks: [
        'Track one individual feature across steps rather than evaluating the entire figure at once.'
      ],
      proTip: 'Use process of elimination on incorrect options after evaluating the first feature.'
    },
    {
      topic: 'Mirror and Water Images',
      importance: 'Frequency: 1-2 Questions',
      timeLimit: '20 seconds per question',
      formulas: [
        'Vertical Mirror Reflection: Left and right positions invert; top and bottom remain unchanged.',
        'Horizontal Water Reflection: Top and bottom positions invert; left and right remain unchanged.'
      ],
      speedTricks: [
        'Identify asymmetrical characters to eliminate invalid option flips.'
      ],
      proTip: 'Symmetrical characters (A, H, I, M, O, T, U, V, W, X, Y) retain their form in vertical mirror views.'
    }
  ],
  DI: [
    {
      topic: 'Data Interpretation (Charts, Tables, Graphs)',
      importance: 'Frequency: 4-5 Question Sets',
      timeLimit: '40 seconds per question',
      formulas: [
        'Percentage Change = (Final Value - Initial Value) / Initial Value * 100.',
        'Pie Chart Angle Conversion: Central Angle = (Category Value / Total Value) * 360 = Percentage * 3.6 degrees.'
      ],
      speedTricks: [
        'Round values to nearest significant digits when option gaps are wide.'
      ],
      proTip: 'Verify scale units and legend labels before executing calculations.'
    }
  ]
};
