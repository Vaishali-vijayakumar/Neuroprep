// IndiaBIX Style Categorized Aptitude & Reasoning Topic Bank

export const APTITUDE_CATEGORIES = [
  { id: 'Quant', label: 'Quantitative Aptitude', icon: 'Calculator' },
  { id: 'Logical', label: 'Logical Reasoning', icon: 'Brain' },
  { id: 'Verbal', label: 'Verbal Ability', icon: 'BookOpen' },
  { id: 'NonVerbal', label: 'Non-Verbal Reasoning', icon: 'Shapes' },
  { id: 'DI', label: 'Data Interpretation', icon: 'BarChart2' }
];

export const TOPIC_DATA = {
  Quant: [
    {
      id: 'time-work',
      title: 'Time and Work',
      shortcut: 'If A takes x days and B takes y days, together they take (x*y)/(x+y) days.',
      questions: [
        {
          id: 'q-tw-1',
          companyTag: 'TCS NQT / Infosys',
          question: 'A can complete a piece of work in 12 days, while B can complete the same work in 16 days. If they work together for 4 days, what fraction of the work remains unfinished?',
          options: ['1/4', '5/12', '7/12', '1/3'],
          correctIndex: 1,
          explanation: '1 day work of (A + B) = 1/12 + 1/16 = 7/48. Work completed in 4 days = 4 * (7/48) = 7/12. Unfinished work = 1 - 7/12 = 5/12.'
        },
        {
          id: 'q-tw-2',
          companyTag: 'Accenture / Cognizant',
          question: 'A and B together can do a job in 12 days. B alone can do it in 30 days. In how many days can A alone complete the job?',
          options: ['18 days', '20 days', '24 days', '25 days'],
          correctIndex: 1,
          explanation: "A's 1 day work = (1/12) - (1/30) = (5 - 2)/60 = 3/60 = 1/20. Hence A alone takes 20 days."
        },
        {
          id: 'q-tw-3',
          companyTag: 'Zoho / Wipro',
          question: '3 men or 6 women can do a piece of work in 16 days. In how many days can 12 men and 8 women do the same work?',
          options: ['3 days', '4 days', '5 days', '6 days'],
          correctIndex: 0,
          explanation: '3 Men = 6 Women => 1 Man = 2 Women. 12 Men + 8 Women = 24 + 8 = 32 Women. 6 Women take 16 days => 1 Woman takes 96 days. 32 Women take 96 / 32 = 3 days.'
        }
      ]
    },
    {
      id: 'speed-distance',
      title: 'Speed, Time and Distance',
      shortcut: 'Speed = Distance / Time; km/hr to m/s multiply by 5/18.',
      questions: [
        {
          id: 'q-sd-1',
          companyTag: 'TCS NQT / Cognizant',
          question: 'A train 150 meters long crosses a telegraph pole in 9 seconds. What is the speed of the train in km/hr?',
          options: ['50 km/hr', '60 km/hr', '72 km/hr', '80 km/hr'],
          correctIndex: 1,
          explanation: 'Speed in m/s = 150/9 = 50/3 m/s. Speed in km/hr = (50/3) * (18/5) = 60 km/hr.'
        },
        {
          id: 'q-sd-2',
          companyTag: 'Infosys / Wipro',
          question: 'A person travels at 40 km/hr for 2 hours and at 60 km/hr for 3 hours. What is the average speed of the entire journey?',
          options: ['50 km/hr', '52 km/hr', '54 km/hr', '56 km/hr'],
          correctIndex: 1,
          explanation: 'Total Distance = (40*2) + (60*3) = 80 + 180 = 260 km. Total Time = 2 + 3 = 5 hours. Average Speed = 260 / 5 = 52 km/hr.'
        }
      ]
    },
    {
      id: 'profit-loss',
      title: 'Profit and Loss',
      shortcut: 'Profit % = (Profit / CP) * 100; Loss % = (Loss / CP) * 100.',
      questions: [
        {
          id: 'q-pl-1',
          companyTag: 'Zoho / Capgemini',
          question: 'The cost price of 20 articles is equal to the selling price of 16 articles. What is the profit percentage?',
          options: ['20%', '25%', '30%', '33.33%'],
          correctIndex: 1,
          explanation: 'Let CP of 1 article = Re 1. CP of 16 = Rs 16. SP of 16 = CP of 20 = Rs 20. Profit = 20 - 16 = 4. Profit % = (4 / 16) * 100 = 25%.'
        },
        {
          id: 'q-pl-2',
          companyTag: 'Accenture / LTI',
          question: 'An item marked at Rs. 800 is sold for Rs. 680 after a single discount. Find the discount rate.',
          options: ['12%', '15%', '18%', '20%'],
          correctIndex: 1,
          explanation: 'Discount Amount = 800 - 680 = 120. Discount % = (120 / 800) * 100 = 15%.'
        }
      ]
    },
    {
      id: 'perm-comb',
      title: 'Permutations & Combinations',
      shortcut: 'nPr = n! / (n-r)! ; nCr = n! / (r! * (n-r)!).',
      questions: [
        {
          id: 'q-pc-1',
          companyTag: 'TCS Digital / IBM',
          question: 'In how many different ways can the letters of the word "LEADER" be arranged?',
          options: ['180', '360', '720', '1440'],
          correctIndex: 1,
          explanation: 'The word LEADER contains 6 letters where E is repeated 2 times. Ways = 6! / 2! = 720 / 2 = 360.'
        }
      ]
    }
  ],
  Logical: [
    {
      id: 'blood-relations',
      title: 'Blood Relations',
      shortcut: 'Use tree diagrams with + for male, - for female, = for spouse.',
      questions: [
        {
          id: 'q-br-1',
          companyTag: 'Accenture / Wipro',
          question: "Pointing to a photograph of a man, Rahul said, 'His mother is the only daughter of my mother.' How is Rahul related to the man?",
          options: ['Brother', 'Uncle', 'Father', 'Grandfather'],
          correctIndex: 1,
          explanation: "Only daughter of Rahul's mother = Rahul's sister. The man's mother is Rahul's sister. Therefore, Rahul is the man's maternal uncle."
        },
        {
          id: 'q-br-2',
          companyTag: 'Infosys / Cognizant',
          question: 'A is B\'s brother. C is A\'s mother. D is C\'s father. E is B\'s son. How is D related to A?',
          options: ['Grandfather', 'Father', 'Uncle', 'Brother'],
          correctIndex: 0,
          explanation: 'A & B are siblings. C is their mother. D is C\'s father. So D is the maternal grandfather of A.'
        }
      ]
    },
    {
      id: 'number-series',
      title: 'Number & Letter Series',
      shortcut: 'Check differences, double differences, prime steps, squares/cubes, or alternating operations.',
      questions: [
        {
          id: 'q-ns-1',
          companyTag: 'TCS Digital / Infosys',
          question: 'Look at the number pattern: 7, 10, 8, 11, 9, 12, ... What number should come next?',
          options: ['7', '10', '12', '13'],
          correctIndex: 1,
          explanation: 'Alternating (+3, -2) pattern: 7+3=10, 10-2=8, 8+3=11, 11-2=9, 9+3=12, 12-2=10.'
        },
        {
          id: 'q-ns-2',
          companyTag: 'Capgemini / HCL',
          question: 'Complete the series: 2, 6, 12, 20, 30, 42, ?',
          options: ['52', '54', '56', '60'],
          correctIndex: 2,
          explanation: 'Differences are +4, +6, +8, +10, +12, so next difference is +14. 42 + 14 = 56. (Also n^2 + n: 1+1, 4+2, 9+3, 16+4, 25+5, 36+6, 49+7=56).'
        }
      ]
    },
    {
      id: 'syllogism',
      title: 'Syllogism',
      shortcut: 'Draw Venn diagrams for All, Some, No statements.',
      questions: [
        {
          id: 'q-syl-1',
          companyTag: 'TCS NQT / Mindtree',
          question: 'Statements: All cats are dogs. All dogs are birds.\nConclusions:\nI. All cats are birds.\nII. Some birds are cats.',
          options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
          correctIndex: 2,
          explanation: 'Since Cats ⊂ Dogs and Dogs ⊂ Birds, Cats ⊂ Birds (All cats are birds). Also, since Cats ⊂ Birds and Cats exist, Some birds are cats. Both follow.'
        }
      ]
    }
  ],
  Verbal: [
    {
      id: 'synonyms-antonyms',
      title: 'Synonyms & Antonyms',
      shortcut: 'Analyze prefixes/suffixes (e.g. mal- bad, bene- good, anti- against).',
      questions: [
        {
          id: 'q-sa-1',
          companyTag: 'Cognizant GenC / TCS',
          question: 'Choose the word that is most nearly OPPOSITE in meaning to MITIGATE:',
          options: ['Alleviate', 'Aggravate', 'Diminish', 'Relieve'],
          correctIndex: 1,
          explanation: 'Mitigate means to make less severe. Antonym: Aggravate (to make worse or more severe).'
        },
        {
          id: 'q-sa-2',
          companyTag: 'Accenture / Zoho',
          question: 'Choose the word that is SYNONYMOUS to CANDID:',
          options: ['Secretive', 'Frank', 'Deceitful', 'Hesitant'],
          correctIndex: 1,
          explanation: 'Candid means truthful and straightforward. Synonym: Frank.'
        }
      ]
    },
    {
      id: 'error-spotting',
      title: 'Sentence Correction & Grammar',
      shortcut: 'Check subject-verb agreement, tense consistency, prepositions, and modifier placement.',
      questions: [
        {
          id: 'q-es-1',
          companyTag: 'Infosys / Accenture',
          question: 'Fill in the blank with the correct preposition: "The candidate was absorbed _____ his preparation for the upcoming technical round."',
          options: ['at', 'with', 'in', 'for'],
          correctIndex: 2,
          explanation: 'Standard idiomatic phrasing is "absorbed in" something.'
        },
        {
          id: 'q-es-2',
          companyTag: 'TCS NQT / Wipro',
          question: 'Identify the error segment: "Neither of the two candidates (A) / have cleared (B) / the final round (C) / of interview. (D)"',
          options: ['A', 'B', 'C', 'No error'],
          correctIndex: 1,
          explanation: '"Neither of" takes a singular verb. It should be "has cleared" instead of "have cleared". Segment B is incorrect.'
        }
      ]
    }
  ],
  NonVerbal: [
    {
      id: 'pattern-completion',
      title: 'Pattern & Figure Series',
      shortcut: 'Track rotations (45°, 90° clockwise/counter-clockwise), count of elements, and shading.',
      questions: [
        {
          id: 'q-nv-1',
          companyTag: 'TCS Digital / Infosys InfyTQ',
          question: 'A square matrix has dots rotating clockwise: 1 dot at Top-Left, 2 dots at Top-Right, 3 dots at Bottom-Right. Where will 4 dots be located in the next figure?',
          options: ['Top-Left', 'Bottom-Left', 'Center', 'Bottom-Right'],
          correctIndex: 1,
          explanation: 'Following clockwise rotation across 4 corners: TL -> TR -> BR -> BL. The 4 dots will be at Bottom-Left.'
        },
        {
          id: 'q-nv-2',
          companyTag: 'Accenture / Cognizant',
          question: 'Select the correct mirror image of the word "PLACEMENT" when mirror is placed to the right:',
          options: ['TNEMECALP (Reversed)', 'TNƎWƎƆA⅃ꟼ', 'LNEMECAPT', 'TNEWMECALP'],
          correctIndex: 1,
          explanation: 'A right-side mirror inverts letter order and flips individual non-symmetric letters horizontally.'
        }
      ]
    }
  ],
  DI: [
    {
      id: 'charts-graphs',
      title: 'Data Interpretation (Charts & Graphs)',
      shortcut: 'Quickly sum totals, estimate fractions, and compute growth rates: (Final - Initial) / Initial * 100.',
      questions: [
        {
          id: 'q-di-1',
          companyTag: 'TCS NQT / Deloitte',
          question: 'If a company\'s revenue over 4 quarters is 120 Cr, 150 Cr, 180 Cr, and 210 Cr, what is the percentage growth from Quarter 1 to Quarter 4?',
          options: ['50%', '60%', '75%', '80%'],
          correctIndex: 2,
          explanation: 'Growth = (210 - 120) / 120 = 90 / 120 = 0.75 = 75%.'
        },
        {
          id: 'q-di-2',
          companyTag: 'Infosys / Cognizant',
          question: 'In a pie chart representing candidate preferences: Coding (40%), Aptitude (30%), Interview (20%), Soft Skills (10%). What is the central angle for Aptitude?',
          options: ['90°', '108°', '120°', '144°'],
          correctIndex: 1,
          explanation: 'Central Angle = Percentage * 3.6° = 30 * 3.6° = 108°.'
        }
      ]
    }
  ]
};
