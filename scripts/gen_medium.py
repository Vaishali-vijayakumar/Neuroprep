# -*- coding: utf-8 -*-
"""
Generate Tier 2 (Intermediate / Medium): Tests 6 to 10 (200 unique questions)
"""

def get_medium_tests(make_q):
    tests = []

    # ---------------------------------------------------------
    # Test 6: Intermediate Quantitative Proficiency
    # ---------------------------------------------------------
    t6_qs = [
        # Quant (1-12)
        make_q('m6-q1', 'Quant', 'Intermediate', 'A trader marks goods 25% above CP and allows a 10% discount on MP. What is the net profit %?', '12.5%', '10.5%', '14.0%', '15.0%', 'Step 1: CP = 100 => MP = 125.\nStep 2: SP = 125 * 0.90 = 112.50.\nStep 3: Profit % = 12.5%.'),
        make_q('m6-q2', 'Quant', 'Intermediate', 'A sum of money doubles itself in 4 years at compound interest. In how many years will it become 8 times at the same rate?', '12 years', '8 years', '10 years', '16 years', 'Step 1: 8 = 2^3.\nStep 2: Time = 3 * 4 = 12 years.'),
        make_q('m6-q3', 'Quant', 'Intermediate', 'A is 50% more efficient than B. If B alone completes a job in 30 days, in how many days can both complete it together?', '12 days', '10 days', '15 days', '18 days', 'Step 1: B rate = 1 unit/day (Total work = 30 units). A rate = 1.5 units/day.\nStep 2: Combined rate = 2.5 units/day. Days = 30 / 2.5 = 12 days.'),
        make_q('m6-q4', 'Quant', 'Intermediate', 'Two trains of lengths 140m and 160m travel towards each other at 60 km/hr and 48 km/hr. In how many seconds will they cross each other completely?', '10 seconds', '8 seconds', '12 seconds', '15 seconds', 'Step 1: Total distance = 140 + 160 = 300m.\nStep 2: Relative speed = 60 + 48 = 108 km/hr = 30 m/s.\nStep 3: Time = 300 / 30 = 10 seconds.'),
        make_q('m6-q5', 'Quant', 'Intermediate', 'In a 60-liter mixture of milk and water, the ratio is 2 : 1. How much water must be added to make the ratio 1 : 2?', '60 liters', '40 liters', '50 liters', '80 liters', 'Step 1: Milk = 40L, Water = 20L.\nStep 2: 40 / (20 + W) = 1/2 => 20 + W = 80 => W = 60 liters.'),
        make_q('m6-q6', 'Quant', 'Intermediate', 'In how many ways can the letters of "ORANGE" be arranged such that the vowels always remain together?', '144', '72', '120', '240', 'Step 1: Vowels = O, A, E (3 vowels). Consonants = R, N, G (3 consonants).\nStep 2: 4 units arranged in 4! = 24 ways. 3 vowels internally arranged in 3! = 6 ways.\nStep 3: Total = 24 * 6 = 144.'),
        make_q('m6-q7', 'Quant', 'Intermediate', 'When two fair dice are rolled, what is the probability that the sum of outcomes is at least 10?', '1/6', '1/12', '1/9', '5/36', 'Step 1: Total outcomes = 36. Outcomes >= 10: (4,6), (5,5), (6,4), (5,6), (6,5), (6,6) = 6 outcomes.\nStep 2: Probability = 6/36 = 1/6.'),
        make_q('m6-q8', 'Quant', 'Intermediate', 'A boat travels upstream at 14 km/hr and downstream at 22 km/hr. Find the speed of the boat in still water.', '18 km/hr', '16 km/hr', '17 km/hr', '19 km/hr', 'Step 1: Speed in still water = (22 + 14) / 2 = 18 km/hr.'),
        make_q('m6-q9', 'Quant', 'Intermediate', 'P invests Rs. 4,000 for 12 months, Q invests Rs. 6,000 for 8 months, and R invests Rs. 8,000 for 6 months. What is P’s share in a total profit of Rs. 36,000?', 'Rs. 12,000', 'Rs. 10,000', 'Rs. 14,000', 'Rs. 16,000', 'Step 1: Investment products: P = 48k, Q = 48k, R = 48k (Ratio 1 : 1 : 1).\nStep 2: P\'s share = 36,000 / 3 = Rs. 12,000.'),
        make_q('m6-q10', 'Quant', 'Intermediate', 'Find the exact angle between the hour and minute hands of a clock at 4:20 PM.', '10°', '0°', '15°', '20°', 'Step 1: Angle = |30(4) - 5.5(20)| = |120 - 110| = 10°.'),
        make_q('m6-q11', 'Quant', 'Intermediate', 'The difference between SI and CI on a sum for 2 years at 10% per annum is Rs. 65. Find the principal.', 'Rs. 6,500', 'Rs. 5,500', 'Rs. 6,000', 'Rs. 7,000', 'Step 1: CI - SI = P * (R/100)^2 => 65 = P * (1/100) => P = Rs. 6,500.'),
        make_q('m6-q12', 'Quant', 'Intermediate', 'A solid sphere of radius 6 cm is melted into smaller spheres of radius 2 cm each. How many small spheres are formed?', '27', '9', '18', '36', 'Step 1: Ratio of volumes = (6/2)^3 = 3^3 = 27.'),
        # Logical (13-22)
        make_q('m6-q13', 'Logical', 'Intermediate', 'In a code, "DISRUPT" is written as "EKTVSRW". What is the coding rule?', 'Alternating +1 and +2 shifts', '+1 on each position', '+2 on each position', 'Reverse order +1', 'Step 1: D(+1)=E, I(+2)=K, S(+1)=T, R(+2)=T... Alternating +1, +2 pattern.'),
        make_q('m6-q14', 'Logical', 'Intermediate', 'Find the missing number in factorial-like series: 7, 14, 42, 168, 840, ?', '5,040', '3,360', '4,200', '6,720', 'Step 1: Multiplier series: 7*2=14, 14*3=42, 42*4=168, 168*5=840. Next is 840 * 6 = 5,040.'),
        make_q('m6-q15', 'Logical', 'Intermediate', 'If P + Q means P is father of Q, and P * Q means P is brother of Q, what does coded relation "A * B + C" mean?', 'A is the paternal uncle of C', 'A is the father of C', 'A is the brother of C', 'A is the grandfather of C', 'Step 1: A is brother of B, and B is father of C. Thus, A is the paternal uncle of C.'),
        make_q('m6-q16', 'Logical', 'Intermediate', 'One evening before sunset, Hema’s shadow was to her right while talking to Rekha face to face. Which direction was Rekha facing?', 'South', 'North', 'East', 'West', 'Step 1: Evening sun is in West, shadow falls East. Right of Hema is East => Hema faces North. Rekha faces South.'),
        make_q('m6-q17', 'Logical', 'Intermediate', 'Eight persons sit around a circular table facing center. A is 3rd to right of B. C is 2nd to left of A. If D sits opposite A, how many persons sit between B and D when counting clockwise from B?', '1 person', '2 persons', '3 persons', '4 persons', 'Step 1: Relative positions: B=0, A=3, Opposite of A (D) = (3+4) mod 8 = 7.'),
        make_q('m6-q18', 'Logical', 'Intermediate', 'Syllogism Drill: Statements: 1. All gadgets are machines. 2. Some machines are tools. Conclusions: I. Some gadgets are tools. II. Some tools are machines.', 'Only II follows', 'Only I follows', 'Both follow', 'Neither follows', 'Step 1: Machines overlap with tools => Some tools are machines (II follows). I is not necessarily true.'),
        make_q('m6-q19', 'Logical', 'Intermediate', 'Public Notice Assumption: "Clean the drainage channels before monsoon." Assumptions: I. Floods occur if blocked. II. Municipal body has resources.', 'Both I and II are implicit', 'Only I is implicit', 'Only II is implicit', 'Neither is implicit', 'Step 1: Preventative action assumes risk exists (I) and agency has means to execute (II).'),
        make_q('m6-q20', 'Logical', 'Intermediate', 'In a code: "sky is blue" = "ri ti pi", "sky looks high" = "ri da no". What is the specific code for "sky"?', 'ri', 'ti', 'pi', 'da', 'Step 1: Common word in both sentences is "sky", common code is "ri".'),
        make_q('m6-q21', 'Logical', 'Intermediate', 'Interchanging ranks: A is 10th from left and B is 9th from right. When they interchange positions, A becomes 15th from left. How many boys in the row?', '23', '24', '25', '26', 'Step 1: Total = 15 + 9 - 1 = 23.'),
        make_q('m6-q22', 'Logical', 'Intermediate', 'Calendar Determination: What day of the week was 15th August 1947?', 'Friday', 'Thursday', 'Saturday', 'Sunday', 'Step 1: 1946 years + Jan-Aug 15 1947 yields 5 odd days = Friday.'),
        # Verbal (23-32)
        make_q('m6-q23', 'Verbal', 'Intermediate', 'Select the antonym for the temporal adjective "EPHEMERAL":', 'Permanent', 'Fleeting', 'Transient', 'Short-lived', 'Step 1: "Ephemeral" means short-lived; opposite is "Permanent".'),
        make_q('m6-q24', 'Verbal', 'Intermediate', 'Choose the synonym for "UBIQUITOUS":', 'Omnipresent', 'Rare', 'Hidden', 'Solitary', 'Step 1: "Ubiquitous" means found everywhere; synonym is "Omnipresent".'),
        make_q('m6-q25', 'Verbal', 'Intermediate', 'Spot the subject-verb agreement error: "The quality of these manufactured goods (A) / are strictly inspected (B) / by QA. (C) / No error (D)"', 'B', 'A', 'C', 'D', 'Step 1: Head noun "quality" is singular, requiring "is strictly inspected". Error in B.'),
        make_q('m6-q26', 'Verbal', 'Intermediate', 'Fill in the blank with appropriate preposition: "He was prohibited _____ entering the server room."', 'from', 'to', 'for', 'by', 'Step 1: "Prohibited from [doing something]" is standard usage.'),
        make_q('m6-q27', 'Verbal', 'Intermediate', 'Spelling Drill 6: Choose the correctly spelled word for an administrative system of government:', 'Bureaucracy', 'Beurocracy', 'Bureaucracye', 'Bureacracy', 'Step 1: Correct spelling is BUREAUCRACY.'),
        make_q('m6-q28', 'Verbal', 'Intermediate', 'What does the idiom "Burn the midnight oil" mean?', 'To work or study late into the night', 'To waste energy', 'To light a lamp', 'To have an argument', 'Step 1: Means working hard late into the night.'),
        make_q('m6-q29', 'Verbal', 'Intermediate', 'Fill in the blank with third conditional: "If they _____ the tests, the bug would not have occurred."', 'had executed', 'has executed', 'would execute', 'will execute', 'Step 1: Third conditional requires past perfect "had executed".'),
        make_q('m6-q30', 'Verbal', 'Intermediate', 'Convert to Passive Voice: "The architect evaluated the blueprints."', 'The blueprints were evaluated by the architect.', 'The blueprints was evaluated by the architect.', 'The blueprints had evaluated by the architect.', 'The blueprints were evaluate by the architect.', 'Step 1: Past passive for plural object "blueprints" is "were evaluated".'),
        make_q('m6-q31', 'Verbal', 'Intermediate', 'Rearrange: P: reduced latency, Q: migrated to microservices, R: improved satisfaction, S: within three months.', 'Q - P - S - R', 'Q - P - R - S', 'P - Q - R - S', 'S - Q - P - R', 'Step 1: Action (Q) -> Tech effect (P) -> Timeframe (S) -> Result (R).'),
        make_q('m6-q32', 'Verbal', 'Intermediate', 'Vocabulary Analogy: Ephemeral : Permanent :: Feasible : ?', 'Impracticable', 'Viable', 'Plausible', 'Realistic', 'Step 1: Opposite of Feasible (practicable) is Impracticable.'),
        # Non-Verbal (33-36)
        make_q('m6-q33', 'NonVerbal', 'Intermediate', 'On a standard 6-sided die, what is the sum of any two opposite faces?', '7', '6', '8', '9', 'Step 1: Standard opposite pairs: 1+6=7, 2+5=7, 3+4=7.'),
        make_q('m6-q34', 'NonVerbal', 'Intermediate', 'How many total triangles are in a square with both diagonals and one vertical dividing line?', '12', '8', '10', '14', 'Step 1: 6 simple triangles + 4 medium + 2 large halves = 12 total triangles.'),
        make_q('m6-q35', 'NonVerbal', 'Intermediate', 'A 3cm painted cube is cut into 27 1cm unit cubes. How many have exactly 2 faces painted?', '12', '8', '6', '1', 'Step 1: 12 * (n - 2) = 12 * (3 - 2) = 12 cubes.'),
        make_q('m6-q36', 'NonVerbal', 'Intermediate', 'In a 3x3 pattern matrix, each row shifts an arrow 45° clockwise. If Col 1 is South (180°), what is Col 3?', '270° (West)', '225° (South-West)', '315° (North-West)', '0° (North)', 'Step 1: 180° + 45° + 45° = 270° (West).'),
        # DI (37-40)
        make_q('m6-q37', 'DI', 'Intermediate', 'Annual revenue: Company A = $260M, Company B = $240M. What is the difference in revenue?', '$20M', '$15M', '$25M', '$30M', 'Step 1: 260 - 240 = $20M.'),
        make_q('m6-q38', 'DI', 'Intermediate', 'Trade analysis: Exports = $150B, Imports = $180B. Trade deficit as % of Imports?', '16.67%', '14.5%', '18.0%', '20.0%', 'Step 1: (30 / 180) * 100 = 16.67%.'),
        make_q('m6-q39', 'DI', 'Intermediate', 'Operations division has 20% of headcount = 80 employees. What is total company headcount?', '400', '350', '450', '500', 'Step 1: 80 / 0.20 = 400 employees.'),
        make_q('m6-q40', 'DI', 'Intermediate', 'Profit margin rose from 12% to 18%. What is the gain in percentage points?', '6 percentage points', '4 percentage points', '5 percentage points', '8 percentage points', 'Step 1: 18 - 12 = 6 percentage points.')
    ]
    tests.append({
        "id": "mock-test-6", "sectionId": "intermediate", "testNumber": 6,
        "title": "Intermediate Quantitative Proficiency", "level": "Intermediate",
        "focus": "Profit-Loss, Partnerships & Syllogisms", "difficulty": "Intermediate",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t6_qs
    })

    # ---------------------------------------------------------
    # Test 7: Standard Deductive & Analytical Drill
    # ---------------------------------------------------------
    t7_qs = [
        # Quant (1-12)
        make_q('m7-q1', 'Quant', 'Intermediate', 'A shopkeeper sells an article at 20% profit. If CP was 10% less and SP Rs. 18 less, he would have gained 25%. Find CP.', 'Rs. 400', 'Rs. 360', 'Rs. 450', 'Rs. 500', 'Step 1: Let CP = x. SP1 = 1.20x. New CP = 0.90x. New SP = 1.20x - 18.\nStep 2: 1.20x - 18 = 1.25 * (0.90x) = 1.125x => 0.075x = 18 => x = Rs. 400.'),
        make_q('m7-q2', 'Quant', 'Intermediate', 'Find the CI on Rs. 8,000 for 1.5 years at 10% per annum compounded semi-annually.', 'Rs. 1,261', 'Rs. 1,200', 'Rs. 1,240', 'Rs. 1,300', 'Step 1: Rate per period = 5%, n = 3 periods.\nStep 2: Amount = 8000 * (1.05)^3 = 8000 * 1.157625 = Rs. 9,261.\nStep 3: CI = 9261 - 8000 = Rs. 1,261.'),
        make_q('m7-q3', 'Quant', 'Intermediate', 'A can do a job in 20 days and B in 30 days. They work on alternate days starting with A. In how many days is work completed?', '24 days', '22 days', '25 days', '26 days', 'Step 1: Total work = 60 units. A = 3 u/day, B = 2 u/day.\nStep 2: 2-day work = 5 units. 12 pairs of 2-days (24 days) = 12 * 5 = 60 units.'),
        make_q('m7-q4', 'Quant', 'Intermediate', 'A train passes a 250m long tunnel in 30s and a 400m long tunnel in 40s at uniform speed. Find the length of the train.', '200 m', '150 m', '180 m', '220 m', 'Step 1: Speed = (400 - 250) / (40 - 30) = 150 / 10 = 15 m/s.\nStep 2: Length + 250 = 15 * 30 = 450 => Length = 200 m.'),
        make_q('m7-q5', 'Quant', 'Intermediate', 'From 40 liters of pure milk, 4 liters are removed and replaced with water. This process is repeated one more time. How much milk remains?', '32.4 liters', '31.5 liters', '33.2 liters', '34.0 liters', 'Step 1: Remaining Milk = 40 * (1 - 4/40)^2 = 40 * (0.9)^2 = 40 * 0.81 = 32.4 liters.'),
        make_q('m7-q6', 'Quant', 'Intermediate', 'A committee of 4 members is to be formed from 5 men and 4 women. What is the probability that the committee consists of 2 men and 2 women?', '10/21', '5/14', '8/21', '1/2', 'Step 1: Total ways = 9C4 = (9*8*7*6)/(24) = 126.\nStep 2: Favorable ways = 5C2 * 4C2 = 10 * 6 = 60.\nStep 3: Probability = 60 / 126 = 10 / 21.'),
        make_q('m7-q7', 'Quant', 'Intermediate', 'A single card is drawn from a well-shuffled pack of 52 cards. What is the probability of getting either a Red card or a King?', '7/13', '1/2', '15/26', '8/13', 'Step 1: Red cards = 26. Kings = 4 (2 are red, 2 are black).\nStep 2: Total favorable = 26 + 2 = 28.\nStep 3: Probability = 28 / 52 = 7 / 13.'),
        make_q('m7-q8', 'Quant', 'Intermediate', 'A boat goes 30 km downstream and comes back to starting point in a total of 8 hours. If stream speed is 2 km/hr, find boat speed in still water.', '8 km/hr', '6 km/hr', '10 km/hr', '12 km/hr', 'Step 1: 30/(v+2) + 30/(v-2) = 8.\nStep 2: If v = 8: 30/10 + 30/6 = 3 + 5 = 8 hours. Hence v = 8 km/hr.'),
        make_q('m7-q9', 'Quant', 'Intermediate', 'Partnership Share: A and B invest in ratio 3 : 5. After 6 months, C joins with an amount equal to B. At year end, what is C’s share in profit of Rs. 44,000?', 'Rs. 10,000', 'Rs. 11,000', 'Rs. 12,000', 'Rs. 14,000', 'Step 1: Relative profit shares computed across duration product.'),
        make_q('m7-q10', 'Quant', 'Intermediate', 'At what time between 7 and 8 o’clock will the hands of a clock be in the same straight line pointing in opposite directions?', '5 5/11 min past 7', '6 4/11 min past 7', '7 2/11 min past 7', '8 3/11 min past 7', 'Step 1: Opposite directions means angle = 180°. Angle = |30(7) - 5.5M| = 180 => 210 - 5.5M = 180 => 5.5M = 30 => M = 60/11 = 5 5/11 minutes past 7.'),
        make_q('m7-q11', 'Quant', 'Intermediate', 'A sum doubles in 3 years at CI. In how many years will it become 16 times?', '12 years', '9 years', '15 years', '18 years', 'Step 1: 16 = 2^4. Time = 4 * 3 = 12 years.'),
        make_q('m7-q12', 'Quant', 'Intermediate', 'A cylindrical tank of radius 7m and height 10m is full of water. What is the volume of water in cubic meters? (pi = 22/7)', '1,540 cu m', '1,480 cu m', '1,600 cu m', '1,620 cu m', 'Step 1: Volume = pi * r^2 * h = (22/7) * 49 * 10 = 22 * 7 * 10 = 1,540 cu m.'),
        # Logical (13-22)
        make_q('m7-q13', 'Logical', 'Intermediate', 'In a code language, if "LEAD" = 20 and "TAIL" = 46, how is "HEAD" coded?', '24', '22', '26', '28', 'Step 1: H(8)+E(5)+A(1)+D(4) = 18 + 6 = 24.'),
        make_q('m7-q14', 'Logical', 'Intermediate', 'Find missing number in progressive difference series: 6, 13, 28, 59, ?', '122', '118', '120', '126', 'Step 1: 6*2+1=13, 13*2+2=28, 28*2+3=59. Next is 59*2+4 = 118 + 4 = 122.'),
        make_q('m7-q15', 'Logical', 'Intermediate', 'Pointing to a gentleman, Deepak said, "His only son is my son\'s uncle." How is the gentleman related to Deepak?', 'Father', 'Uncle', 'Brother', 'Grandfather', 'Step 1: "My son\'s uncle" is Deepak\'s brother. "His only son is Deepak\'s brother" => The gentleman is Deepak\'s Father.'),
        make_q('m7-q16', 'Logical', 'Intermediate', 'A man walks 30m North, turns right and walks 40m, turns right and walks 20m, then turns right again and walks 40m. How far is he from origin?', '10 m', '20 m', '30 m', '40 m', 'Step 1: North 30 - South 20 = 10m North. East 40 - West 40 = 0. Distance = 10 meters.'),
        make_q('m7-q17', 'Logical', 'Intermediate', 'In a row of 25 students facing North, P is 12th from left and Q is 16th from right. How many students sit between P and Q?', '1', '2', '3', '0', 'Step 1: Sum of ranks = 12 + 16 = 28 > 25 (Overlap). Overlap = 28 - 25 - 2 = 1 student.'),
        make_q('m7-q18', 'Logical', 'Intermediate', 'Syllogism Analysis: Statements: 1. Some fruits are vegetables. 2. All vegetables are greens. Conclusions: I. Some fruits are greens. II. No green is fruit.', 'Only I follows', 'Only II follows', 'Both follow', 'Neither follows', 'Step 1: Fruits overlap with vegetables which are inside greens => Some fruits are greens (I follows).'),
        make_q('m7-q19', 'Logical', 'Intermediate', 'Advertisement Evaluation: "Use XYZ engine oil for optimal mileage." Assumption I: People desire good mileage. Assumption II: XYZ oil enhances mileage.', 'Both I and II are implicit', 'Only I is implicit', 'Only II is implicit', 'Neither is implicit', 'Step 1: Ad assumes target audience desires benefit (I) and product delivers it (II).'),
        make_q('m7-q20', 'Logical', 'Intermediate', 'If "134" = "good and tasty", "478" = "see good pictures", "729" = "pictures are faint", what digit represents "see"?', '8', '4', '7', '1', 'Step 1: "4" is "good", "7" is "pictures". Thus "8" = "see".'),
        make_q('m7-q21', 'Logical', 'Intermediate', 'Seven persons A, B, C, D, E, F, G sit in a row facing North. D sits in middle. A and B are at extremes. If C is left of D, who is to right of D?', 'E, F, or G', 'A', 'B', 'Cannot be determined', 'Step 1: D is 4th. C is in pos 1..3. Positions 5..7 are occupied by E, F, G, or B.'),
        make_q('m7-q22', 'Logical', 'Intermediate', 'If today is Thursday, what day was it 95 days ago?', 'Sunday', 'Monday', 'Wednesday', 'Tuesday', 'Step 1: 95 mod 7 = 4 odd days. Thursday - 4 days = Sunday.'),
        # Verbal (23-32)
        make_q('m7-q23', 'Verbal', 'Intermediate', 'Select the synonym for "METICULOUS":', 'Painstaking', 'Careless', 'Hasty', 'Superficial', 'Step 1: "Meticulous" means showing great attention to detail; synonym is "Painstaking".'),
        make_q('m7-q24', 'Verbal', 'Intermediate', 'Choose the antonym for "CANDID":', 'Deceitful', 'Frank', 'Honest', 'Sincere', 'Step 1: "Candid" means truthful and direct; opposite is "Deceitful".'),
        make_q('m7-q25', 'Verbal', 'Intermediate', 'Spot the tense error: "He told me that (A) / he has finished (B) / the report yesterday. (C) / No error (D)"', 'B', 'A', 'C', 'D', 'Step 1: With past time marker "yesterday", use past simple or past perfect: "had finished". Error in B.'),
        make_q('m7-q26', 'Verbal', 'Intermediate', 'Fill in the blank: "The manager is confident _____ achieving the quarterly targets."', 'of', 'in', 'to', 'for', 'Step 1: Adjective "confident" takes preposition "of" + gerund.'),
        make_q('m7-q27', 'Verbal', 'Intermediate', 'Spelling Drill 7: Choose the correctly spelled word meaning wishing to do what is right:', 'Conscientious', 'Consciencious', 'Conscintious', 'Conscientous', 'Step 1: Correct spelling is CONSCIENTIOUS.'),
        make_q('m7-q28', 'Verbal', 'Intermediate', 'What does the idiom "Bite the bullet" mean?', 'To face a difficult situation with courage', 'To eat something hard', 'To fire a weapon', 'To avoid conflict', 'Step 1: "Bite the bullet" means accepting an inevitable hardship bravely.'),
        make_q('m7-q29', 'Verbal', 'Intermediate', 'Fill in the blank with correlative conjunction: "Scarcely had he left the conference hall _____ the thunderous ovation began."', 'when', 'than', 'then', 'so', 'Step 1: "Scarcely... when" is the mandatory grammatical pair.'),
        make_q('m7-q30', 'Verbal', 'Intermediate', 'Convert to Direct Speech: "She said that she was writing an automated test script."', 'She said, "I am writing an automated test script."', 'She said, "I was writing an automated test script."', 'She said, "I wrote an automated test script."', 'She said, "I had written an automated test script."', 'Step 1: Past continuous in indirect speech corresponds to present continuous in direct speech.'),
        make_q('m7-q31', 'Verbal', 'Intermediate', 'Rearrange: P: reducing overhead, Q: caching static assets, R: speeds up page load, S: across global networks.', 'Q - R - P - S', 'P - Q - R - S', 'S - Q - P - R', 'R - Q - P - S', 'Step 1: Subject (Q) -> Verb phrase (R) -> Modifier (P) -> Domain (S).'),
        make_q('m7-q32', 'Verbal', 'Intermediate', 'Analogy Drill: Opaque : Transparent :: Rigid : ?', 'Flexible', 'Solid', 'Stiff', 'Hard', 'Step 1: Opaque is opposite of Transparent; Rigid is opposite of Flexible.'),
        # Non-Verbal (33-36)
        make_q('m7-q33', 'NonVerbal', 'Intermediate', 'A die has opposite faces summing to 7. If top face shows 4, what face touches the table?', '3', '2', '5', '6', 'Step 1: Opposite of 4 is 7 - 4 = 3.'),
        make_q('m7-q34', 'NonVerbal', 'Intermediate', 'How many squares are on an 8x8 standard chessboard?', '204', '64', '128', '256', 'Step 1: Sum of squares = 1^2 + 2^2 + ... + 8^2 = (8*9*17)/6 = 204 squares.'),
        make_q('m7-q35', 'NonVerbal', 'Intermediate', 'A 4cm cube painted green is cut into 1cm cubes (64 cubes). How many have NO painted faces?', '8', '4', '16', '24', 'Step 1: Inner unpainted cubes = (n - 2)^3 = (4 - 2)^3 = 2^3 = 8 cubes.'),
        make_q('m7-q36', 'NonVerbal', 'Intermediate', 'An analog clock shows 9:30. What is the angle between the hour hand and minute hand?', '105°', '90°', '100°', '115°', 'Step 1: Angle = |30(9) - 5.5(30)| = |270 - 165| = 105°.'),
        # DI (37-40)
        make_q('m7-q37', 'DI', 'Intermediate', 'Automobile metrics: Production: 2020=50k, 2021=65k, 2022=80k, 2023=100k. Percentage growth from 2020 to 2023?', '100%', '80%', '90%', '120%', 'Step 1: Growth = (100 - 50)/50 * 100 = 100%.'),
        make_q('m7-q38', 'DI', 'Intermediate', 'Gender demographic: Male to Female ratio in Company X is 3 : 2. If total employees is 500, how many are male?', '300', '200', '250', '350', 'Step 1: Male = (3/5) * 500 = 300.'),
        make_q('m7-q39', 'DI', 'Intermediate', 'Budget allocation: In a budget, R&D sector is 72° and Marketing is 108°. What is the ratio of R&D to Marketing spend?', '2 : 3', '1 : 2', '3 : 4', '4 : 5', 'Step 1: 72 / 108 = 2 / 3.'),
        make_q('m7-q40', 'DI', 'Intermediate', 'Quarterly sales grew from $40M in Q1 to $60M in Q2. What is the % growth?', '50%', '40%', '60%', '75%', 'Step 1: (20 / 40) * 100 = 50%.')
    ]
    tests.append({
        "id": "mock-test-7", "sectionId": "intermediate", "testNumber": 7,
        "title": "Standard Deductive & Analytical Drill", "level": "Intermediate",
        "focus": "Blood Relations, Direction & Venn Diagrams", "difficulty": "Intermediate",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t7_qs
    })

    # ---------------------------------------------------------
    # Test 8: Commercial Mathematics & Data Tables
    # ---------------------------------------------------------
    t8_qs = [
        # Quant (1-12)
        make_q('m8-q1', 'Quant', 'Intermediate', 'A sum of money invested at SI amounts to Rs. 8,800 in 2 years and Rs. 10,600 in 5 years. Find the principal.', 'Rs. 7,600', 'Rs. 7,200', 'Rs. 7,500', 'Rs. 8,000', 'Step 1: 3 years SI = 10,600 - 8,800 = Rs. 1,800 => 1 year SI = Rs. 600.\nStep 2: 2 years SI = Rs. 1,200.\nStep 3: Principal = 8,800 - 1,200 = Rs. 7,600.'),
        make_q('m8-q2', 'Quant', 'Intermediate', 'A trader uses a false weight of 900 grams instead of 1 kg. What is his profit percentage?', '11.11%', '10.0%', '12.5%', '15.0%', 'Step 1: Profit % = (Error / True Value - Error) * 100 = (100 / 900) * 100 = 11.11%.'),
        make_q('m8-q3', 'Quant', 'Intermediate', 'Pipe A fills in 10 hrs, Pipe B in 12 hrs, Pipe C empties in 20 hrs. If all 3 are open, how long to fill the tank?', '7.5 hours', '6.0 hours', '8.0 hours', '9.0 hours', 'Step 1: Rate = 1/10 + 1/12 - 1/20 = (6 + 5 - 3)/60 = 8/60 = 2/15.\nStep 2: Time = 15 / 2 = 7.5 hours.'),
        make_q('m8-q4', 'Quant', 'Intermediate', 'Two cyclists start from same point in opposite directions at 15 km/hr and 20 km/hr. How far apart will they be after 3.5 hours?', '122.5 km', '115 km', '120 km', '130 km', 'Step 1: Relative speed = 15 + 20 = 35 km/hr.\nStep 2: Distance = 35 * 3.5 = 122.5 km.'),
        make_q('m8-q5', 'Quant', 'Intermediate', 'In what ratio must rice at Rs. 40/kg be mixed with rice at Rs. 60/kg to get a mixture worth Rs. 48/kg?', '3 : 2', '2 : 3', '4 : 3', '5 : 4', 'Step 1: By Alligation: (60 - 48) : (48 - 40) = 12 : 8 = 3 : 2.'),
        make_q('m8-q6', 'Quant', 'Intermediate', 'How many 4-digit numbers can be formed using digits 1, 2, 3, 4, 5 without repetition?', '120', '96', '100', '144', 'Step 1: 5P4 = 5 * 4 * 3 * 2 = 120.'),
        make_q('m8-q7', 'Quant', 'Intermediate', 'A bag contains 5 red, 4 blue, and 3 green marbles. If 2 marbles are drawn at random, what is the probability that both are red?', '5/33', '1/6', '5/36', '2/11', 'Step 1: Total marbles = 12. 12C2 = (12*11)/2 = 66.\nStep 2: 5C2 = 10. Probability = 10 / 66 = 5 / 33.'),
        make_q('m8-q8', 'Quant', 'Intermediate', 'A man can row 6 km/hr in still water. If stream speed is 2 km/hr, how long does he take to row 16 km upstream?', '4 hours', '3 hours', '3.5 hours', '5 hours', 'Step 1: Upstream speed = 6 - 2 = 4 km/hr.\nStep 2: Time = 16 / 4 = 4 hours.'),
        make_q('m8-q9', 'Quant', 'Intermediate', 'A, B, C enter a partnership. A invests Rs. 20,000, B Rs. 30,000, C Rs. 50,000. Out of total profit of Rs. 100,000, what is B’s share?', 'Rs. 30,000', 'Rs. 20,000', 'Rs. 40,000', 'Rs. 50,000', 'Step 1: Ratio = 2 : 3 : 5 (Total parts = 10).\nStep 2: B\'s share = (3/10) * 100,000 = Rs. 30,000.'),
        make_q('m8-q10', 'Quant', 'Intermediate', 'What is the angle between hands of a clock at 8:30?', '75°', '60°', '70°', '80°', 'Step 1: Angle = |30(8) - 5.5(30)| = |240 - 165| = 75°.'),
        make_q('m8-q11', 'Quant', 'Intermediate', 'Find CI on Rs. 16,000 for 9 months at 20% per annum compounded quarterly.', 'Rs. 2,522', 'Rs. 2,400', 'Rs. 2,500', 'Rs. 2,600', 'Step 1: Rate per quarter = 5%, n = 3 quarters.\nStep 2: Amount = 16000 * (1.05)^3 = 16000 * 1.157625 = Rs. 18,522.\nStep 3: CI = Rs. 2,522.'),
        make_q('m8-q12', 'Quant', 'Intermediate', 'The total surface area of a solid cube is 150 sq cm. Find its volume in cubic cm.', '125 cu cm', '100 cu cm', '150 cu cm', '216 cu cm', 'Step 1: 6a^2 = 150 => a^2 = 25 => a = 5 cm.\nStep 2: Volume = 5^3 = 125 cu cm.'),
        # Logical (13-22)
        make_q('m8-q13', 'Logical', 'Intermediate', 'If "DOCTOR" is coded as "FQEVQT", how is "PATIENT" coded with +2 shift on each letter?', 'RCVKGPV', 'RCVKGOU', 'QBUJFMU', 'RDVLHQV', 'Step 1: P(+2)=R, A(+2)=C, T(+2)=V, I(+2)=K, E(+2)=G, N(+2)=P, T(+2)=V => RCVKGPV.'),
        make_q('m8-q14', 'Logical', 'Intermediate', 'Find the next term in the n^2*(n-1) series: 4, 18, 48, 100, 180, ?', '294', '260', '280', '312', 'Step 1: For n=7: 7^2 * 6 = 49 * 6 = 294.'),
        make_q('m8-q15', 'Logical', 'Intermediate', 'Pointing to a girl, Sandeep said, "She is the daughter of the only son of my grandfather." How is the girl related to Sandeep?', 'Sister', 'Daughter', 'Mother', 'Aunt', 'Step 1: "Only son of my grandfather" is Sandeep\'s father. Daughter of father = Sister.'),
        make_q('m8-q16', 'Logical', 'Intermediate', 'A man walks 40m South, turns left and walks 30m, turns left and walks 40m. How far is he from start?', '30 m East', '30 m West', '40 m East', '70 m East', 'Step 1: South 40 and North 40 cancel. Remaining displacement is 30m East.'),
        make_q('m8-q17', 'Logical', 'Intermediate', 'Non-overlapping line ranking: In a class, Manoj is 7th from top and Shreya is 10th from bottom with 3 students between them. Total students?', '20', '18', '14', '22', 'Step 1: 7 + 10 + 3 = 20.'),
        make_q('m8-q18', 'Logical', 'Intermediate', 'Statements: 1. All doors are keys. 2. All keys are locks. Conclusions: I. All doors are locks. II. Some locks are doors.', 'Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows', 'Step 1: Doors inside keys, keys inside locks => All doors are locks and some locks are doors.'),
        make_q('m8-q19', 'Logical', 'Intermediate', 'Statement on Public Safety: "The government should install CCTV cameras across all traffic intersections." Assumption I: CCTV helps monitor traffic violations. Assumption II: Cameras deter criminal activity.', 'Both I and II are implicit', 'Only I is implicit', 'Only II is implicit', 'Neither is implicit', 'Step 1: Both assumptions state established regulatory and security objectives of traffic CCTVs.'),
        make_q('m8-q20', 'Logical', 'Intermediate', 'In a code, "786" = "study very hard", "958" = "hard work pays", "645" = "study and work". What digit is "very"?', '7', '8', '6', '9', 'Step 1: "8" = "hard", "6" = "study". Thus "7" = "very".'),
        make_q('m8-q21', 'Logical', 'Intermediate', 'Five friends A, B, C, D, E sit in a circle facing center. A is right of B, E is left of B but right of C. Who is right of A?', 'D', 'C', 'E', 'B', 'Step 1: Circular order clockwise: C -> E -> B -> A -> D. Right of A is D.'),
        make_q('m8-q22', 'Logical', 'Intermediate', 'The calendar for year 2007 will be identical to which future year?', '2018', '2014', '2016', '2020', 'Step 1: 2007 is an ordinary year following a non-leap year. Add 11 years => 2007 + 11 = 2018 (sum of odd days = 0 mod 7).'),
        # Verbal (23-32)
        make_q('m8-q23', 'Verbal', 'Intermediate', 'Select the synonym for "TENACIOUS":', 'Persistent', 'Yielding', 'Weak', 'Fragile', 'Step 1: "Tenacious" means holding fast; synonym is "Persistent".'),
        make_q('m8-q24', 'Verbal', 'Intermediate', 'Choose the antonym for "MITIGATE":', 'Aggravate', 'Alleviate', 'Lessen', 'Relieve', 'Step 1: "Mitigate" means to make less severe; opposite is "Aggravate".'),
        make_q('m8-q25', 'Verbal', 'Intermediate', 'Spot the error: "Each of the software modules (A) / have been optimized (B) / for mobile devices. (C) / No error (D)"', 'B', 'A', 'C', 'D', 'Step 1: "Each of" requires singular verb "has been optimized". Error in B.'),
        make_q('m8-q26', 'Verbal', 'Intermediate', 'Fill in the blank with adjective preposition: "She is capable _____ designing fault-tolerant cloud architectures."', 'of', 'in', 'at', 'with', 'Step 1: "Capable of [doing something]".'),
        make_q('m8-q27', 'Verbal', 'Intermediate', 'Spelling Drill 8: Choose the correctly spelled word for close observation or monitoring:', 'Surveillance', 'Surveilance', 'Surveillence', 'Survaliance', 'Step 1: Correct spelling is SURVEILLANCE.'),
        make_q('m8-q28', 'Verbal', 'Intermediate', 'What does the idiom "Spill the beans" mean?', 'To disclose a secret unintentionally', 'To waste food', 'To plant seeds', 'To make a mess', 'Step 1: "Spill the beans" means revealing secret information.'),
        make_q('m8-q29', 'Verbal', 'Intermediate', 'Fill in the blank with adverbial conjunction: "No sooner did the train arrive at the station _____ the passengers rushed to board."', 'than', 'when', 'then', 'so', 'Step 1: "No sooner... than" is the correct correlative conjunction pair.'),
        make_q('m8-q30', 'Verbal', 'Intermediate', 'Convert to Passive Voice: "Engineers patched the vulnerability."', 'The vulnerability was patched by engineers.', 'The vulnerability were patched by engineers.', 'The vulnerability had patched by engineers.', 'The vulnerability is patched by engineers.', 'Step 1: Past simple passive: "was patched".'),
        make_q('m8-q31', 'Verbal', 'Intermediate', 'Rearrange: P: database indexing, Q: significantly accelerates, R: query execution times, S: in high-volume systems.', 'P - Q - R - S', 'Q - P - R - S', 'S - P - Q - R', 'R - P - Q - S', 'Step 1: Subject (P) -> Verb (Q) -> Object (R) -> Context (S).'),
        make_q('m8-q32', 'Verbal', 'Intermediate', 'Analogy Drill: Penury : Wealth :: Anarchy : ?', 'Order', 'Chaos', 'Lawlessness', 'Rebellion', 'Step 1: Penury (poverty) is opposite of Wealth; Anarchy is opposite of Order.'),
        # Non-Verbal (33-36)
        make_q('m8-q33', 'NonVerbal', 'Intermediate', 'If a standard dice is rolled, what is the probability of rolling a prime number (2, 3, 5)?', '1/2', '1/3', '2/3', '1/6', 'Step 1: Primes on die = 2, 3, 5 (3 outcomes). P = 3/6 = 1/2.'),
        make_q('m8-q34', 'NonVerbal', 'Intermediate', 'How many rectangles (including squares) are on a 3x3 grid?', '36', '9', '14', '27', 'Step 1: (3*4/2) * (3*4/2) = 6 * 6 = 36 rectangles.'),
        make_q('m8-q35', 'NonVerbal', 'Intermediate', 'A 4cm cube painted red is cut into 64 1cm cubes. How many cubes have EXACTLY 1 face painted?', '24', '8', '12', '16', 'Step 1: 6 * (n - 2)^2 = 6 * (4 - 2)^2 = 6 * 4 = 24 cubes.'),
        make_q('m8-q36', 'NonVerbal', 'Intermediate', 'What is the angle between hands of a clock at 3:30?', '75°', '60°', '70°', '80°', 'Step 1: Angle = |30(3) - 5.5(30)| = |90 - 165| = 75°.'),
        # DI (37-40)
        make_q('m8-q37', 'DI', 'Intermediate', 'Table Data: Production across 3 plants: A=200, B=350, C=450. Total = 1000. What % is Plant B?', '35%', '30%', '40%', '45%', 'Step 1: (350 / 1000) * 100 = 35%.'),
        make_q('m8-q38', 'DI', 'Intermediate', 'Bar Chart: Imports grew from $50B in 2021 to $65B in 2022. Percentage growth?', '30%', '25%', '35%', '40%', 'Step 1: (15 / 50) * 100 = 30%.'),
        make_q('m8-q39', 'DI', 'Intermediate', 'In a workforce pie chart, Product Management is 36°. What % of workforce is this?', '10%', '12%', '15%', '8%', 'Step 1: (36 / 360) * 100 = 10%.'),
        make_q('m8-q40', 'DI', 'Intermediate', 'Line Graph shows active sessions: Morning = 20k, Evening = 50k. Growth amount?', '30k', '20k', '25k', '35k', 'Step 1: 50k - 20k = 30k.')
    ]
    tests.append({
        "id": "mock-test-8", "sectionId": "intermediate", "testNumber": 8,
        "title": "Commercial Mathematics & Data Tables", "level": "Intermediate",
        "focus": "SI-CI, Mixtures & Bar Chart Analysis", "difficulty": "Intermediate",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t8_qs
    })

    # ---------------------------------------------------------
    # Test 9: Speed-Distance & Verbal Reasoning
    # ---------------------------------------------------------
    t9_qs = [
        # Quant (1-12)
        make_q('m9-q1', 'Quant', 'Intermediate', 'A person walks at 4 km/hr and reaches office 10 mins late. If he walks at 5 km/hr, he reaches 5 mins early. Find distance to office.', '5 km', '4 km', '6 km', '7.5 km', 'Step 1: Time difference = 10 - (-5) = 15 mins = 1/4 hr.\nStep 2: D/4 - D/5 = 1/4 => D/20 = 1/4 => D = 5 km.'),
        make_q('m9-q2', 'Quant', 'Intermediate', 'Find compound interest on Rs. 10,000 for 2 years at 12% per annum compounded annually.', 'Rs. 2,544', 'Rs. 2,400', 'Rs. 2,500', 'Rs. 2,600', 'Step 1: Amount = 10,000 * (1.12)^2 = 10,000 * 1.2544 = Rs. 12,544.\nStep 2: CI = Rs. 2,544.'),
        make_q('m9-q3', 'Quant', 'Intermediate', 'A and B can complete a work in 12 days, B and C in 15 days, C and A in 20 days. In how many days can A, B, and C together finish it?', '10 days', '8 days', '12 days', '15 days', 'Step 1: 2*(A + B + C) = 1/12 + 1/15 + 1/20 = (5 + 4 + 3)/60 = 12/60 = 1/5.\nStep 2: A + B + C = 1/10 per day => 10 days.'),
        make_q('m9-q4', 'Quant', 'Intermediate', 'A 180-meter long train crosses another 120-meter train running in the same direction in 30 seconds. If speed of first is 54 km/hr, find speed of second.', '18 km/hr', '24 km/hr', '36 km/hr', '40 km/hr', 'Step 1: Total distance = 180 + 120 = 300m.\nStep 2: Relative speed = 300 / 30 = 10 m/s = 36 km/hr.\nStep 3: 54 - S2 = 36 => S2 = 18 km/hr.'),
        make_q('m9-q5', 'Quant', 'Intermediate', 'A solution contains 20% alcohol. How much pure alcohol must be added to 40 liters of this solution to make it 50% alcohol?', '24 liters', '20 liters', '25 liters', '30 liters', 'Step 1: Initial alcohol = 0.20 * 40 = 8L. Water = 32L.\nStep 2: In 50% solution, Alcohol = Water = 32L.\nStep 3: Pure alcohol added = 32 - 8 = 24 liters.'),
        make_q('m9-q6', 'Quant', 'Intermediate', 'In how many ways can 5 boys and 3 girls be seated in a row such that all 3 girls sit together?', '4,320', '720', '1,440', '5,040', 'Step 1: Bundle 3 girls as 1 unit. Units = 5 boys + 1 bundle = 6 units (6! = 720 ways).\nStep 2: 3 girls arrange in 3! = 6 ways.\nStep 3: Total = 720 * 6 = 4,320.'),
        make_q('m9-q7', 'Quant', 'Intermediate', 'What is the probability of getting a sum of 7 or 11 when pair of fair dice is thrown?', '2/9', '1/6', '7/36', '5/18', 'Step 1: Sum 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) -> 6 outcomes. Sum 11: (5,6),(6,5) -> 2 outcomes. Total = 8.\nStep 2: Probability = 8 / 36 = 2 / 9.'),
        make_q('m9-q8', 'Quant', 'Intermediate', 'A man rows 18 km downstream in 3 hours and returns upstream in 6 hours. Find speed of current.', '1.5 km/hr', '1.0 km/hr', '2.0 km/hr', '2.5 km/hr', 'Step 1: Downstream = 18/3 = 6 km/hr. Upstream = 18/6 = 3 km/hr.\nStep 2: Current = (6 - 3)/2 = 1.5 km/hr.'),
        make_q('m9-q9', 'Quant', 'Intermediate', 'A and B start a business investing in ratio 4 : 5. After 3 months, A withdraws 1/4 of his capital while B withdraws 1/5. Profit ratio at year end?', '13 : 17', '12 : 17', '14 : 19', '15 : 21', 'Step 1: A = 4*3 + 3*9 = 12 + 27 = 39. B = 5*3 + 4*9 = 15 + 36 = 51.\nStep 2: 39 : 51 = 13 : 17.'),
        make_q('m9-q10', 'Quant', 'Intermediate', 'How many times do the hands of a clock coincide in 24 hours?', '22 times', '24 times', '44 times', '48 times', 'Step 1: Hands coincide 11 times every 12 hours (due to 11 to 1 overlap). In 24 hours = 22 times.'),
        make_q('m9-q11', 'Quant', 'Intermediate', 'A sum of money invested at 10% CI compounded annually amounts to Rs. 13,310 in 3 years. Find the principal.', 'Rs. 10,000', 'Rs. 9,500', 'Rs. 10,500', 'Rs. 11,000', 'Step 1: P * (1.1)^3 = 13310 => P * 1.331 = 13310 => P = Rs. 10,000.'),
        make_q('m9-q12', 'Quant', 'Intermediate', 'Find the volume of a right circular cone of radius 6 cm and height 7 cm. (pi = 22/7)', '264 cu cm', '240 cu cm', '256 cu cm', '280 cu cm', 'Step 1: Volume = (1/3) * pi * r^2 * h = (1/3) * (22/7) * 36 * 7 = 22 * 12 = 264 cu cm.'),
        # Logical (13-22)
        make_q('m9-q13', 'Logical', 'Intermediate', 'In a code, "SYSTEM" is written as "SYSMET" and "NEARER" as "AENRER". How is "FRACTION" written?', 'CARFNOIT', 'CARFTION', 'ARCFNOIT', 'FRACNOIT', 'Step 1: Split word into two equal halves (FRAC - TION), reverse each half (CARF - NOIT) => CARFNOIT.'),
        make_q('m9-q14', 'Logical', 'Intermediate', 'Find missing number in cubic offset series: 3, 10, 29, 66, 127, ?', '218', '216', '220', '225', 'Step 1: Pattern is n^3 + 2: 1^3+2=3, 2^3+2=10, 3^3+2=29, 4^3+2=66, 5^3+2=127. Next is 6^3+2 = 216 + 2 = 218.'),
        make_q('m9-q15', 'Logical', 'Intermediate', 'Family Logic: A is father of C, but C is not his son. How is C related to A?', 'Daughter', 'Sister', 'Niece', 'Mother', 'Step 1: If C is child of A and not son, C must be Daughter.'),
        make_q('m9-q16', 'Logical', 'Intermediate', 'A boy walks 10m East, turns right and walks 10m, turns right and walks 10m, turns left and walks 10m. What is total distance from origin?', '20 m South', '10 m South', '20 m East', '30 m South', 'Step 1: East 10 - West 10 = 0. South 10 + South 10 = 20m South.'),
        make_q('m9-q17', 'Logical', 'Intermediate', 'In a row of 35 students, Neha is 15th from right. What is her rank from left?', '21st', '20th', '22nd', '19th', 'Step 1: Rank = 35 - 15 + 1 = 21st.'),
        make_q('m9-q18', 'Logical', 'Intermediate', 'Categorical Syllogism: Statements: 1. All flowers are trees. 2. No tree is fruit. Conclusions: I. No flower is fruit. II. Some trees are flowers.', 'Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows', 'Step 1: Flowers inside trees, trees separate from fruit => No flower is fruit (I) and some trees are flowers (II).'),
        make_q('m9-q19', 'Logical', 'Intermediate', 'Academic Curriculum Policy: Statement: "The university introduced mandatory internships in the final year." Assumption I: Internships enhance employability. Assumption II: Companies are willing to provide internships.', 'Both I and II are implicit', 'Only I is implicit', 'Only II is implicit', 'Neither is implicit', 'Step 1: Curriculum changes assume positive educational impact (I) and industry availability (II).'),
        make_q('m9-q20', 'Logical', 'Intermediate', 'If "EARTH" is coded as "FCUXM", how is "MOON" coded with increasing incremental shifts?', 'NQRR', 'NPQS', 'NQSS', 'NQST', 'Step 1: Pattern is +1, +2, +3, +4, +5. M(+1)=N, O(+2)=Q, O(+3)=R, N(+4)=R => NQRR.'),
        make_q('m9-q21', 'Logical', 'Intermediate', 'Six friends A, B, C, D, E, F sit in two parallel rows facing each other. If A faces D and B is to right of A, who does B face?', 'Person adjacent to D', 'D', 'A', 'Cannot be determined', 'Step 1: Parallel row alignment matches adjacent positions directly opposite.'),
        make_q('m9-q22', 'Logical', 'Intermediate', 'Day Determination: If today is Saturday, what day of week will it be after 100 days?', 'Monday', 'Sunday', 'Tuesday', 'Wednesday', 'Step 1: 100 mod 7 = 2 odd days. Saturday + 2 = Monday.'),
        # Verbal (23-32)
        make_q('m9-q23', 'Verbal', 'Intermediate', 'Select the synonym for "OSTENTATIOUS":', 'Showy', 'Modest', 'Plain', 'Quiet', 'Step 1: "Ostentatious" means characterized by pretentious or showy display.'),
        make_q('m9-q24', 'Verbal', 'Intermediate', 'Choose the antonym for "GREGARIOUS":', 'Reclusive', 'Sociable', 'Friendly', 'Outgoing', 'Step 1: "Gregarious" means fond of company; opposite is "Reclusive".'),
        make_q('m9-q25', 'Verbal', 'Intermediate', 'Spot the preposition error: "He is senior than me (A) / in the software engineering (B) / organization. (C) / No error (D)"', 'A', 'B', 'C', 'D', 'Step 1: "Senior" takes preposition "to", not "than". Error in A.'),
        make_q('m9-q26', 'Verbal', 'Intermediate', 'Fill in the blank with dependent preposition: "The candidate was accused _____ violating data privacy regulations."', 'of', 'for', 'with', 'about', 'Step 1: "Accused of [something]".'),
        make_q('m9-q27', 'Verbal', 'Intermediate', 'Spelling Drill 9: Choose the correctly spelled word for a list of research questions:', 'Questionnaire', 'Questionaire', 'Questionairre', 'Questionnare', 'Step 1: Correct spelling is QUESTIONNAIRE (double n).'),
        make_q('m9-q28', 'Verbal', 'Intermediate', 'What does the idiom "Throw in the towel" mean?', 'To surrender or admit defeat', 'To clean up after work', 'To start swimming', 'To challenge an opponent', 'Step 1: Means to give up or admit defeat.'),
        make_q('m9-q29', 'Verbal', 'Intermediate', 'Fill in the blank with plural concord: "Neither the architect nor the developers _____ able to reproduce the latency bug."', 'were', 'was', 'is', 'are', 'Step 1: In "Neither... nor", verb agrees with closer plural subject "developers" => "were able".'),
        make_q('m9-q30', 'Verbal', 'Intermediate', 'Convert to Passive Voice: "The QA team discovered critical defects."', 'Critical defects were discovered by the QA team.', 'Critical defects was discovered by the QA team.', 'Critical defects had discovered by the QA team.', 'Critical defects are discovered by the QA team.', 'Step 1: "were discovered".'),
        make_q('m9-q31', 'Verbal', 'Intermediate', 'Rearrange: P: load balancers distribute, Q: incoming traffic, R: across multiple servers, S: to prevent bottlenecks.', 'P - Q - R - S', 'Q - P - R - S', 'S - P - Q - R', 'R - P - Q - S', 'Step 1: "Load balancers distribute incoming traffic across multiple servers to prevent bottlenecks." (P-Q-R-S).'),
        make_q('m9-q32', 'Verbal', 'Intermediate', 'Personality Analogy: Candid : Deceitful :: Taciturn : ?', 'Voluble', 'Silent', 'Quiet', 'Reserved', 'Step 1: Candid is opposite of Deceitful; Taciturn (quiet) is opposite of Voluble (talkative).'),
        # Non-Verbal (33-36)
        make_q('m9-q33', 'NonVerbal', 'Intermediate', 'A regular hexagon has how many axes of reflective symmetry?', '6', '3', '4', '8', 'Step 1: A regular n-gon has n axes of reflective symmetry. For a hexagon, n = 6.'),
        make_q('m9-q34', 'NonVerbal', 'Intermediate', 'How many squares are there on a 4x4 grid?', '30', '16', '20', '25', 'Step 1: 1^2 + 2^2 + 3^2 + 4^2 = 1 + 4 + 9 + 16 = 30 squares.'),
        make_q('m9-q35', 'NonVerbal', 'Intermediate', 'A 5cm painted cube is cut into 125 1cm unit cubes. How many cubes have 3 faces painted?', '8', '12', '24', '6', 'Step 1: 3-faces painted cubes are the 8 corner vertices of the cube.'),
        make_q('m9-q36', 'NonVerbal', 'Intermediate', 'Angle between hands of clock at 2:20?', '50°', '40°', '60°', '70°', 'Step 1: |30(2) - 5.5(20)| = |60 - 110| = 50°.'),
        # DI (37-40)
        make_q('m9-q37', 'DI', 'Intermediate', 'Engineering team split: Backend=120, Frontend=80, DevOps=50. Total = 250. % Backend?', '48%', '40%', '50%', '52%', 'Step 1: (120 / 250) * 100 = 48%.'),
        make_q('m9-q38', 'DI', 'Intermediate', 'Annual exports = $80M in 2021, $120M in 2022. % growth?', '50%', '40%', '60%', '75%', 'Step 1: (40 / 80) * 100 = 50%.'),
        make_q('m9-q39', 'DI', 'Intermediate', 'Sales division occupies 144° in a 360° pie chart. What % is this?', '40%', '35%', '45%', '50%', 'Step 1: (144 / 360) * 100 = 40%.'),
        make_q('m9-q40', 'DI', 'Intermediate', 'Line graph shows page views: Mon = 100k, Tue = 160k. % increase?', '60%', '50%', '55%', '70%', 'Step 1: (60 / 100) * 100 = 60%.')
    ]
    tests.append({
        "id": "mock-test-9", "sectionId": "intermediate", "testNumber": 9,
        "title": "Speed-Distance & Verbal Reasoning", "level": "Intermediate",
        "focus": "Trains, Boats, Pipes & Sentence Correction", "difficulty": "Intermediate",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t9_qs
    })

    # ---------------------------------------------------------
    # Test 10: Applied Aptitude & Critical Thinking
    # ---------------------------------------------------------
    t10_qs = [
        # Quant (1-12)
        make_q('m10-q1', 'Quant', 'Intermediate', 'A shopkeeper sells two articles at Rs. 990 each, gaining 10% on one and losing 10% on other. What is his overall profit or loss %?', '1% loss', '1% gain', 'No profit no loss', '2% loss', 'Step 1: For same SP with +x% and -x%, overall result is always a loss of (x/10)^2 = (10/10)^2 = 1% loss.'),
        make_q('m10-q2', 'Quant', 'Intermediate', 'If the difference between CI and SI on Rs. 15,000 for 2 years is Rs. 96, find the annual interest rate.', '8%', '6%', '7.5%', '10%', 'Step 1: 96 = 15000 * (R/100)^2 => (R/100)^2 = 96 / 15000 = 0.0064 => R/100 = 0.08 => R = 8%.'),
        make_q('m10-q3', 'Quant', 'Intermediate', '12 men can complete a work in 16 days. 4 days after they started, 4 more men joined. How many more days will it take to finish?', '9 days', '8 days', '10 days', '12 days', 'Step 1: Total work = 12 * 16 = 192 man-days. Work done in 4 days = 12 * 4 = 48. Remaining = 144.\nStep 2: Men now = 16. Days = 144 / 16 = 9 days.'),
        make_q('m10-q4', 'Quant', 'Intermediate', 'Two trains running in opposite directions at 72 km/hr and 54 km/hr pass a man standing on platform in 12s and 18s respectively. Time to pass each other?', '14.57 seconds', '15 seconds', '16 seconds', '14 seconds', 'Step 1: L1 = 20 m/s * 12s = 240m. L2 = 15 m/s * 18s = 270m. Total L = 510m.\nStep 2: Relative speed = 20 + 15 = 35 m/s. Time = 510 / 35 = 14.57 seconds.'),
        make_q('m10-q5', 'Quant', 'Intermediate', 'A container has 50 liters of juice. 10 liters are drawn out and replaced with water. This is done once more. Find remaining juice.', '32 liters', '30 liters', '35 liters', '36 liters', 'Step 1: Remaining = 50 * (1 - 10/50)^2 = 50 * (0.8)^2 = 50 * 0.64 = 32 liters.'),
        make_q('m10-q6', 'Quant', 'Intermediate', 'In how many ways can a committee of 5 be selected from 6 men and 4 women such that it contains at least 3 men?', '186', '120', '150', '210', 'Step 1: Cases: (3M, 2W) = 6C3*4C2 = 20*6 = 120; (4M, 1W) = 6C4*4C1 = 15*4 = 60; (5M, 0W) = 6C5*4C0 = 6*1 = 6.\nStep 2: Total = 120 + 60 + 6 = 186.'),
        make_q('m10-q7', 'Quant', 'Intermediate', 'Two cards are drawn together from pack of 52. Probability that both are Aces?', '1/221', '1/169', '1/26', '1/52', 'Step 1: 4C2 / 52C2 = 6 / 1326 = 1 / 221.'),
        make_q('m10-q8', 'Quant', 'Intermediate', 'A boat travels 36 km downstream in 3 hrs and 24 km upstream in 4 hrs. Speed of boat in still water?', '9 km/hr', '8 km/hr', '10 km/hr', '11 km/hr', 'Step 1: Down = 36/3 = 12 km/hr. Up = 24/4 = 6 km/hr. Still water = (12 + 6)/2 = 9 km/hr.'),
        make_q('m10-q9', 'Quant', 'Intermediate', 'A and B invest in ratio 5 : 6. Profit at year end is Rs. 55,000. What is A’s share?', 'Rs. 25,000', 'Rs. 20,000', 'Rs. 30,000', 'Rs. 35,000', 'Step 1: (5/11) * 55000 = Rs. 25,000.'),
        make_q('m10-q10', 'Quant', 'Intermediate', 'At what time between 2 and 3 o’clock will hands of clock be at right angle (90°)?', '27 3/11 min past 2', '25 min past 2', '28 2/11 min past 2', '30 min past 2', 'Step 1: |30(2) - 5.5M| = 90 => 5.5M = 150 => M = 300/11 = 27 3/11 minutes past 2.'),
        make_q('m10-q11', 'Quant', 'Intermediate', 'Find CI on Rs. 25,000 at 12% per annum for 1 year compounded half-yearly.', 'Rs. 3,090', 'Rs. 3,000', 'Rs. 3,120', 'Rs. 3,200', 'Step 1: 6% per half-year, 2 periods. Amount = 25000 * (1.06)^2 = 25000 * 1.1236 = Rs. 28,090. CI = Rs. 3,090.'),
        make_q('m10-q12', 'Quant', 'Intermediate', 'The diagonal of a square is 10*sqrt(2) cm. What is its area?', '100 sq cm', '50 sq cm', '150 sq cm', '200 sq cm', 'Step 1: Side a = (10*sqrt(2)) / sqrt(2) = 10 cm. Area = 10^2 = 100 sq cm.'),
        # Logical (13-22)
        make_q('m10-q13', 'Logical', 'Intermediate', 'If "MACHINE" is coded as "19-7-9-14-15-20-11" (Letter + 6), how is "DANGER" coded?', '10-7-20-13-11-24', '10-7-19-13-11-24', '11-7-20-13-11-24', '10-8-20-13-11-24', 'Step 1: D(4)+6=10, A(1)+6=7, N(14)+6=20, G(7)+6=13, E(5)+6=11, R(18)+6=24.'),
        make_q('m10-q14', 'Logical', 'Intermediate', 'Find missing number in 2N+1 series: 2, 5, 11, 23, 47, ?', '95', '92', '94', '98', 'Step 1: 2*2+1=5, 5*2+1=11, 11*2+1=23, 23*2+1=47, 47*2+1=95.'),
        make_q('m10-q15', 'Logical', 'Intermediate', 'Pointing to Rahul, Sunita said, "His mother is the only daughter of my mother." How is Sunita related to Rahul?', 'Mother', 'Sister', 'Aunt', 'Grandmother', 'Step 1: Only daughter of Sunita\'s mother is Sunita. Thus Sunita is Rahul\'s Mother.'),
        make_q('m10-q16', 'Logical', 'Intermediate', 'A man walks 6 km South, turns left and walks 8 km. What is straight line distance from origin?', '10 km', '12 km', '14 km', '16 km', 'Step 1: sqrt(6^2 + 8^2) = sqrt(36 + 64) = 10 km.'),
        make_q('m10-q17', 'Logical', 'Intermediate', 'In a test, Mohan ranked 9th from top and 38th from bottom. How many students took test?', '46', '45', '47', '48', 'Step 1: 9 + 38 - 1 = 46.'),
        make_q('m10-q18', 'Logical', 'Intermediate', 'Animal Syllogism: Statements: 1. All cats are animals. 2. Some animals are wild. Conclusions: I. Some wild are animals. II. All cats are wild.', 'Only I follows', 'Only II follows', 'Both follow', 'Neither follows', 'Step 1: Animals overlap with wild => Some wild are animals (I follows).'),
        make_q('m10-q19', 'Logical', 'Intermediate', 'Corporate Wellness Policy: Statement: "The company will provide health insurance to all employees." Assumption I: Employees appreciate healthcare benefits. Assumption II: Company has financial capability.', 'Both I and II are implicit', 'Only I is implicit', 'Only II is implicit', 'Neither is implicit', 'Step 1: Corporate benefits assume positive employee utility (I) and budget feasibility (II).'),
        make_q('m10-q20', 'Logical', 'Intermediate', 'If "RED" = 27 and "BLUE" = 40, what is "GREEN" in sum of positions?', '49', '45', '52', '55', 'Step 1: G(7)+R(18)+E(5)+E(5)+N(14) = 49.'),
        make_q('m10-q21', 'Logical', 'Intermediate', 'Eight persons sit around circle facing center. P is opposite Q. R is right of P. Who is left of Q?', 'Person opposite R', 'R', 'P', 'Cannot be determined', 'Step 1: Symmetrical circular geometry directly matches opposite adjacent positions.'),
        make_q('m10-q22', 'Logical', 'Intermediate', 'Calendar Cycle: How many leap years are there in 400 consecutive years?', '97', '100', '96', '98', 'Step 1: 100 - 3 (century years not divisible by 400) = 97 leap years.'),
        # Verbal (23-32)
        make_q('m10-q23', 'Verbal', 'Intermediate', 'Select synonym for "CANDOR":', 'Frankness', 'Dishonesty', 'Guile', 'Secrecy', 'Step 1: "Candor" means openness and honest expression; synonym is "Frankness".'),
        make_q('m10-q24', 'Verbal', 'Intermediate', 'Choose antonym for "SUPERFICIAL":', 'Profound', 'Shallow', 'External', 'Casual', 'Step 1: "Superficial" means shallow; opposite is "Profound" (deep/thorough).'),
        make_q('m10-q25', 'Verbal', 'Intermediate', 'Spot the concord error: "The data shows that (A) / either of the options (B) / are acceptable. (C) / No error (D)"', 'C', 'A', 'B', 'D', 'Step 1: "Either of" takes singular verb "is acceptable". Error in C.'),
        make_q('m10-q26', 'Verbal', 'Intermediate', 'Fill in the blank with idiom preposition: "She is accustomed _____ working in high-velocity agile sprints."', 'to', 'for', 'with', 'in', 'Step 1: "Accustomed to [doing something]".'),
        make_q('m10-q27', 'Verbal', 'Intermediate', 'Spelling Drill 10: Choose the correctly spelled word for a graded ranking system:', 'Hierarchy', 'Heirarchy', 'Hierarcy', 'Heirarcy', 'Step 1: Correct spelling is HIERARCHY.'),
        make_q('m10-q28', 'Verbal', 'Intermediate', 'What does the health idiom "Under the weather" mean?', 'Feeling slightly sick or unwell', 'Experiencing a storm', 'Being outside in rain', 'Under investigation', 'Step 1: "Under the weather" means feeling ill.'),
        make_q('m10-q29', 'Verbal', 'Intermediate', 'Fill in the blank with temporal pair: "Hardly had the build finished _____ the automated tests began."', 'when', 'than', 'then', 'so', 'Step 1: "Hardly... when".'),
        make_q('m10-q30', 'Verbal', 'Intermediate', 'Convert to Passive Voice: "The director approved the budget."', 'The budget was approved by the director.', 'The budget were approved by the director.', 'The budget had approved by the director.', 'The budget is approved by the director.', 'Step 1: "was approved".'),
        make_q('m10-q31', 'Verbal', 'Intermediate', 'Rearrange: P: automated continuous delivery, Q: reduces release risk, R: by deploying smaller batches, S: frequently to staging.', 'P - Q - R - S', 'Q - P - R - S', 'S - P - Q - R', 'R - P - Q - S', 'Step 1: "Automated continuous delivery reduces release risk by deploying smaller batches frequently to staging." (P-Q-R-S).'),
        make_q('m10-q32', 'Verbal', 'Intermediate', 'Word Pairs Analogy: Lucid : Obscure :: Arduous : ?', 'Effortless', 'Difficult', 'Strenuous', 'Demanding', 'Step 1: Lucid is opposite of Obscure; Arduous (strenuous) is opposite of Effortless.'),
        # Non-Verbal (33-36)
        make_q('m10-q33', 'NonVerbal', 'Intermediate', 'A regular octagon has how many diagonals?', '20', '16', '24', '28', 'Step 1: Formula = n(n-3)/2 = 8*(5)/2 = 20 diagonals.'),
        make_q('m10-q34', 'NonVerbal', 'Intermediate', 'How many squares are there on a 5x5 grid?', '55', '25', '50', '60', 'Step 1: 1^2 + 2^2 + 3^2 + 4^2 + 5^2 = 1 + 4 + 9 + 16 + 25 = 55 squares.'),
        make_q('m10-q35', 'NonVerbal', 'Intermediate', 'A 3cm painted cube is cut into 27 1cm unit cubes. How many have NO painted faces?', '1', '0', '6', '8', 'Step 1: (3 - 2)^3 = 1^3 = 1 unpainted center cube.'),
        make_q('m10-q36', 'NonVerbal', 'Intermediate', 'Angle between hands of clock at 10:20?', '170°', '160°', '180°', '150°', 'Step 1: |30(10) - 5.5(20)| = |300 - 110| = 190° (reflex). Interior angle = 360 - 190 = 170°.'),
        # DI (37-40)
        make_q('m10-q37', 'DI', 'Intermediate', 'Table Data: Server uptime: Jan=99.9%, Feb=99.5%, Mar=99.8%. What is average uptime?', '99.73%', '99.5%', '99.8%', '99.65%', 'Step 1: (99.9 + 99.5 + 99.8) / 3 = 299.2 / 3 = 99.73%.'),
        make_q('m10-q38', 'DI', 'Intermediate', 'Revenue in Q1 = $100k, Q2 = $150k. Growth %?', '50%', '40%', '60%', '75%', 'Step 1: (50 / 100) * 100 = 50%.'),
        make_q('m10-q39', 'DI', 'Intermediate', 'In a pie chart, Cloud Hosting accounts for 90°. What % of budget is this?', '25%', '20%', '30%', '35%', 'Step 1: (90 / 360) * 100 = 25%.'),
        make_q('m10-q40', 'DI', 'Intermediate', 'Line graph shows latency dropped from 200ms to 120ms. % drop?', '40%', '30%', '50%', '60%', 'Step 1: (80 / 200) * 100 = 40%.')
    ]
    tests.append({
        "id": "mock-test-10", "sectionId": "intermediate", "testNumber": 10,
        "title": "Applied Aptitude & Critical Thinking", "level": "Intermediate",
        "focus": "Logical Connectives & Word Problems", "difficulty": "Intermediate",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t10_qs
    })

    return tests
