# -*- coding: utf-8 -*-
"""
Tier 1 (Tests 1 to 5: Easy / Foundation) - 200 Unique Questions
"""

def generate_tier1():
    tests = []
    
    # ---------------------------------------------------------
    # TEST 1: Foundation Arithmetic & Core Reasoning (40 Qs)
    # ---------------------------------------------------------
    t1_qs = [
        # Quant (1-12)
        {
            "id": "m1-q1", "section": "Quant", "difficulty": "Foundation",
            "question": "What is the highest common factor (HCF) of 54 and 90?",
            "options": ["9", "18", "27", "36"], "correctIndex": 1,
            "explanation": "Step 1: 54 = 2 * 3^3, 90 = 2 * 3^2 * 5.\nStep 2: Common prime factors with lowest powers = 2^1 * 3^2 = 18.\nTherefore, the HCF is 18."
        },
        {
            "id": "m1-q2", "section": "Quant", "difficulty": "Foundation",
            "question": "If 40% of a number is 160, what is 75% of that same number?",
            "options": ["240", "280", "300", "320"], "correctIndex": 2,
            "explanation": "Step 1: 0.40 * N = 160 => N = 160 / 0.4 = 400.\nStep 2: 75% of 400 = 0.75 * 400 = 300."
        },
        {
            "id": "m1-q3", "section": "Quant", "difficulty": "Foundation",
            "question": "A can finish a task in 12 days and B can finish it in 24 days. Working together, how many days will they take to complete the task?",
            "options": ["6 days", "8 days", "10 days", "16 days"], "correctIndex": 1,
            "explanation": "Step 1: 1-day work = 1/12 + 1/24 = 3/24 = 1/8.\nStep 2: Total time required = 8 days."
        },
        {
            "id": "m1-q4", "section": "Quant", "difficulty": "Foundation",
            "question": "A car travels a distance of 180 km in 3 hours. If it increases its speed by 20 km/hr, how long will it take to travel the same distance?",
            "options": ["2.0 hours", "2.25 hours", "2.5 hours", "2.75 hours"], "correctIndex": 1,
            "explanation": "Step 1: Initial speed = 180 / 3 = 60 km/hr.\nStep 2: New speed = 60 + 20 = 80 km/hr.\nStep 3: New time = 180 / 80 = 2.25 hours (2 hrs 15 mins)."
        },
        {
            "id": "m1-q5", "section": "Quant", "difficulty": "Foundation",
            "question": "An article bought for Rs. 800 is sold for Rs. 960. Find the profit percentage.",
            "options": ["16%", "18%", "20%", "25%"], "correctIndex": 2,
            "explanation": "Step 1: Profit = 960 - 800 = Rs. 160.\nStep 2: Profit % = (160 / 800) * 100 = 20%."
        },
        {
            "id": "m1-q6", "section": "Quant", "difficulty": "Foundation",
            "question": "The average of four numbers is 35. If three of the numbers are 28, 36, and 42, find the fourth number.",
            "options": ["30", "34", "36", "40"], "correctIndex": 1,
            "explanation": "Step 1: Sum of 4 numbers = 4 * 35 = 140.\nStep 2: Sum of 3 given = 28 + 36 + 42 = 106.\nStep 3: Fourth number = 140 - 106 = 34."
        },
        {
            "id": "m1-q7", "section": "Quant", "difficulty": "Foundation",
            "question": "Find the simple interest on a principal of Rs. 12,000 for 2 years at an annual interest rate of 6.5%.",
            "options": ["Rs. 1,440", "Rs. 1,560", "Rs. 1,620", "Rs. 1,750"], "correctIndex": 1,
            "explanation": "Step 1: SI = (P * R * T) / 100 = (12000 * 6.5 * 2) / 100 = Rs. 1,560."
        },
        {
            "id": "m1-q8", "section": "Quant", "difficulty": "Foundation",
            "question": "Two numbers are in the ratio 5 : 8. If their difference is 36, what is the value of the larger number?",
            "options": ["60", "84", "96", "108"], "correctIndex": 2,
            "explanation": "Step 1: 8x - 5x = 3x = 36 => x = 12.\nStep 2: Larger number = 8 * 12 = 96."
        },
        {
            "id": "m1-q9", "section": "Quant", "difficulty": "Foundation",
            "question": "Pipe A can fill a tank in 6 hours and Pipe B can fill it in 9 hours. If both pipes are opened together, how long will it take to fill the tank?",
            "options": ["3.2 hours", "3.6 hours", "4.0 hours", "4.5 hours"], "correctIndex": 1,
            "explanation": "Step 1: Combined filling rate = 1/6 + 1/9 = 5/18 tank/hr.\nStep 2: Time taken = 18 / 5 = 3.6 hours."
        },
        {
            "id": "m1-q10", "section": "Quant", "difficulty": "Foundation",
            "question": "The ratio of present ages of father and son is 7 : 2. If the father is 35 years older than the son, find the son’s present age.",
            "options": ["10 years", "12 years", "14 years", "15 years"], "correctIndex": 2,
            "explanation": "Step 1: 7x - 2x = 5x = 35 => x = 7.\nStep 2: Son's age = 2 * 7 = 14 years."
        },
        {
            "id": "m1-q11", "section": "Quant", "difficulty": "Foundation",
            "question": "A square field has a perimeter of 160 meters. What is the area of the field in square meters?",
            "options": ["1,200 sq m", "1,440 sq m", "1,600 sq m", "1,800 sq m"], "correctIndex": 2,
            "explanation": "Step 1: Side = 160 / 4 = 40 m.\nStep 2: Area = 40^2 = 1,600 sq meters."
        },
        {
            "id": "m1-q12", "section": "Quant", "difficulty": "Foundation",
            "question": "What is the unit digit in the expansion of 7^43?",
            "options": ["1", "3", "7", "9"], "correctIndex": 1,
            "explanation": "Step 1: Cyclicity of powers of 7 is 4.\nStep 2: 43 mod 4 = 3.\nStep 3: 7^3 = 343, so the unit digit is 3."
        },
        # Logical (13-22)
        {
            "id": "m1-q13", "section": "Logical", "difficulty": "Foundation",
            "question": "In a certain code language, 'LIGHT' is written as 'MJHIU'. How is 'FLAME' written in that code?",
            "options": ["GMBNF", "GMBLE", "GKALF", "GLAMF"], "correctIndex": 0,
            "explanation": "Step 1: Forward alphabet shift of +1 per letter.\nStep 2: F(+1)=G, L(+1)=M, A(+1)=B, M(+1)=N, E(+1)=F => GMBNF."
        },
        {
            "id": "m1-q14", "section": "Logical", "difficulty": "Foundation",
            "question": "Find the next number in the series: 3, 7, 15, 31, 63, ?",
            "options": ["95", "112", "127", "135"], "correctIndex": 2,
            "explanation": "Step 1: Pattern is 2*N + 1.\nStep 2: 63 * 2 + 1 = 127."
        },
        {
            "id": "m1-q15", "section": "Logical", "difficulty": "Foundation",
            "question": "Pointing to a photograph, a woman says, 'He is the son of the only daughter of my father.' How is the boy in the photograph related to the woman?",
            "options": ["Brother", "Son", "Nephew", "Father"], "correctIndex": 1,
            "explanation": "Step 1: Only daughter of her father is herself.\nStep 2: Son of herself = her Son."
        },
        {
            "id": "m1-q16", "section": "Logical", "difficulty": "Foundation",
            "question": "A person walks 12 meters South, turns left and walks 5 meters. How far is he from his starting point?",
            "options": ["13 m", "15 m", "17 m", "19 m"], "correctIndex": 0,
            "explanation": "Step 1: Right triangle with legs 12m and 5m.\nStep 2: Distance = sqrt(12^2 + 5^2) = 13 meters."
        },
        {
            "id": "m1-q17", "section": "Logical", "difficulty": "Foundation",
            "question": "In a row of 30 students, Karan ranks 8th from the left. What is his rank from the right end?",
            "options": ["22nd", "23rd", "24th", "25th"], "correctIndex": 1,
            "explanation": "Step 1: Rank from right = 30 - 8 + 1 = 23rd."
        },
        {
            "id": "m1-q18", "section": "Logical", "difficulty": "Foundation",
            "question": "Find the odd one out: Mercury, Venus, Moon, Mars, Jupiter.",
            "options": ["Venus", "Moon", "Mars", "Mercury"], "correctIndex": 1,
            "explanation": "Step 1: Mercury, Venus, Mars, Jupiter are planets.\nStep 2: Moon is a natural satellite."
        },
        {
            "id": "m1-q19", "section": "Logical", "difficulty": "Foundation",
            "question": "Statements:\n1. All roses are flowers.\n2. All flowers are plants.\nConclusions:\nI. All roses are plants.\nII. Some plants are roses.",
            "options": ["Only I follows", "Only II follows", "Neither follows", "Both I and II follow"], "correctIndex": 3,
            "explanation": "Step 1: Roses are inside flowers, flowers are inside plants => All roses are plants.\nStep 2: Plants contain roses => Some plants are roses. Both follow."
        },
        {
            "id": "m1-q20", "section": "Logical", "difficulty": "Foundation",
            "question": "If CAT is coded as 24 and DOG is coded as 26, how is TIGER coded using sum of alphabet positions?",
            "options": ["54", "59", "62", "65"], "correctIndex": 1,
            "explanation": "Step 1: T(20) + I(9) + G(7) + E(5) + R(18) = 59."
        },
        {
            "id": "m1-q21", "section": "Logical", "difficulty": "Foundation",
            "question": "Four friends A, B, C, and D sit in a row facing North. B is to the immediate right of A. C is to the left of A. D is to the immediate right of B. Who is at the extreme left?",
            "options": ["A", "B", "C", "D"], "correctIndex": 2,
            "explanation": "Step 1: Sequence from left to right: C -> A -> B -> D.\nStep 2: Extreme left is C."
        },
        {
            "id": "m1-q22", "section": "Logical", "difficulty": "Foundation",
            "question": "If January 1st of a non-leap year is a Friday, what day of the week will January 31st be?",
            "options": ["Friday", "Saturday", "Sunday", "Monday"], "correctIndex": 2,
            "explanation": "Step 1: 30 elapsed days mod 7 = 2 odd days.\nStep 2: Friday + 2 days = Sunday."
        },
        # Verbal (23-32)
        {
            "id": "m1-q23", "section": "Verbal", "difficulty": "Foundation",
            "question": "Select the synonym for 'DILIGENT':",
            "options": ["Careless", "Hardworking", "Hesitant", "Arrogant"], "correctIndex": 1,
            "explanation": "Step 1: 'Diligent' means showing steady and earnest effort.\nStep 2: Synonym is 'Hardworking'."
        },
        {
            "id": "m1-q24", "section": "Verbal", "difficulty": "Foundation",
            "question": "Choose the antonym for 'TRANSPARENT':",
            "options": ["Clear", "Lucid", "Opaque", "Translucent"], "correctIndex": 2,
            "explanation": "Step 1: 'Transparent' means allowing light to pass clearly.\nStep 2: Opposite is 'Opaque' (not transparent)."
        },
        {
            "id": "m1-q25", "section": "Verbal", "difficulty": "Foundation",
            "question": "Identify the sentence with correct subject-verb agreement:",
            "options": ["The group of students were studying late.", "The group of students was studying late.", "The group of students are studying late.", "The group of students have studied late."], "correctIndex": 1,
            "explanation": "Step 1: The singular collective noun 'group' agrees with the singular verb 'was'."
        },
        {
            "id": "m1-q26", "section": "Verbal", "difficulty": "Foundation",
            "question": "Fill in the blank: 'He has been living in Bengaluru _____ 2018.'",
            "options": ["for", "since", "from", "in"], "correctIndex": 1,
            "explanation": "Step 1: 'Since' is used with specific starting points in the past with perfect continuous tenses."
        },
        {
            "id": "m1-q27", "section": "Verbal", "difficulty": "Foundation",
            "question": "Choose the correctly spelled word:",
            "options": ["Occurrence", "Occurence", "Ocurrence", "Occurrance"], "correctIndex": 0,
            "explanation": "Step 1: Correct spelling is OCCURRENCE (double c, double r, -ence)."
        },
        {
            "id": "m1-q28", "section": "Verbal", "difficulty": "Foundation",
            "question": "What is the meaning of the idiom 'Break the ice'?",
            "options": ["To crack a frozen surface", "To initiate conversation in a social setting and ease tension", "To end a long friendship", "To cause an argument"], "correctIndex": 1,
            "explanation": "Step 1: 'Break the ice' means to relieve initial social awkwardness."
        },
        {
            "id": "m1-q29", "section": "Verbal", "difficulty": "Foundation",
            "question": "Spot the error: 'Each of the participants (A) / were given a certificate (B) / after the seminar (C) / ended. (D)'",
            "options": ["A", "B", "C", "D"], "correctIndex": 1,
            "explanation": "Step 1: 'Each of' requires singular verb 'was given' instead of 'were given' in Segment B."
        },
        {
            "id": "m1-q30", "section": "Verbal", "difficulty": "Foundation",
            "question": "Fill in the blank: 'She is _____ European scientist who won the prestigious award.'",
            "options": ["a", "an", "the", "no article required"], "correctIndex": 0,
            "explanation": "Step 1: 'European' starts with the consonant sound /juː/ so it takes the indefinite article 'a'."
        },
        {
            "id": "m1-q31", "section": "Verbal", "difficulty": "Foundation",
            "question": "Rearrange the segments into a coherent sentence:\nP: to build efficient algorithms\nQ: software developers must\nR: understand data structures\nS: before optimizing code",
            "options": ["Q - R - P - S", "P - Q - R - S", "S - Q - P - R", "R - Q - P - S"], "correctIndex": 0,
            "explanation": "Step 1: Logical order is Q -> R -> P -> S: 'Software developers must understand data structures to build efficient algorithms before optimizing code.'"
        },
        {
            "id": "m1-q32", "section": "Verbal", "difficulty": "Foundation",
            "question": "Complete the analogy:\nBook : Author :: Symphony : ?",
            "options": ["Musician", "Composer", "Pianist", "Conductor"], "correctIndex": 1,
            "explanation": "Step 1: An author creates a book; a composer creates a symphony."
        },
        # Non-Verbal (33-36)
        {
            "id": "m1-q33", "section": "NonVerbal", "difficulty": "Foundation",
            "question": "Identify the next term in the geometric dot pattern: [1 Dot, 3 Dots, 6 Dots, 10 Dots, ?]",
            "options": ["12 Dots", "15 Dots", "18 Dots", "20 Dots"], "correctIndex": 1,
            "explanation": "Step 1: Triangular numbers T_n = n(n+1)/2. For n=5, 5*6/2 = 15 Dots."
        },
        {
            "id": "m1-q34", "section": "NonVerbal", "difficulty": "Foundation",
            "question": "What is the reflection of the word 'CODE' across a horizontal mirror placed directly below the word (Water Image)?",
            "options": ["CODE vertically inverted", "EDOC", "CODB", "GODE"], "correctIndex": 0,
            "explanation": "Step 1: A horizontal mirror reflects vertically upside down. C, O, D, E retain their horizontal symmetry."
        },
        {
            "id": "m1-q35", "section": "NonVerbal", "difficulty": "Foundation",
            "question": "A square paper is folded in half diagonally, then in half again. Three small circular holes are punched through all layers. How many holes appear when completely unfolded?",
            "options": ["6 holes", "8 holes", "12 holes", "16 holes"], "correctIndex": 2,
            "explanation": "Step 1: Two folds produce 4 layers. 3 holes * 4 layers = 12 holes."
        },
        {
            "id": "m1-q36", "section": "NonVerbal", "difficulty": "Foundation",
            "question": "A clock face shows 3:00. If the minute hand is rotated 90 degrees clockwise, what time does it indicate?",
            "options": ["3:10", "3:15", "3:20", "3:30"], "correctIndex": 1,
            "explanation": "Step 1: 90° clockwise on clock = 90 / 6°/min = 15 minutes => 3:15."
        },
        # DI (37-40)
        {
            "id": "m1-q37", "section": "DI", "difficulty": "Foundation",
            "question": "Table Data: Enrollment across branches: CS = 180, IT = 120, ECE = 150, ME = 90. What percentage of total students are in CS?",
            "options": ["30%", "33.33%", "35%", "37.5%"], "correctIndex": 1,
            "explanation": "Step 1: Total = 180+120+150+90 = 540.\nStep 2: CS % = (180 / 540) * 100 = 33.33%."
        },
        {
            "id": "m1-q38", "section": "DI", "difficulty": "Foundation",
            "question": "Bar Chart: Production of units over 3 years: 2021 = 40k, 2022 = 60k, 2023 = 75k. What is the average annual production?",
            "options": ["55k", "58.33k", "60k", "62.5k"], "correctIndex": 1,
            "explanation": "Step 1: Average = (40 + 60 + 75) / 3 = 175 / 3 = 58.33k."
        },
        {
            "id": "m1-q39", "section": "DI", "difficulty": "Foundation",
            "question": "In a budget pie chart, Marketing accounts for a 72° sector. If total budget is $500,000, what is the Marketing allocation?",
            "options": ["$75,000", "$100,000", "$120,000", "$150,000"], "correctIndex": 1,
            "explanation": "Step 1: 72° / 360° = 20%.\nStep 2: 20% of $500,000 = $100,000."
        },
        {
            "id": "m1-q40", "section": "DI", "difficulty": "Foundation",
            "question": "A line graph shows revenue: Jan = $20k, Feb = $25k, Mar = $30k, Apr = $40k. What is the percentage increase from Jan to Apr?",
            "options": ["50%", "75%", "100%", "125%"], "correctIndex": 2,
            "explanation": "Step 1: Increase = 40k - 20k = 20k.\nStep 2: % Increase = (20 / 20) * 100 = 100%."
        }
    ]
    
    tests.append({
        "id": "mock-test-1", "sectionId": "foundation", "testNumber": 1,
        "title": "Foundation Arithmetic & Core Reasoning", "level": "Foundation",
        "focus": "Numbers, Ratios & Elementary Logic", "difficulty": "Foundation",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t1_qs
    })
    
    # Let's write the remaining tests 2 to 5 for Tier 1
    # We will build test 2, 3, 4, 5 with identical rigor and 0 repetitions!
    return tests

print("Tier 1 partial generated.")
