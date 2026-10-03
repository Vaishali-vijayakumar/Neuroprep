# -*- coding: utf-8 -*-
"""
Generate Tier 1 (Easy / Foundation): Tests 1 to 5 (200 unique questions)
"""

def get_easy_tests(make_q):
    tests = []
    
    # ---------------------------------------------------------
    # Test 1: Foundation Arithmetic & Core Reasoning
    # ---------------------------------------------------------
    t1_qs = [
        # Quant (1-12)
        make_q('m1-q1', 'Quant', 'Foundation', 'What is the highest common factor (HCF) of 54 and 90?', '18', '9', '27', '36', 'Step 1: 54 = 2 * 3^3, 90 = 2 * 3^2 * 5.\nStep 2: Common prime factors with lowest powers = 2^1 * 3^2 = 18.\nTherefore, the HCF is 18.'),
        make_q('m1-q2', 'Quant', 'Foundation', 'If 40% of a number is 160, what is 75% of that same number?', '300', '240', '280', '320', 'Step 1: 0.40 * N = 160 => N = 160 / 0.4 = 400.\nStep 2: 75% of 400 = 0.75 * 400 = 300.'),
        make_q('m1-q3', 'Quant', 'Foundation', 'A can finish a task in 12 days and B can finish it in 24 days. Working together, how many days will they take to complete the task?', '8 days', '6 days', '10 days', '16 days', 'Step 1: 1-day work = 1/12 + 1/24 = 3/24 = 1/8.\nStep 2: Total time required = 8 days.'),
        make_q('m1-q4', 'Quant', 'Foundation', 'A car travels a distance of 180 km in 3 hours. If it increases its speed by 20 km/hr, how long will it take to travel the same distance?', '2.25 hours', '2.0 hours', '2.5 hours', '2.75 hours', 'Step 1: Initial speed = 180 / 3 = 60 km/hr.\nStep 2: New speed = 60 + 20 = 80 km/hr.\nStep 3: New time = 180 / 80 = 2.25 hours (2 hrs 15 mins).'),
        make_q('m1-q5', 'Quant', 'Foundation', 'An article bought for Rs. 800 is sold for Rs. 960. Find the profit percentage.', '20%', '16%', '18%', '25%', 'Step 1: Profit = 960 - 800 = Rs. 160.\nStep 2: Profit % = (160 / 800) * 100 = 20%.'),
        make_q('m1-q6', 'Quant', 'Foundation', 'The average of four numbers is 35. If three of the numbers are 28, 36, and 42, find the fourth number.', '34', '30', '36', '40', 'Step 1: Sum of 4 numbers = 4 * 35 = 140.\nStep 2: Sum of 3 given = 28 + 36 + 42 = 106.\nStep 3: Fourth number = 140 - 106 = 34.'),
        make_q('m1-q7', 'Quant', 'Foundation', 'Find the simple interest on a principal of Rs. 12,000 for 2 years at an annual interest rate of 6.5%.', 'Rs. 1,560', 'Rs. 1,440', 'Rs. 1,620', 'Rs. 1,750', 'Step 1: SI = (P * R * T) / 100 = (12000 * 6.5 * 2) / 100 = Rs. 1,560.'),
        make_q('m1-q8', 'Quant', 'Foundation', 'Two numbers are in the ratio 5 : 8. If their difference is 36, what is the value of the larger number?', '96', '60', '84', '108', 'Step 1: 8x - 5x = 3x = 36 => x = 12.\nStep 2: Larger number = 8 * 12 = 96.'),
        make_q('m1-q9', 'Quant', 'Foundation', 'Pipe A can fill a tank in 6 hours and Pipe B can fill it in 9 hours. If both pipes are opened together, how long will it take to fill the tank?', '3.6 hours', '3.2 hours', '4.0 hours', '4.5 hours', 'Step 1: Combined filling rate = 1/6 + 1/9 = 5/18 tank/hr.\nStep 2: Time taken = 18 / 5 = 3.6 hours.'),
        make_q('m1-q10', 'Quant', 'Foundation', 'The ratio of present ages of father and son is 7 : 2. If the father is 35 years older than the son, find the son’s present age.', '14 years', '10 years', '12 years', '15 years', 'Step 1: 7x - 2x = 5x = 35 => x = 7.\nStep 2: Son\'s age = 2 * 7 = 14 years.'),
        make_q('m1-q11', 'Quant', 'Foundation', 'A square field has a perimeter of 160 meters. What is the area of the field in square meters?', '1,600 sq m', '1,200 sq m', '1,440 sq m', '1,800 sq m', 'Step 1: Side = 160 / 4 = 40 m.\nStep 2: Area = 40^2 = 1,600 sq meters.'),
        make_q('m1-q12', 'Quant', 'Foundation', 'What is the unit digit in the expansion of 7^43?', '3', '1', '7', '9', 'Step 1: Cyclicity of powers of 7 is 4.\nStep 2: 43 mod 4 = 3.\nStep 3: 7^3 = 343, so the unit digit is 3.'),
        # Logical (13-22)
        make_q('m1-q13', 'Logical', 'Foundation', 'In a certain code language, "LIGHT" is written as "MJHIU". How is "FLAME" written in that code?', 'GMBNF', 'GMBLE', 'GKALF', 'GLAMF', 'Step 1: Forward alphabet shift of +1 per letter.\nStep 2: F(+1)=G, L(+1)=M, A(+1)=B, M(+1)=N, E(+1)=F => GMBNF.'),
        make_q('m1-q14', 'Logical', 'Foundation', 'Find the next number in the arithmetic-doubling series: 3, 7, 15, 31, 63, ?', '127', '95', '112', '135', 'Step 1: Pattern is 2*N + 1.\nStep 2: 63 * 2 + 1 = 127.'),
        make_q('m1-q15', 'Logical', 'Foundation', 'Pointing to a photograph, a woman says, "He is the son of the only daughter of my father." How is the boy in the photograph related to the woman?', 'Son', 'Brother', 'Nephew', 'Father', 'Step 1: Only daughter of her father is herself.\nStep 2: Son of herself = her Son.'),
        make_q('m1-q16', 'Logical', 'Foundation', 'A person walks 12 meters South, turns left and walks 5 meters. How far is he from his starting point?', '13 m', '15 m', '17 m', '19 m', 'Step 1: Right triangle with legs 12m and 5m.\nStep 2: Distance = sqrt(12^2 + 5^2) = 13 meters.'),
        make_q('m1-q17', 'Logical', 'Foundation', 'In a row of 30 students, Karan ranks 8th from the left. What is his rank from the right end?', '23rd', '22nd', '24th', '25th', 'Step 1: Rank from right = 30 - 8 + 1 = 23rd.'),
        make_q('m1-q18', 'Logical', 'Foundation', 'Find the odd one out among celestial bodies: Mercury, Venus, Moon, Mars, Jupiter.', 'Moon', 'Venus', 'Mars', 'Mercury', 'Step 1: Mercury, Venus, Mars, Jupiter are planets.\nStep 2: Moon is a natural satellite.'),
        make_q('m1-q19', 'Logical', 'Foundation', 'Statements:\n1. All roses are flowers.\n2. All flowers are plants.\nConclusions:\nI. All roses are plants.\nII. Some plants are roses.', 'Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows', 'Step 1: Roses are inside flowers, flowers are inside plants => All roses are plants.\nStep 2: Plants contain roses => Some plants are roses. Both follow.'),
        make_q('m1-q20', 'Logical', 'Foundation', 'If CAT is coded as 24 and DOG is coded as 26, how is TIGER coded using sum of alphabet positions?', '59', '54', '62', '65', 'Step 1: T(20) + I(9) + G(7) + E(5) + R(18) = 59.'),
        make_q('m1-q21', 'Logical', 'Foundation', 'Four friends A, B, C, and D sit in a row facing North. B is to the immediate right of A. C is to the left of A. D is to the immediate right of B. Who is at the extreme left?', 'C', 'A', 'B', 'D', 'Step 1: Sequence from left to right: C -> A -> B -> D.\nStep 2: Extreme left is C.'),
        make_q('m1-q22', 'Logical', 'Foundation', 'If January 1st of a non-leap year is a Friday, what day of the week will January 31st be?', 'Sunday', 'Friday', 'Saturday', 'Monday', 'Step 1: 30 elapsed days mod 7 = 2 odd days.\nStep 2: Friday + 2 days = Sunday.'),
        # Verbal (23-32)
        make_q('m1-q23', 'Verbal', 'Foundation', 'Select the synonym for "DILIGENT":', 'Hardworking', 'Careless', 'Hesitant', 'Arrogant', 'Step 1: "Diligent" means showing steady and earnest effort.\nStep 2: Synonym is "Hardworking".'),
        make_q('m1-q24', 'Verbal', 'Foundation', 'Choose the antonym for "TRANSPARENT":', 'Opaque', 'Clear', 'Lucid', 'Translucent', 'Step 1: "Transparent" means allowing light to pass clearly.\nStep 2: Opposite is "Opaque" (not transparent).'),
        make_q('m1-q25', 'Verbal', 'Foundation', 'Identify the sentence with correct subject-verb agreement regarding collective nouns:', 'The group of students was studying late.', 'The group of students were studying late.', 'The group of students are studying late.', 'The group of students have studied late.', 'Step 1: The singular collective noun "group" agrees with the singular verb "was".'),
        make_q('m1-q26', 'Verbal', 'Foundation', 'Fill in the blank with appropriate preposition: "He has been living in Bengaluru _____ 2018."', 'since', 'for', 'from', 'in', 'Step 1: "Since" is used with specific starting points in the past with perfect continuous tenses.'),
        make_q('m1-q27', 'Verbal', 'Foundation', 'Spelling Drill 1: Identify the correctly spelled word meaning an instance or incident:', 'Occurrence', 'Occurence', 'Ocurrence', 'Occurrance', 'Step 1: Correct spelling is OCCURRENCE (double c, double r, -ence).'),
        make_q('m1-q28', 'Verbal', 'Foundation', 'What is the meaning of the idiom "Break the ice"?', 'To initiate conversation in a social setting and ease tension', 'To crack a frozen surface', 'To end a long friendship', 'To cause an argument', 'Step 1: "Break the ice" means to relieve initial social awkwardness.'),
        make_q('m1-q29', 'Verbal', 'Foundation', 'Spot the error in the sentence: "Each of the participants (A) / were given a certificate (B) / after the seminar (C) / ended. (D)"', 'B', 'A', 'C', 'D', 'Step 1: "Each of" requires singular verb "was given" instead of "were given" in Segment B.'),
        make_q('m1-q30', 'Verbal', 'Foundation', 'Fill in the blank with suitable article: "She is _____ European scientist who won the prestigious award."', 'a', 'an', 'the', 'no article required', 'Step 1: "European" starts with the consonant sound /juː/ so it takes the indefinite article "a".'),
        make_q('m1-q31', 'Verbal', 'Foundation', 'Rearrange the segments into a coherent sentence:\nP: to build efficient algorithms\nQ: software developers must\nR: understand data structures\nS: before optimizing code', 'Q - R - P - S', 'P - Q - R - S', 'S - Q - P - R', 'R - Q - P - S', 'Step 1: Logical order is Q -> R -> P -> S: "Software developers must understand data structures to build efficient algorithms before optimizing code."'),
        make_q('m1-q32', 'Verbal', 'Foundation', 'Complete the word relationship analogy:\nBook : Author :: Symphony : ?', 'Composer', 'Musician', 'Pianist', 'Conductor', 'Step 1: An author creates a book; a composer creates a symphony.'),
        # Non-Verbal (33-36)
        make_q('m1-q33', 'NonVerbal', 'Foundation', 'Identify the next term in the geometric dot pattern: [1 Dot, 3 Dots, 6 Dots, 10 Dots, ?]', '15 Dots', '12 Dots', '18 Dots', '20 Dots', 'Step 1: Triangular numbers T_n = n(n+1)/2. For n=5, 5*6/2 = 15 Dots.'),
        make_q('m1-q34', 'NonVerbal', 'Foundation', 'What is the reflection of the word "CODE" across a horizontal mirror placed directly below the word (Water Image)?', 'CODE vertically inverted', 'EDOC', 'CODB', 'GODE', 'Step 1: A horizontal mirror reflects vertically upside down. C, O, D, E retain their horizontal symmetry.'),
        make_q('m1-q35', 'NonVerbal', 'Foundation', 'A square paper is folded in half diagonally, then in half again. Three small circular holes are punched through all layers. How many holes appear when completely unfolded?', '12 holes', '6 holes', '8 holes', '16 holes', 'Step 1: Two folds produce 4 layers. 3 holes * 4 layers = 12 holes.'),
        make_q('m1-q36', 'NonVerbal', 'Foundation', 'A clock face shows 3:00. If the minute hand is rotated 90 degrees clockwise, what time does it indicate?', '3:15', '3:10', '3:20', '3:30', 'Step 1: 90° clockwise on clock = 90 / 6°/min = 15 minutes => 3:15.'),
        # DI (37-40)
        make_q('m1-q37', 'DI', 'Foundation', 'Table Data: Enrollment across branches: CS = 180, IT = 120, ECE = 150, ME = 90. What percentage of total students are in CS?', '33.33%', '30%', '35%', '37.5%', 'Step 1: Total = 180+120+150+90 = 540.\nStep 2: CS % = (180 / 540) * 100 = 33.33%.'),
        make_q('m1-q38', 'DI', 'Foundation', 'Bar Chart: Production of units over 3 years: 2021 = 40k, 2022 = 60k, 2023 = 75k. What is the average annual production?', '58.33k', '55k', '60k', '62.5k', 'Step 1: Average = (40 + 60 + 75) / 3 = 175 / 3 = 58.33k.'),
        make_q('m1-q39', 'DI', 'Foundation', 'In a budget pie chart, Marketing accounts for a 72° sector. If total budget is $500,000, what is the Marketing allocation?', '$100,000', '$75,000', '$120,000', '$150,000', 'Step 1: 72° / 360° = 20%.\nStep 2: 20% of $500,000 = $100,000.'),
        make_q('m1-q40', 'DI', 'Foundation', 'A line graph shows revenue: Jan = $20k, Feb = $25k, Mar = $30k, Apr = $40k. What is the percentage increase from Jan to Apr?', '100%', '50%', '75%', '125%', 'Step 1: Increase = 40k - 20k = 20k.\nStep 2: % Increase = (20 / 20) * 100 = 100%.')
    ]
    tests.append({
        "id": "mock-test-1", "sectionId": "foundation", "testNumber": 1,
        "title": "Foundation Arithmetic & Core Reasoning", "level": "Foundation",
        "focus": "Numbers, Ratios & Elementary Logic", "difficulty": "Foundation",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t1_qs
    })

    # ---------------------------------------------------------
    # Test 2: Basic Numerical & Verbal Essentials
    # ---------------------------------------------------------
    t2_qs = [
        # Quant (1-12)
        make_q('m2-q1', 'Quant', 'Foundation', 'What is the least common multiple (LCM) of 15, 20, and 30?', '60', '30', '90', '120', 'Step 1: 15 = 3*5, 20 = 2^2*5, 30 = 2*3*5.\nStep 2: LCM = 2^2 * 3 * 5 = 60.'),
        make_q('m2-q2', 'Quant', 'Foundation', 'In an examination, a candidate needs 33% marks to pass. If he secures 125 marks and fails by 40 marks, what are the maximum marks?', '500', '400', '450', '550', 'Step 1: Passing marks = 125 + 40 = 165.\nStep 2: 33% of Max = 165 => Max = (165/33)*100 = 500.'),
        make_q('m2-q3', 'Quant', 'Foundation', 'A tap fills a cistern in 4 hours, and a drain empties it in 6 hours. When both are open, how many hours will it take to fill the cistern?', '12 hours', '8 hours', '10 hours', '14 hours', 'Step 1: Net filling rate = 1/4 - 1/6 = 1/12.\nStep 2: Time = 12 hours.'),
        make_q('m2-q4', 'Quant', 'Foundation', 'A 240-meter long train crosses a platform of length 160 meters in 20 seconds. What is the speed of the train in km/hr?', '72 km/hr', '64 km/hr', '80 km/hr', '90 km/hr', 'Step 1: Total distance = 240 + 160 = 400 m.\nStep 2: Speed = 400 / 20 = 20 m/s = 20 * (18/5) = 72 km/hr.'),
        make_q('m2-q5', 'Quant', 'Foundation', 'A shopkeeper marks an item at Rs. 1,500 and offers a discount of 15%. What is the selling price?', 'Rs. 1,275', 'Rs. 1,225', 'Rs. 1,250', 'Rs. 1,300', 'Step 1: Discount = 0.15 * 1500 = Rs. 225.\nStep 2: SP = 1500 - 225 = Rs. 1,275.'),
        make_q('m2-q6', 'Quant', 'Foundation', 'The average age of 6 members is 24 years. If a new member aged 31 joins, what is the new average age?', '25 years', '24.5 years', '25.5 years', '26 years', 'Step 1: Initial sum = 6 * 24 = 144.\nStep 2: New sum = 144 + 31 = 175.\nStep 3: New average = 175 / 7 = 25 years.'),
        make_q('m2-q7', 'Quant', 'Foundation', 'What principal will earn a simple interest of Rs. 720 in 3 years at an annual interest rate of 8%?', 'Rs. 3,000', 'Rs. 2,500', 'Rs. 3,200', 'Rs. 3,600', 'Step 1: P = (SI * 100) / (R * T) = (720 * 100) / (8 * 3) = Rs. 3,000.'),
        make_q('m2-q8', 'Quant', 'Foundation', 'If a : b = 2 : 3 and b : c = 4 : 5, what is the ratio a : b : c?', '8 : 12 : 15', '6 : 12 : 15', '8 : 10 : 15', '6 : 9 : 15', 'Step 1: Multiply a:b by 4 => 8:12. Multiply b:c by 3 => 12:15.\nStep 2: Combined ratio = 8 : 12 : 15.'),
        make_q('m2-q9', 'Quant', 'Foundation', 'A worker is paid Rs. 4,200 for 7 days of work. How much will he be paid for working 12 days at the same daily rate?', 'Rs. 7,200', 'Rs. 6,800', 'Rs. 7,000', 'Rs. 7,500', 'Step 1: Daily wage = 4200 / 7 = Rs. 600.\nStep 2: 12 days wage = 600 * 12 = Rs. 7,200.'),
        make_q('m2-q10', 'Quant', 'Foundation', 'The sum of ages of Maya and her mother is 48 years. Maya is one-third as old as her mother. How old is Maya?', '12 years', '10 years', '14 years', '16 years', 'Step 1: M + M/3 = 4M/3 = 48 => M = 36.\nStep 2: Maya = 36 / 3 = 12 years.'),
        make_q('m2-q11', 'Quant', 'Foundation', 'The radius of a circle is 14 cm. Find its area in sq cm. (pi = 22/7)', '616 sq cm', '586 sq cm', '644 sq cm', '672 sq cm', 'Step 1: Area = (22/7) * 14 * 14 = 22 * 2 * 14 = 616 sq cm.'),
        make_q('m2-q12', 'Quant', 'Foundation', 'Which of the following numbers is completely divisible by 9?', '52,416', '45,213', '63,124', '74,518', 'Step 1: Sum of digits of 52,416 = 5+2+4+1+6 = 18 (divisible by 9).'),
        # Logical (13-22)
        make_q('m2-q13', 'Logical', 'Foundation', 'In a code, "CHAIR" is written as "DIBJS". How is "TABLE" written with the same +1 shift?', 'UBCMF', 'UBCME', 'UBCLF', 'VBCMF', 'Step 1: T(+1)=U, A(+1)=B, B(+1)=C, L(+1)=M, E(+1)=F => UBCMF.'),
        make_q('m2-q14', 'Logical', 'Foundation', 'Find the missing number in the progressive series: 5, 11, 23, 47, 95, ?', '191', '142', '180', '205', 'Step 1: Pattern is 2*N + 1.\nStep 2: 95 * 2 + 1 = 191.'),
        make_q('m2-q15', 'Logical', 'Foundation', 'A is brother of B. B is sister of C. C is father of D. How is A related to D?', 'Paternal Uncle', 'Father', 'Brother', 'Grandfather', 'Step 1: A and B are siblings of C.\nStep 2: Since C is D\'s father, A is D\'s paternal uncle.'),
        make_q('m2-q16', 'Logical', 'Foundation', 'A girl walks 8m East, turns right and walks 6m. How far is she from her starting point?', '10 m', '12 m', '14 m', '16 m', 'Step 1: Distance = sqrt(8^2 + 6^2) = sqrt(64 + 36) = 10 meters.'),
        make_q('m2-q17', 'Logical', 'Foundation', 'In a class of 40 students, Rohan is ranked 15th from top. What is his rank from bottom?', '26th', '24th', '25th', '27th', 'Step 1: Rank = 40 - 15 + 1 = 26th.'),
        make_q('m2-q18', 'Logical', 'Foundation', 'Find the odd one out among numbers: 27, 64, 125, 144, 216.', '144', '64', '125', '216', 'Step 1: 27, 64, 125, 216 are cubes of 3, 4, 5, 6.\nStep 2: 144 is 12^2 (a square, not a cube).'),
        make_q('m2-q19', 'Logical', 'Foundation', 'Statements:\n1. Some pens are pencils.\n2. All pencils are erasers.\nConclusions:\nI. Some pens are erasers.\nII. All erasers are pencils.', 'Only conclusion I follows', 'Only conclusion II follows', 'Both follow', 'Neither follows', 'Step 1: Intersection between pens and pencils is inside erasers => Some pens are erasers (I follows).'),
        make_q('m2-q20', 'Logical', 'Foundation', 'If "SUN" is coded as 54 (S=19, U=21, N=14), what is the code for "MOON"?', '57', '52', '61', '65', 'Step 1: M(13) + O(15) + O(15) + N(14) = 57.'),
        make_q('m2-q21', 'Logical', 'Foundation', 'Six people P, Q, R, S, T, U sit in a circle facing the center. P is opposite S, Q is to the immediate right of P. R is between S and Q. Who sits to the immediate left of P?', 'T or U', 'R', 'Q', 'S', 'Step 1: P opposite S, Q immediate right of P. The seat to immediate left of P is occupied by either T or U.'),
        make_q('m2-q22', 'Logical', 'Foundation', 'If yesterday was Wednesday, what day will it be 10 days from today?', 'Sunday', 'Saturday', 'Monday', 'Tuesday', 'Step 1: Today = Thursday. 10 mod 7 = 3 odd days. Thursday + 3 = Sunday.'),
        # Verbal (23-32)
        make_q('m2-q23', 'Verbal', 'Foundation', 'Select the synonym for "PRAGMATIC":', 'Practical', 'Idealistic', 'Theoretical', 'Imaginary', 'Step 1: "Pragmatic" means guided by practical considerations.\nStep 2: Synonym is "Practical".'),
        make_q('m2-q24', 'Verbal', 'Foundation', 'Choose the antonym for "ABUNDANT":', 'Scarce', 'Plentiful', 'Copious', 'Ample', 'Step 1: "Abundant" means plentiful.\nStep 2: Opposite is "Scarce".'),
        make_q('m2-q25', 'Verbal', 'Foundation', 'Identify the correct sentence structure for "One of my...":', 'One of my friends is moving to London.', 'One of my friends are moving to London.', 'One of my friend are moving to London.', 'One of my friend is moving to London.', 'Step 1: "One of [plural noun]" agrees with the singular verb "is".'),
        make_q('m2-q26', 'Verbal', 'Foundation', 'Fill in the blank with correct collocation: "The team members congratulated him _____ his promotion."', 'on', 'for', 'with', 'about', 'Step 1: Correct preposition is "congratulate on".'),
        make_q('m2-q27', 'Verbal', 'Foundation', 'Spelling Drill 2: Select the correctly spelled word meaning an immunity or special benefit:', 'Privilege', 'Priviledge', 'Privelege', 'Privelige', 'Step 1: Correct spelling is PRIVILEGE.'),
        make_q('m2-q28', 'Verbal', 'Foundation', 'What does the idiom "A blessing in disguise" mean?', 'An apparent misfortune that eventually produces good results', 'A religious ceremony', 'A harmful curse disguised as a gift', 'An unexpected financial debt', 'Step 1: Means an apparent misfortune that eventually leads to positive outcomes.'),
        make_q('m2-q29', 'Verbal', 'Foundation', 'Spot the error: "He did not knew (A) / the correct password (B) / for the system. (C) / No error (D)"', 'A', 'B', 'C', 'D', 'Step 1: Auxiliary "did" requires base verb: "did not know". Error in A.'),
        make_q('m2-q30', 'Verbal', 'Foundation', 'Fill in the blank with indefinite article: "He is _____ honest employee who always reports discrepancies."', 'an', 'a', 'the', 'no article required', 'Step 1: "Honest" begins with vowel sound /ɒ/, taking "an".'),
        make_q('m2-q31', 'Verbal', 'Foundation', 'Rearrange into a coherent sentence:\nP: without thorough testing\nQ: never deploy code\nR: to production servers\nS: in enterprise systems', 'Q - R - P - S', 'P - Q - R - S', 'S - Q - P - R', 'R - Q - P - S', 'Step 1: "Never deploy code to production servers without thorough testing in enterprise systems." (Q-R-P-S).'),
        make_q('m2-q32', 'Verbal', 'Foundation', 'Complete the professional tools analogy:\nDoctor : Stethoscope :: Astronomer : ?', 'Telescope', 'Microscope', 'Periscope', 'Barometer', 'Step 1: Doctor uses stethoscope; astronomer uses telescope.'),
        # Non-Verbal (33-36)
        make_q('m2-q33', 'NonVerbal', 'Foundation', 'A square rotates 45° clockwise in each step: 0°, 45°, 90°, 135°, ? What is the next angle?', '180°', '150°', '210°', '225°', 'Step 1: 135° + 45° = 180°.'),
        make_q('m2-q34', 'NonVerbal', 'Foundation', 'What is the mirror image of the number "819" reflected on a vertical right-hand mirror?', 'Lateral inversion with 9 reversed on left, 1 middle, 8 on right', '918', 'e18', '816', 'Step 1: Vertical mirror reflects left-right laterally.'),
        make_q('m2-q35', 'NonVerbal', 'Foundation', 'A circular paper is folded in half 3 times consecutively. If two holes are punched through the folded wedge, how many total holes appear upon unfolding?', '16 holes', '8 holes', '12 holes', '24 holes', 'Step 1: 3 folds = 2^3 = 8 layers. 2 * 8 = 16 holes.'),
        make_q('m2-q36', 'NonVerbal', 'Foundation', 'A compass needle pointing North-East is rotated 90° clockwise. In which direction does it point now?', 'South-East', 'North-West', 'South-West', 'East', 'Step 1: NE (45°) + 90° = 135° (South-East).'),
        # DI (37-40)
        make_q('m2-q37', 'DI', 'Foundation', 'Table Data: Marks of student: Math = 85, Physics = 75, Chemistry = 80, English = 70. What is the average mark?', '77.5', '75.5', '78.0', '80.0', 'Step 1: Average = (85+75+80+70)/4 = 310/4 = 77.5.'),
        make_q('m2-q38', 'DI', 'Foundation', 'Bar Chart: Sales of cars in Q1 = 500, Q2 = 700, Q3 = 800, Q4 = 1,000. What is the ratio of Q1 sales to Q4 sales?', '1 : 2', '2 : 3', '3 : 5', '1 : 4', 'Step 1: Ratio = 500 / 1000 = 1 : 2.'),
        make_q('m2-q39', 'DI', 'Foundation', 'In a workforce pie chart, Female engineers represent 108°. If total workforce is 1,200 engineers, how many are female?', '360', '320', '400', '420', 'Step 1: Fraction = 108 / 360 = 30%. Count = 0.30 * 1200 = 360.'),
        make_q('m2-q40', 'DI', 'Foundation', 'Line Graph shows site traffic: Jan = 10k, Feb = 15k, Mar = 25k. What is the percentage increase from Jan to Mar?', '150%', '100%', '125%', '200%', 'Step 1: Increase = 25k - 10k = 15k. % Increase = (15/10)*100 = 150%.')
    ]
    tests.append({
        "id": "mock-test-2", "sectionId": "foundation", "testNumber": 2,
        "title": "Basic Numerical & Verbal Essentials", "level": "Foundation",
        "focus": "Percentages, Grammar & Word Analogies", "difficulty": "Foundation",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t2_qs
    })

    # ---------------------------------------------------------
    # Test 3: Elementary Data & Series Foundations
    # ---------------------------------------------------------
    t3_qs = [
        # Quant (1-12)
        make_q('m3-q1', 'Quant', 'Foundation', 'Find the remainder when 3^21 is divided by 5.', '3', '1', '2', '4', 'Step 1: Powers of 3 mod 5: 3^1=3, 3^2=4, 3^3=2, 3^4=1 (period 4).\nStep 2: 21 mod 4 = 1.\nStep 3: Remainder = 3^1 mod 5 = 3.'),
        make_q('m3-q2', 'Quant', 'Foundation', 'If a salary increases from Rs. 25,000 to Rs. 31,250, what is the percentage increase?', '25%', '20%', '22.5%', '30%', 'Step 1: Increase = 31,250 - 25,000 = Rs. 6,250.\nStep 2: % Increase = (6250 / 25000) * 100 = 25%.'),
        make_q('m3-q3', 'Quant', 'Foundation', 'A and B together finish a job in 8 days. A alone finishes it in 12 days. In how many days can B alone finish it?', '24 days', '16 days', '20 days', '28 days', 'Step 1: B\'s rate = 1/8 - 1/12 = (3 - 2)/24 = 1/24.\nStep 2: B takes 24 days.'),
        make_q('m3-q4', 'Quant', 'Foundation', 'A boat travels 24 km downstream in 2 hours and 16 km upstream in 2 hours. Find the speed of the stream.', '2 km/hr', '1 km/hr', '3 km/hr', '4 km/hr', 'Step 1: Downstream speed D = 24 / 2 = 12 km/hr.\nStep 2: Upstream speed U = 16 / 2 = 8 km/hr.\nStep 3: Stream speed = (D - U) / 2 = (12 - 8) / 2 = 2 km/hr.'),
        make_q('m3-q5', 'Quant', 'Foundation', 'A vendor sells an article for Rs. 540 incurring a loss of 10%. At what price should he sell it to gain 10%?', 'Rs. 660', 'Rs. 600', 'Rs. 640', 'Rs. 700', 'Step 1: CP = 540 / 0.90 = Rs. 600.\nStep 2: Desired SP = 600 * 1.10 = Rs. 660.'),
        make_q('m3-q6', 'Quant', 'Foundation', 'The average of 5 consecutive odd numbers is 27. What is the smallest of these numbers?', '23', '21', '25', '27', 'Step 1: In consecutive odd numbers, the average is the middle (3rd) term: 27.\nStep 2: Smallest (1st term) = 27 - 4 = 23.'),
        make_q('m3-q7', 'Quant', 'Foundation', 'How much time will it take for a sum of money to double itself at 5% simple interest per annum?', '20 years', '15 years', '18 years', '25 years', 'Step 1: SI = Principal P. SI = (P * R * T)/100 => P = (P * 5 * T)/100.\nStep 2: T = 100 / 5 = 20 years.'),
        make_q('m3-q8', 'Quant', 'Foundation', 'Divide Rs. 1,400 among A, B, and C in the ratio 2 : 3 : 5. What is B’s share?', 'Rs. 420', 'Rs. 280', 'Rs. 560', 'Rs. 700', 'Step 1: Sum of parts = 2 + 3 + 5 = 10.\nStep 2: B\'s share = (3/10) * 1400 = Rs. 420.'),
        make_q('m3-q9', 'Quant', 'Foundation', 'Three pipes P, Q, and R can fill a tank in 10, 15, and 30 hours respectively. If all are open, how long will they take?', '5 hours', '4 hours', '6 hours', '7.5 hours', 'Step 1: Net rate = 1/10 + 1/15 + 1/30 = (3 + 2 + 1)/30 = 6/30 = 1/5.\nStep 2: Time taken = 5 hours.'),
        make_q('m3-q10', 'Quant', 'Foundation', 'Ten years ago, the ratio of ages of A and B was 3 : 2. Today their ratio is 4 : 3. What is A’s present age?', '40 years', '30 years', '35 years', '45 years', 'Step 1: (3x + 10)/(2x + 10) = 4/3 => 9x + 30 = 8x + 40 => x = 10.\nStep 2: A\'s present age = 3x + 10 = 3(10) + 10 = 40 years.'),
        make_q('m3-q11', 'Quant', 'Foundation', 'Find the perimeter of a right-angled triangle whose base is 12 cm and height is 5 cm.', '30 cm', '28 cm', '32 cm', '36 cm', 'Step 1: Hypotenuse = sqrt(12^2 + 5^2) = 13 cm.\nStep 2: Perimeter = 12 + 5 + 13 = 30 cm.'),
        make_q('m3-q12', 'Quant', 'Foundation', 'What is the sum of all prime numbers between 10 and 25?', '83', '87', '91', '95', 'Step 1: Primes between 10 and 25 are: 11, 13, 17, 19, 23.\nStep 2: Sum = 11 + 13 + 17 + 19 + 23 = 83.'),
        # Logical (13-22)
        make_q('m3-q13', 'Logical', 'Foundation', 'In a code, "MOUSE" is written as "PRXVH". What is the shift rule used?', '+3 forward', '+1 forward', '+2 forward', '+4 forward', 'Step 1: M(+3)=P, O(+3)=R, U(+3)=X, S(+3)=V, E(+3)=H.\nStep 2: The shift rule is +3 forward.'),
        make_q('m3-q14', 'Logical', 'Foundation', 'Find the next term in the difference-series: 2, 6, 12, 20, 30, ?', '42', '38', '40', '44', 'Step 1: Successive differences: +4, +6, +8, +10.\nStep 2: Next difference = +12 => 30 + 12 = 42.'),
        make_q('m3-q15', 'Logical', 'Foundation', 'Introducing a man, a woman says, "His mother is the only daughter of my mother." How is the woman related to the man?', 'Mother', 'Aunt', 'Sister', 'Grandmother', 'Step 1: "The only daughter of my mother" is the woman herself.\nStep 2: "His mother is the woman" => The woman is his Mother.'),
        make_q('m3-q16', 'Logical', 'Foundation', 'A man walks 15m West, turns left and walks 20m. What is his direct distance from the start?', '25 m', '20 m', '30 m', '35 m', 'Step 1: Distance = sqrt(15^2 + 20^2) = sqrt(225 + 400) = sqrt(625) = 25 meters.'),
        make_q('m3-q17', 'Logical', 'Foundation', 'In a line of people, Ankit is 17th from both ends. How many people are in the line?', '33', '31', '34', '35', 'Step 1: Total = Left + Right - 1 = 17 + 17 - 1 = 33.'),
        make_q('m3-q18', 'Logical', 'Foundation', 'Find the odd one out among material conductors: Copper, Silver, Gold, Plastic, Iron.', 'Plastic', 'Silver', 'Gold', 'Iron', 'Step 1: Copper, Silver, Gold, Iron are metallic conductors.\nStep 2: Plastic is a synthetic polymer insulator.'),
        make_q('m3-q19', 'Logical', 'Foundation', 'Statements:\n1. No cat is a dog.\n2. All dogs are mammals.\nConclusions:\nI. No cat is a mammal.\nII. Some mammals are dogs.', 'Only II follows', 'Only I follows', 'Both follow', 'Neither follows', 'Step 1: Since all dogs are inside mammals, some mammals are definitely dogs (II follows).\nStep 2: Cats can still be mammals (I is false).'),
        make_q('m3-q20', 'Logical', 'Foundation', 'If "LEMON" is coded as "12-5-13-15-14", how is "PEACH" coded in standard numerical positions?', '16-5-1-3-8', '15-5-1-3-8', '16-5-2-3-8', '16-4-1-3-8', 'Step 1: P=16, E=5, A=1, C=3, H=8 => 16-5-1-3-8.'),
        make_q('m3-q21', 'Logical', 'Foundation', 'Six books A, B, C, D, E, F are stacked. B is just below A. C is just above D. E is at the bottom. F is between B and C. Which book is at the top?', 'A', 'B', 'C', 'D', 'Step 1: Top to bottom stack: A -> B -> F -> C -> D -> E.\nStep 2: Book at the top is A.'),
        make_q('m3-q22', 'Logical', 'Foundation', 'How many days are there in a standard leap year?', '366', '364', '365', '367', 'Step 1: A leap year includes February 29th, giving 366 days.'),
        # Verbal (23-32)
        make_q('m3-q23', 'Verbal', 'Foundation', 'Select the synonym for "AUTHENTIC":', 'Genuine', 'Counterfeit', 'Deceptive', 'Synthetic', 'Step 1: "Authentic" means genuine and original.'),
        make_q('m3-q24', 'Verbal', 'Foundation', 'Choose the antonym for "OBSOLETE":', 'Modern', 'Ancient', 'Outdated', 'Archaic', 'Step 1: "Obsolete" means outdated; opposite is "Modern".'),
        make_q('m3-q25', 'Verbal', 'Foundation', 'Identify the error segment: "Neither the manager (A) / nor the employees (B) / was present at (C) / the briefing. (D)"', 'C', 'A', 'B', 'D', 'Step 1: In "Neither... nor", the verb agrees with the closer subject ("employees", plural).\nStep 2: "was present" should be "were present". Error in C.'),
        make_q('m3-q26', 'Verbal', 'Foundation', 'Fill in the blank with comparative preposition: "He is senior _____ me by two years in the engineering team."', 'to', 'than', 'from', 'over', 'Step 1: Latin comparatives (senior, junior, superior, inferior) take preposition "to".'),
        make_q('m3-q27', 'Verbal', 'Foundation', 'Spelling Drill 3: Choose the correctly spelled word meaning routine upkeep and repair:', 'Maintenance', 'Maintainance', 'Maintenence', 'Maintanance', 'Step 1: Correct spelling is MAINTENANCE.'),
        make_q('m3-q28', 'Verbal', 'Foundation', 'What does the idiom "Call it a day" mean?', 'To stop working on something for the rest of the day', 'To start a new project', 'To make a telephone call', 'To plan an event', 'Step 1: "Call it a day" means to cease the day\'s work.'),
        make_q('m3-q29', 'Verbal', 'Foundation', 'Spot the error: "She has been working (A) / in this company (B) / since five years. (C) / No error (D)"', 'C', 'A', 'B', 'D', 'Step 1: "Five years" is a duration/period of time, requiring preposition "for", not "since". Error in C.'),
        make_q('m3-q30', 'Verbal', 'Foundation', 'Fill in the blank with correct article: "The committee reached _____ unanimous decision on the budget proposal."', 'a', 'an', 'the', 'no article required', 'Step 1: "Unanimous" starts with consonant sound /juː/ (yoo-nanimous), taking "a".'),
        make_q('m3-q31', 'Verbal', 'Foundation', 'Rearrange into a coherent sentence:\nP: continuous learning is\nQ: to stay competitive\nR: in the technology industry\nS: an absolute necessity', 'P - S - Q - R', 'P - Q - R - S', 'S - Q - P - R', 'Q - P - S - R', 'Step 1: "Continuous learning is an absolute necessity to stay competitive in the technology industry." (P-S-Q-R).'),
        make_q('m3-q32', 'Verbal', 'Foundation', 'Complete the functional analogy:\nNeedle : Thread :: Pen : ?', 'Ink', 'Paper', 'Cap', 'Nib', 'Step 1: Thread is the consumed writing/functional medium for a needle; ink is for a pen.'),
        # Non-Verbal (33-36)
        make_q('m3-q33', 'NonVerbal', 'Foundation', 'A progression of polygons has vertices: [3 (Triangle), 4 (Square), 5 (Pentagon), ?]. What shape has 6 vertices?', 'Hexagon', 'Heptagon', 'Octagon', 'Decagon', 'Step 1: A polygon with 6 vertices is a Hexagon.'),
        make_q('m3-q34', 'NonVerbal', 'Foundation', 'What is the mirror image of the letter "F" reflected across a vertical right plane mirror?', 'F inverted horizontally (facing left)', 'F upside down', 'E', 'F unchanged', 'Step 1: Vertical mirror reflects left-right, turning the arms of F to point left.'),
        make_q('m3-q35', 'NonVerbal', 'Foundation', 'A paper is folded in half once horizontally, then once vertically. A square notch is cut out of the folded corner. How many square holes appear when unfolded?', '4', '1', '2', '8', 'Step 1: Two folds create 4 layers. Cutting one corner affects all 4 layers = 4 holes (or 1 large central diamond/square).'),
        make_q('m3-q36', 'NonVerbal', 'Foundation', 'At 6:00, what is the angle between the hour hand and the minute hand of an analog clock?', '180°', '90°', '120°', '360°', 'Step 1: Hour hand at 6 (180°), minute hand at 12 (0°). Angular difference = 180°.'),
        # DI (37-40)
        make_q('m3-q37', 'DI', 'Foundation', 'Table Data: Daily defective items: Mon = 12, Tue = 18, Wed = 15, Thu = 20, Fri = 10. What is the total number of defective items in the 5-day week?', '75', '65', '70', '80', 'Step 1: Total = 12 + 18 + 15 + 20 + 10 = 75.'),
        make_q('m3-q38', 'DI', 'Foundation', 'Bar Chart: Revenue of Store A = $60k, Store B = $90k, Store C = $120k. By what percentage is Store C’s revenue greater than Store A’s?', '100%', '50%', '75%', '120%', 'Step 1: Difference = 120k - 60k = 60k.\nStep 2: % greater = (60k / 60k) * 100 = 100%.'),
        make_q('m3-q39', 'DI', 'Foundation', 'In a 360° pie chart of food expenses, Dairy accounts for 90°. What percentage of the food expenditure is spent on Dairy?', '25%', '20%', '30%', '33.33%', 'Step 1: Percentage = (90° / 360°) * 100 = 25%.'),
        make_q('m3-q40', 'DI', 'Foundation', 'A line graph tracking inventory shows: Week 1 = 800 units, Week 2 = 600 units, Week 3 = 450 units. What is the drop from Week 1 to Week 2?', '200 units', '150 units', '250 units', '300 units', 'Step 1: Drop = 800 - 600 = 200 units.')
    ]
    tests.append({
        "id": "mock-test-3", "sectionId": "foundation", "testNumber": 3,
        "title": "Elementary Data & Series Foundations", "level": "Foundation",
        "focus": "Table Analysis, Series & Deductions", "difficulty": "Foundation",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t3_qs
    })

    # ---------------------------------------------------------
    # Test 4: Speed Math & Logic Fundamentals
    # ---------------------------------------------------------
    t4_qs = [
        # Quant (1-12)
        make_q('m4-q1', 'Quant', 'Foundation', 'Evaluate the algebraic simplification: (14 * 14 - 6 * 6) / 20', '8', '6', '10', '12', 'Step 1: a^2 - b^2 = (a-b)(a+b) = (14-6)(14+6) = 8 * 20.\nStep 2: (8 * 20) / 20 = 8.'),
        make_q('m4-q2', 'Quant', 'Foundation', 'If 25% of a number is added to 45, the result is the number itself. Find the number.', '60', '50', '70', '80', 'Step 1: 0.25N + 45 = N => 0.75N = 45 => N = 45 / 0.75 = 60.'),
        make_q('m4-q3', 'Quant', 'Foundation', 'A pump can empty a swimming pool in 15 hours. How much of the pool does it empty in 6 hours?', '2/5', '1/3', '1/2', '3/5', 'Step 1: Fraction = 6 / 15 = 2 / 5.'),
        make_q('m4-q4', 'Quant', 'Foundation', 'A cyclist travels 45 km at 15 km/hr and another 45 km at 9 km/hr. Find his average speed for the entire 90 km journey.', '11.25 km/hr', '11.5 km/hr', '12.0 km/hr', '12.5 km/hr', 'Step 1: Time 1 = 45/15 = 3 hrs. Time 2 = 45/9 = 5 hrs. Total time = 8 hrs.\nStep 2: Average speed = 90 / 8 = 11.25 km/hr.'),
        make_q('m4-q5', 'Quant', 'Foundation', 'An item marked at Rs. 2,000 is sold after two successive discounts of 10% and 10%. What is the final selling price?', 'Rs. 1,620', 'Rs. 1,600', 'Rs. 1,640', 'Rs. 1,680', 'Step 1: After 1st discount: 2000 * 0.90 = Rs. 1800.\nStep 2: After 2nd discount: 1800 * 0.90 = Rs. 1620.'),
        make_q('m4-q6', 'Quant', 'Foundation', 'The average score of 8 students in a quiz is 72. If scores of 68 and 76 are removed, what is the average of the remaining 6 students?', '72', '70', '74', '76', 'Step 1: Total sum = 8 * 72 = 576.\nStep 2: Sum removed = 68 + 76 = 144.\nStep 3: Remaining sum = 576 - 144 = 432. New average = 432 / 6 = 72.'),
        make_q('m4-q7', 'Quant', 'Foundation', 'Find the compound interest on Rs. 5,000 for 2 years at 10% per annum compounded annually.', 'Rs. 1,050', 'Rs. 1,000', 'Rs. 1,100', 'Rs. 1,150', 'Step 1: Amount = 5000 * (1 + 0.10)^2 = 5000 * 1.21 = Rs. 6,050.\nStep 2: CI = 6050 - 5000 = Rs. 1,050.'),
        make_q('m4-q8', 'Quant', 'Foundation', 'If 3A = 4B = 5C, find the ratio A : B : C.', '20 : 15 : 12', '15 : 12 : 20', '12 : 15 : 20', '4 : 3 : 5', 'Step 1: Let 3A = 4B = 5C = 60k (LCM of 3, 4, 5 is 60).\nStep 2: A = 20k, B = 15k, C = 12k => A : B : C = 20 : 15 : 12.'),
        make_q('m4-q9', 'Quant', 'Foundation', 'If 8 men can complete a project in 15 days, in how many days can 12 men complete the same project working at the same rate?', '10 days', '8 days', '12 days', '14 days', 'Step 1: Total Man-days = 8 * 15 = 120.\nStep 2: Time for 12 men = 120 / 12 = 10 days.'),
        make_q('m4-q10', 'Quant', 'Foundation', 'A father is currently four times as old as his son. In 20 years, he will be twice as old as his son. Find the son’s present age.', '10 years', '8 years', '12 years', '15 years', 'Step 1: F = 4S. In 20 yrs: (4S + 20) = 2(S + 20) => 4S + 20 = 2S + 40.\nStep 2: 2S = 20 => S = 10 years.'),
        make_q('m4-q11', 'Quant', 'Foundation', 'The length of a rectangle is thrice its breadth. If the area is 108 sq cm, find the perimeter.', '48 cm', '36 cm', '54 cm', '64 cm', 'Step 1: Length = 3b. Area = 3b * b = 3b^2 = 108 => b^2 = 36 => b = 6 cm, Length = 18 cm.\nStep 2: Perimeter = 2 * (18 + 6) = 2 * 24 = 48 cm.'),
        make_q('m4-q12', 'Quant', 'Foundation', 'What is the smallest three-digit prime number?', '101', '103', '107', '109', 'Step 1: 100 is composite. 101 has no divisors other than 1 and 101.\nTherefore, 101 is the smallest 3-digit prime.'),
        # Logical (13-22)
        make_q('m4-q13', 'Logical', 'Foundation', 'In a code, "RING" is coded as "ULOG" where each letter shifts by +3. How is "BELL" coded with +3 shift?', 'EHOO', 'EHPP', 'EGNN', 'FIPP', 'Step 1: B(+3)=E, E(+3)=H, L(+3)=O, L(+3)=O => EHOO.'),
        make_q('m4-q14', 'Logical', 'Foundation', 'Find the missing number in the cube progression: 1, 8, 27, 64, 125, ?', '216', '196', '256', '343', 'Step 1: Series of cubes: 1^3, 2^3, 3^3, 4^3, 5^3.\nStep 2: 6^3 = 216.'),
        make_q('m4-q15', 'Logical', 'Foundation', 'Pointing to a woman in a picture, Varun said, "Her daughter is the only granddaughter of my mother." How is the woman in the picture related to Varun?', 'Sister or Wife', 'Mother', 'Aunt', 'Niece', 'Step 1: Granddaughter of Varun\'s mother is either Varun\'s daughter or Varun\'s sister\'s daughter.\nStep 2: Thus the woman is either Varun\'s wife or Varun\'s sister.'),
        make_q('m4-q16', 'Logical', 'Foundation', 'A person walks 10m North, turns left and walks 10m, then turns left again and walks 10m. Where is he relative to his starting point?', '10m West', '10m North', '10m South', '10m East', 'Step 1: North 10m and South 10m cancel out.\nStep 2: Net displacement is 10m West.'),
        make_q('m4-q17', 'Logical', 'Foundation', 'In a row of trees, a banyan tree is 11th from the left and 20th from the right. How many trees are there in the row?', '30', '29', '31', '32', 'Step 1: Total = 11 + 20 - 1 = 30 trees.'),
        make_q('m4-q18', 'Logical', 'Foundation', 'Find the odd one out among squares: 121, 169, 196, 225, 256.', '196', '121', '169', '225', 'Step 1: 121=11^2 (odd), 169=13^2 (odd), 225=15^2 (odd).\nStep 2: 196 = 14^2 (even).'),
        make_q('m4-q19', 'Logical', 'Foundation', 'Statements:\n1. All cars are vehicles.\n2. No vehicle is an airplane.\nConclusions:\nI. No car is an airplane.\nII. Some vehicles are cars.', 'Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows', 'Step 1: Since all cars are vehicles and vehicles cannot be airplanes, no car is an airplane (I follows).\nStep 2: Since vehicles contain cars, some vehicles are cars (II follows). Both follow.'),
        make_q('m4-q20', 'Logical', 'Foundation', 'If "JAVA" is coded as "10-1-22-1", what is the code for "PYTHON"?', '16-25-20-8-15-14', '15-25-20-8-15-14', '16-24-20-8-15-14', '16-25-19-8-15-14', 'Step 1: P=16, Y=25, T=20, H=8, O=15, N=14.'),
        make_q('m4-q21', 'Logical', 'Foundation', 'Five students P, Q, R, S, T sit in a row. R is in the center. P is to the right of R. Q is to the left of R. S is to the immediate left of Q. Who is at the extreme left?', 'S', 'Q', 'R', 'T', 'Step 1: Order from left: S -> Q -> R -> (P/T).\nStep 2: Extreme left is S.'),
        make_q('m4-q22', 'Logical', 'Foundation', 'If 15th August of a year is a Wednesday, what day of the week is 15th September of the same year?', 'Saturday', 'Friday', 'Sunday', 'Monday', 'Step 1: August has 31 days. 31 mod 7 = 3 odd days.\nStep 2: Wednesday + 3 days = Saturday.'),
        # Verbal (23-32)
        make_q('m4-q23', 'Verbal', 'Foundation', 'Select the synonym for "BENEVOLENT":', 'Kind', 'Cruel', 'Selfish', 'Greedy', 'Step 1: "Benevolent" means well meaning and kindly.'),
        make_q('m4-q24', 'Verbal', 'Foundation', 'Choose the antonym for "COURTEOUS":', 'Rude', 'Polite', 'Gracious', 'Gentle', 'Step 1: "Courteous" means polite; opposite is "Rude".'),
        make_q('m4-q25', 'Verbal', 'Foundation', 'Identify the sentence with correct punctuation in dialogue:', '"Let\'s begin the review," said the manager.', '"Lets begin the review", said the manager.', '"Let\'s begin the review" said the manager.', '"Lets begin the review," said the manager', 'Step 1: Apostrophe in "Let\'s", comma inside quotes, period at the end.'),
        make_q('m4-q26', 'Verbal', 'Foundation', 'Fill in the blank with correct preposition: "She is capable _____ handling multiple complex tasks simultaneously."', 'of', 'for', 'in', 'to', 'Step 1: Adjective "capable" is followed by preposition "of".'),
        make_q('m4-q27', 'Verbal', 'Foundation', 'Spelling Drill 4: Choose the correctly spelled word meaning to set apart or disunite:', 'Separate', 'Seperate', 'Sepparate', 'Separite', 'Step 1: Correct spelling is SEPARATE (with \'para\').'),
        make_q('m4-q28', 'Verbal', 'Foundation', 'What is the meaning of the idiom "Piece of cake"?', 'Something that is very easy to do', 'A bakery dessert', 'A complex mathematical puzzle', 'An unfair distribution', 'Step 1: "A piece of cake" refers to a very simple task.'),
        make_q('m4-q29', 'Verbal', 'Foundation', 'Spot the subject-verb error: "He is one of those engineers (A) / who works (B) / relentlessly for the team. (C) / No error (D)"', 'B', 'A', 'C', 'D', 'Step 1: In "one of those [plural noun] who [verb]", relative pronoun "who" refers to plural "engineers", requiring plural verb "work". Error in B.'),
        make_q('m4-q30', 'Verbal', 'Foundation', 'Fill in the blank with appropriate article: "He bought _____ umbrella from the departmental store."', 'an', 'a', 'the', 'no article', 'Step 1: "Umbrella" begins with vowel sound /ʌ/, taking "an".'),
        make_q('m4-q31', 'Verbal', 'Foundation', 'Rearrange into a coherent sentence:\nP: clean architecture ensures\nQ: high maintainability\nR: of complex software systems\nS: across long product lifecycles', 'P - Q - R - S', 'Q - P - R - S', 'S - P - Q - R', 'R - P - Q - S', 'Step 1: "Clean architecture ensures high maintainability of complex software systems across long product lifecycles." (P-Q-R-S).'),
        make_q('m4-q32', 'Verbal', 'Foundation', 'Complete the habitat analogy:\nBird : Nest :: Bee : ?', 'Hive', 'Burrow', 'Den', 'Web', 'Step 1: A bird builds a nest; a bee builds/lives in a hive.'),
        # Non-Verbal (33-36)
        make_q('m4-q33', 'NonVerbal', 'Foundation', 'A figure sequence alternates between shaded and unshaded shapes: [Shaded Circle, Unshaded Circle, Shaded Square, Unshaded Square, Shaded Triangle, ?]. What is next?', 'Unshaded Triangle', 'Shaded Triangle', 'Shaded Circle', 'Unshaded Square', 'Step 1: The sequence alternates shading. Following Shaded Triangle is Unshaded Triangle.'),
        make_q('m4-q34', 'NonVerbal', 'Foundation', 'What is the water image of the letter "M"?', 'W', 'M', 'E', '3', 'Step 1: Water reflection flips vertically upside-down, turning M into W.'),
        make_q('m4-q35', 'NonVerbal', 'Foundation', 'A square sheet of paper is folded in half from left to right, then from top to bottom. One circular hole is punched in the exact center. How many holes are there when unfolded?', '4 holes', '1 hole', '2 holes', '8 holes', 'Step 1: 2 folds = 4 layers. Punching 1 hole yields 4 holes.'),
        make_q('m4-q36', 'NonVerbal', 'Foundation', 'How many total degrees does the minute hand of a clock travel in 45 minutes?', '270°', '180°', '225°', '315°', 'Step 1: 45 minutes * 6° per minute = 270°.'),
        # DI (37-40)
        make_q('m4-q37', 'DI', 'Foundation', 'Table Data: Scores of 4 teams: Team A = 40, Team B = 60, Team C = 50, Team D = 70. What is the average score per team?', '55', '50', '60', '65', 'Step 1: Sum = 40 + 60 + 50 + 70 = 220. Average = 220 / 4 = 55.'),
        make_q('m4-q38', 'DI', 'Foundation', 'Bar Chart: Website visitors: Q1 = 1,000, Q2 = 1,500. What is the percentage increase from Q1 to Q2?', '50%', '33.33%', '40%', '60%', 'Step 1: Increase = 1500 - 1000 = 500. % Increase = (500 / 1000) * 100 = 50%.'),
        make_q('m4-q39', 'DI', 'Foundation', 'In a salary budget pie chart, Engineering receives 180°. What fraction of the total budget is this?', '1/2', '1/4', '1/3', '2/3', 'Step 1: 180° / 360° = 1/2 (50%).'),
        make_q('m4-q40', 'DI', 'Foundation', 'A line graph tracking monthly mobile app downloads shows: Month 1 = 5,000, Month 2 = 8,000, Month 3 = 12,000. What is the net increase from Month 1 to Month 3?', '7,000', '5,000', '8,000', '10,000', 'Step 1: Net increase = 12,000 - 5,000 = 7,000 downloads.')
    ]
    tests.append({
        "id": "mock-test-4", "sectionId": "foundation", "testNumber": 4,
        "title": "Speed Math & Logic Fundamentals", "level": "Foundation",
        "focus": "Simplification, Clocks & Basic Puzzles", "difficulty": "Foundation",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t4_qs
    })

    # ---------------------------------------------------------
    # Test 5: Fundamental Quantitative Readiness
    # ---------------------------------------------------------
    t5_qs = [
        # Quant (1-12)
        make_q('m5-q1', 'Quant', 'Foundation', 'Find the HCF of 36, 60, and 84.', '12', '6', '18', '24', 'Step 1: 36 = 2^2 * 3^2, 60 = 2^2 * 3 * 5, 84 = 2^2 * 3 * 7.\nStep 2: HCF = 2^2 * 3 = 12.'),
        make_q('m5-q2', 'Quant', 'Foundation', 'If 60% of students in a school of 1,500 students are boys, how many girls are there in the school?', '600', '500', '700', '800', 'Step 1: Percentage of girls = 100% - 60% = 40%.\nStep 2: Number of girls = 0.40 * 1500 = 600.'),
        make_q('m5-q3', 'Quant', 'Foundation', 'A worker finishes 3/8 of a project in 9 days. In how many more days will he finish the remaining work at the same pace?', '15 days', '12 days', '18 days', '24 days', 'Step 1: Rate = (3/8) / 9 = 1/24 per day.\nStep 2: Remaining work = 5/8.\nStep 3: Days = (5/8) / (1/24) = 5 * 3 = 15 days.'),
        make_q('m5-q4', 'Quant', 'Foundation', 'A train 300 meters long is traveling at 90 km/hr. How many seconds will it take to pass a stationary signal post?', '12 s', '10 s', '15 s', '18 s', 'Step 1: Speed in m/s = 90 * (5/18) = 25 m/s.\nStep 2: Time = Distance / Speed = 300 / 25 = 12 seconds.'),
        make_q('m5-q5', 'Quant', 'Foundation', 'By selling a watch for Rs. 1,140, a dealer loses 5%. What was the cost price of the watch?', 'Rs. 1,200', 'Rs. 1,180', 'Rs. 1,220', 'Rs. 1,250', 'Step 1: SP = 0.95 * CP => CP = 1140 / 0.95 = Rs. 1,200.'),
        make_q('m5-q6', 'Quant', 'Foundation', 'The average of 5 numbers is 18. If one number is excluded, their average becomes 16. What is the excluded number?', '26', '22', '24', '28', 'Step 1: Sum of 5 numbers = 5 * 18 = 90.\nStep 2: Sum of 4 numbers = 4 * 16 = 64.\nStep 3: Excluded number = 90 - 64 = 26.'),
        make_q('m5-q7', 'Quant', 'Foundation', 'Find the simple interest on Rs. 4,500 at 8% per annum for 4 years.', 'Rs. 1,440', 'Rs. 1,200', 'Rs. 1,350', 'Rs. 1,500', 'Step 1: SI = (4500 * 8 * 4) / 100 = 45 * 32 = Rs. 1,440.'),
        make_q('m5-q8', 'Quant', 'Foundation', 'Two numbers are in the ratio 3 : 5. If 6 is added to each number, the ratio becomes 2 : 3. Find the smaller number.', '18', '12', '24', '30', 'Step 1: (3x + 6) / (5x + 6) = 2 / 3 => 3(3x + 6) = 2(5x + 6).\nStep 2: 9x + 18 = 10x + 12 => x = 6.\nStep 3: Smaller number = 3x = 3 * 6 = 18.'),
        make_q('m5-q9', 'Quant', 'Foundation', 'Pipe A can fill a tank in 12 hours and Pipe B can empty it in 18 hours. If both are open together, how long will it take to fill the tank?', '36 hours', '24 hours', '30 hours', '42 hours', 'Step 1: Net filling rate = 1/12 - 1/18 = (3 - 2)/36 = 1/36.\nStep 2: Time = 36 hours.'),
        make_q('m5-q10', 'Quant', 'Foundation', 'The present age ratio of A and B is 5 : 3. If the sum of their present ages is 40 years, what was the ratio of their ages 5 years ago?', '2 : 1', '3 : 2', '4 : 3', '5 : 3', 'Step 1: 5x + 3x = 8x = 40 => x = 5. A = 25, B = 15.\nStep 2: 5 years ago: A = 20, B = 10.\nStep 3: Ratio = 20 : 10 = 2 : 1.'),
        make_q('m5-q11', 'Quant', 'Foundation', 'Find the area of an equilateral triangle with side length 8 cm. (Formula: (sqrt(3)/4) * a^2)', '16*sqrt(3) sq cm', '12*sqrt(3) sq cm', '20*sqrt(3) sq cm', '24*sqrt(3) sq cm', 'Step 1: Area = (sqrt(3)/4) * 8^2 = (sqrt(3)/4) * 64 = 16*sqrt(3) sq cm.'),
        make_q('m5-q12', 'Quant', 'Foundation', 'What is the unit digit of 4^62 + 4^63?', '0', '2', '4', '6', 'Step 1: 4^even has unit digit 6 (4^62 ends in 6).\nStep 2: 4^odd has unit digit 4 (4^63 ends in 4).\nStep 3: 6 + 4 = 10 (unit digit is 0).'),
        # Logical (13-22)
        make_q('m5-q13', 'Logical', 'Foundation', 'If "GLOBAL" is coded as "HMPCBN", how is "SERVER" coded using +1 shift?', 'TFSWFS', 'TFSSFS', 'TFSUFS', 'TFTWFS', 'Step 1: S(+1)=T, E(+1)=F, R(+1)=S, V(+1)=W, E(+1)=F, R(+1)=S => TFSWFS.'),
        make_q('m5-q14', 'Logical', 'Foundation', 'Find the next number in the sequence: 10, 19, 37, 73, ?', '145', '135', '140', '150', 'Step 1: Pattern is 2*N - 1:\n10*2-1=19, 19*2-1=37, 37*2-1=73.\nStep 2: 73 * 2 - 1 = 146 - 1 = 145.'),
        make_q('m5-q15', 'Logical', 'Foundation', 'Looking at a portrait, a man said, "Brothers and sisters have I none, but that man\'s father is my father\'s son." Whose portrait was it?', 'His son', 'His father', 'His nephew', 'Himself', 'Step 1: "My father\'s son" (with no siblings) = the speaker himself.\nStep 2: "That man\'s father is the speaker" => The portrait is of his Son.'),
        make_q('m5-q16', 'Logical', 'Foundation', 'A girl walks 25m East, turns right and walks 10m, turns right again and walks 25m. How far is she from her starting point?', '10 m', '15 m', '20 m', '25 m', 'Step 1: East 25m and West 25m cancel.\nStep 2: Remaining displacement is 10m South.'),
        make_q('m5-q17', 'Logical', 'Foundation', 'In a test, Divya scored higher than Priya but lower than Tanya. Neha scored higher than Tanya. Who scored the highest?', 'Neha', 'Divya', 'Priya', 'Tanya', 'Step 1: Order of scores: Neha > Tanya > Divya > Priya.\nStep 2: Highest score is Neha.'),
        make_q('m5-q18', 'Logical', 'Foundation', 'Find the odd one out among hardware peripherals: Keyboard, Mouse, Scanner, Printer.', 'Printer', 'Keyboard', 'Mouse', 'Scanner', 'Step 1: Keyboard, Mouse, Scanner are input devices.\nStep 2: Printer is an output device.'),
        make_q('m5-q19', 'Logical', 'Foundation', 'Statements:\n1. All birds lay eggs.\n2. Hens are birds.\nConclusions:\nI. Hens lay eggs.\nII. All egg-laying creatures are birds.', 'Only I follows', 'Only II follows', 'Both follow', 'Neither follows', 'Step 1: Hens are birds, so they lay eggs (I follows).\nStep 2: Reptiles/fish also lay eggs (II does not follow).'),
        make_q('m5-q20', 'Logical', 'Foundation', 'If "ACE" is coded as "1-3-5" and "BDF" is "2-4-6", how is "ZEN" coded in alphabetical numbers?', '26-5-14', '25-5-14', '26-4-14', '26-5-13', 'Step 1: Z=26, E=5, N=14.'),
        make_q('m5-q21', 'Logical', 'Foundation', 'Six people A, B, C, D, E, F sit in a circle facing the center. A is opposite D. B is adjacent to A and C. Who sits opposite B?', 'E', 'C', 'D', 'F', 'Step 1: A opposite D. B adjacent to A and C. In a 6-person circle, the person opposite B is E.'),
        make_q('m5-q22', 'Logical', 'Foundation', 'If February 1st in a non-leap year is a Monday, what day of the week is February 28th of the same year?', 'Sunday', 'Friday', 'Saturday', 'Monday', 'Step 1: Elapsed days = 27 days.\nStep 2: 27 mod 7 = 6 odd days.\nStep 3: Monday + 6 days = Sunday.'),
        # Verbal (23-32)
        make_q('m5-q23', 'Verbal', 'Foundation', 'Select the synonym for "INNOVATIVE":', 'Novel', 'Traditional', 'Obsolete', 'Rigid', 'Step 1: "Innovative" means original and new; "Novel" is the synonym.'),
        make_q('m5-q24', 'Verbal', 'Foundation', 'Choose the antonym for "FRAIL":', 'Robust', 'Weak', 'Delicate', 'Feeble', 'Step 1: "Frail" means weak; opposite is "Robust" (strong).'),
        make_q('m5-q25', 'Verbal', 'Foundation', 'Identify the grammatically correct sentence with singular subject agreement:', 'The team of scientists is conducting the experiment.', 'The team of scientists are conducting the experiment.', 'The team of scientist are conducting the experiment.', 'The team of scientist is conduct the experiment.', 'Step 1: Singular collective noun "team" agrees with singular verb "is conducting".'),
        make_q('m5-q26', 'Verbal', 'Foundation', 'Fill in the blank with appropriate preposition of cause: "The candidate was disqualified _____ submitting falsified credentials."', 'for', 'from', 'with', 'by', 'Step 1: "Disqualified for [doing something]" indicates the reason/cause.'),
        make_q('m5-q27', 'Verbal', 'Foundation', 'Spelling Drill 5: Choose the correctly spelled word for a business venture founder:', 'Entrepreneur', 'Entreprenur', 'Entrepranuer', 'Entreprenure', 'Step 1: Correct spelling is ENTREPRENEUR.'),
        make_q('m5-q28', 'Verbal', 'Foundation', 'What does the idiom "See eye to eye" mean?', 'To agree fully with someone', 'To examine someone visually', 'To have an argument', 'To wear glasses', 'Step 1: "See eye to eye" means to agree completely.'),
        make_q('m5-q29', 'Verbal', 'Foundation', 'Spot the double-comparative error: "He is more smarter (A) / than his brother (B) / in mathematics. (C) / No error (D)"', 'A', 'B', 'C', 'D', 'Step 1: Double comparative "more smarter" is incorrect; use "smarter". Error in A.'),
        make_q('m5-q30', 'Verbal', 'Foundation', 'Fill in the blank with aspirated article: "They decided to stay at _____ hotel near the conference center."', 'a', 'an', 'the', 'no article', 'Step 1: "Hotel" starts with aspirated consonant sound /h/, taking "a".'),
        make_q('m5-q31', 'Verbal', 'Foundation', 'Rearrange into a coherent sentence:\nP: robust error handling\nQ: ensures high availability\nR: in distributed systems\nS: during network outages', 'P - Q - R - S', 'Q - P - R - S', 'R - P - Q - S', 'S - P - Q - R', 'Step 1: "Robust error handling ensures high availability in distributed systems during network outages." (P-Q-R-S).'),
        make_q('m5-q32', 'Verbal', 'Foundation', 'Complete the vehicle stopping analogy:\nShip : Anchor :: Car : ?', 'Brake', 'Wheel', 'Steering', 'Engine', 'Step 1: An anchor holds a ship stationary; a brake stops and holds a car.'),
        # Non-Verbal (33-36)
        make_q('m5-q33', 'NonVerbal', 'Foundation', 'Look at the sequence: [1 Line, 2 Crossed Lines (+), 3 Lines forming a Triangle, 4 Lines forming a Square, ?]. What figure has 5 lines?', 'Pentagon', 'Hexagon', 'Octagon', 'Heptagon', 'Step 1: 5 lines form a Pentagon.'),
        make_q('m5-q34', 'NonVerbal', 'Foundation', 'What is the mirror image of the word "BOX" reflected across a vertical mirror placed to the right?', 'XOB with laterally reversed letters', 'XOB unchanged', 'BOX', 'XO8', 'Step 1: Reverses right-to-left sequence: X on left (symmetric), O middle (symmetric), B laterally inverted on right.'),
        make_q('m5-q35', 'NonVerbal', 'Foundation', 'A circular paper folded into a quadrant (folded twice) has two parallel slit cuts made on its curved edge. How many slit cuts appear when fully opened?', '8 slits', '2 slits', '4 slits', '16 slits', 'Step 1: Quadrant has 4 layers. 2 cuts * 4 layers = 8 slits.'),
        make_q('m5-q36', 'NonVerbal', 'Foundation', 'How many 90-degree right angles are there in a full 360-degree rotation?', '4', '2', '3', '6', 'Step 1: 360° / 90° = 4 right angles.'),
        # DI (37-40)
        make_q('m5-q37', 'DI', 'Foundation', 'Table Data: Software licenses bought: Year 1 = 300, Year 2 = 450, Year 3 = 600. What is the total number of licenses bought over the 3 years?', '1,350', '1,200', '1,400', '1,500', 'Step 1: Total = 300 + 450 + 600 = 1,350.'),
        make_q('m5-q38', 'DI', 'Foundation', 'Bar Chart: Revenue generated: Product X = $80k, Product Y = $120k. What percentage of total revenue ($200k) comes from Product Y?', '60%', '50%', '55%', '65%', 'Step 1: % = (120k / 200k) * 100 = 60%.'),
        make_q('m5-q39', 'DI', 'Foundation', 'In an energy distribution pie chart, Solar accounts for 54°. What percentage of total energy is Solar?', '15%', '12%', '18%', '20%', 'Step 1: % = (54° / 360°) * 100 = 15%.'),
        make_q('m5-q40', 'DI', 'Foundation', 'A line graph tracking active users shows: Q1 = 100k, Q2 = 140k. What is the percentage increase?', '40%', '30%', '35%', '45%', 'Step 1: Increase = 140k - 100k = 40k. % Increase = (40 / 100) * 100 = 40%.')
    ]
    tests.append({
        "id": "mock-test-5", "sectionId": "foundation", "testNumber": 5,
        "title": "Fundamental Quantitative Readiness", "level": "Foundation",
        "focus": "Time-Work, Averages & Verbal Cloze", "difficulty": "Foundation",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t5_qs
    })

    return tests
