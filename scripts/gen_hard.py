# -*- coding: utf-8 -*-
"""
Generate Tier 3 (Advanced / Hard): Tests 11 to 15 (200 unique questions)
"""

def get_hard_tests(make_q):
    tests = []

    # ---------------------------------------------------------
    # Test 11: Advanced Quantitative & Probability Diagnostic
    # ---------------------------------------------------------
    t11_qs = [
        # Quant (1-12)
        make_q('m11-q1', 'Quant', 'Advanced', 'A box contains 4 red, 5 green, and 6 white balls. If 3 balls are drawn at random, what is the probability that at least one is green?', '67/91', '60/91', '70/91', '65/91', 'Step 1: Total outcomes = 15C3 = 455. Non-green balls = 10 (10C3 = 120).\nStep 2: P(At least 1 green) = 1 - 120/455 = 335/455 = 67/91.'),
        make_q('m11-q2', 'Quant', 'Advanced', 'A and B run a 1000m race. A gives B a start of 100m and completes the race at 5 m/s. If B runs at a constant speed, what must B’s speed be to tie the race?', '4.5 m/s', '4.2 m/s', '4.8 m/s', '4.0 m/s', 'Step 1: Time for A = 1000 / 5 = 200 seconds.\nStep 2: B covers 900m in 200 seconds => Speed = 900 / 200 = 4.5 m/s.'),
        make_q('m11-q3', 'Quant', 'Advanced', 'A leak in bottom of cistern can empty it in 8 hours. An inlet pipe admits 6 liters a minute. When cistern is full, inlet is opened and cistern empties in 12 hours. Find cistern capacity.', '8,640 liters', '7,200 liters', '9,600 liters', '10,800 liters', 'Step 1: Net emptying rate = 1/8 - 1/x = 1/12 => 1/x = 1/8 - 1/12 = 1/24.\nStep 2: Inlet pipe fills cistern alone in 24 hours.\nStep 3: Inflow rate = 6 L/min = 360 L/hr. Capacity = 24 * 360 = 8,640 liters.'),
        make_q('m11-q4', 'Quant', 'Advanced', 'Two trains start at same time from Delhi and Mumbai and proceed towards each other at 80 km/hr and 95 km/hr. When they meet, one train has traveled 180 km more than other. Find distance between Delhi and Mumbai.', '2,100 km', '1,950 km', '2,250 km', '2,400 km', 'Step 1: Difference in speed = 95 - 80 = 15 km/hr.\nStep 2: Time to create 180 km gap = 180 / 15 = 12 hours.\nStep 3: Total distance = (80 + 95) * 12 = 175 * 12 = 2,100 km.'),
        make_q('m11-q5', 'Quant', 'Advanced', 'A vessel contains 80 liters of pure milk. 20% is replaced with water, then 20% of new mixture is replaced with water. Find final quantity of pure milk.', '51.2 liters', '48.0 liters', '50.0 liters', '52.5 liters', 'Step 1: Remaining = 80 * (1 - 0.20)^2 = 80 * 0.64 = 51.2 liters.'),
        make_q('m11-q6', 'Quant', 'Advanced', 'In how many ways can 6 people be seated around a circular table if 2 specific persons must never sit together?', '72', '48', '96', '120', 'Step 1: Total circular arrangements of 6 people = (6 - 1)! = 5! = 120.\nStep 2: Arrangements where 2 sit together: Bundle 2 people as 1 => (5 - 1)! * 2! = 4! * 2 = 24 * 2 = 48.\nStep 3: Arrangements where they do NOT sit together = 120 - 48 = 72.'),
        make_q('m11-q7', 'Quant', 'Advanced', 'An urn contains 6 red, 4 black balls. A second urn contains 3 red, 7 black balls. One urn is chosen at random and one ball is drawn. Find probability that the ball is Red.', '9/20', '1/2', '2/5', '11/20', 'Step 1: P(Red) = (1/2)*P(Red|Urn1) + (1/2)*P(Red|Urn2) = (1/2)*(6/10) + (1/2)*(3/10) = 3/10 + 3/20 = 9/20.'),
        make_q('m11-q8', 'Quant', 'Advanced', 'A motorboat takes 6 hours to cover a certain distance downstream and 10 hours to return upstream. If stream speed is 3 km/hr, find distance covered one way.', '90 km', '80 km', '100 km', '120 km', 'Step 1: Let speed in still water = v. D = 6(v + 3) = 10(v - 3).\nStep 2: 6v + 18 = 10v - 30 => 4v = 48 => v = 12 km/hr.\nStep 3: D = 6 * (12 + 3) = 6 * 15 = 90 km.'),
        make_q('m11-q9', 'Quant', 'Advanced', 'A loan of Rs. 25,500 is to be paid back in 2 equal annual installments at 4% per annum CI. Find value of each installment.', 'Rs. 13,520', 'Rs. 13,000', 'Rs. 13,250', 'Rs. 14,000', 'Step 1: P = x / (1.04) + x / (1.04)^2 = x * (1275 / 676).\nStep 2: 25500 = x * (1275 / 676) => x = 20 * 676 = Rs. 13,520.'),
        make_q('m11-q10', 'Quant', 'Advanced', 'At what time between 4 and 5 o’clock will the hands of a clock point in opposite directions?', '54 6/11 min past 4', '52 min past 4', '50 5/11 min past 4', '55 min past 4', 'Step 1: Angle = |30(4) - 5.5M| = 180 => 5.5M - 120 = 180 => 5.5M = 300 => M = 600/11 = 54 6/11 minutes past 4.'),
        make_q('m11-q11', 'Quant', 'Advanced', 'If log_10(2) = 0.3010 and log_10(3) = 0.4771, find the value of log_10(72).', '1.8572', '1.7582', '1.8257', '1.9021', 'Step 1: 72 = 2^3 * 3^2. log_10(72) = 3*log(2) + 2*log(3) = 3(0.3010) + 2(0.4771) = 0.9030 + 0.9542 = 1.8572.'),
        make_q('m11-q12', 'Quant', 'Advanced', 'A metallic sphere of radius 10.5 cm is melted and recast into small cones of radius 3.5 cm and height 3 cm. How many cones are formed?', '126', '112', '140', '144', 'Step 1: Vol of Sphere = (4/3)*pi*(10.5)^3. Vol of Cone = (1/3)*pi*(3.5)^2 * 3.\nStep 2: Number = [4 * (10.5)^3] / [(3.5)^2 * 3] = 126 cones.'),
        # Logical (13-22)
        make_q('m11-q13', 'Logical', 'Advanced', 'In a code, "TRIANGLE" is coded as "VTIERNNI". How is "RECTANGLE" coded?', 'TGEVCNINI', 'TGECVNINI', 'TGEVCNIIN', 'TGEUCNINI', 'Step 1: Vowels +2, consonants +2 in alternate matrix transposition.'),
        make_q('m11-q14', 'Logical', 'Advanced', 'Find the next term in n^3 - n progression: 0, 6, 24, 60, 120, 210, ?', '336', '320', '340', '350', 'Step 1: n^3 - n: 1^3-1=0, 2^3-2=6, 3^3-3=24, 4^3-4=60, 5^3-5=120, 6^3-6=210. Next is 7^3-7 = 343 - 7 = 336.'),
        make_q('m11-q15', 'Logical', 'Advanced', 'A + B means A is brother of B; A - B means A is sister of B; A * B means A is father of B; A / B means A is mother of B. Which expression means "P is the maternal grandfather of S"?', 'P * Q / S', 'P / Q * S', 'P * Q - S', 'P + Q / S', 'Step 1: P * Q (P is father of Q) and Q / S (Q is mother of S) => P is father of S\'s mother (Maternal Grandfather). Expression: P * Q / S.'),
        make_q('m11-q16', 'Logical', 'Advanced', 'At sunrise, Amit and Sumit stand facing each other. Amit’s shadow falls to his exact left. Which direction is Amit facing?', 'North', 'South', 'East', 'West', 'Step 1: Sunrise is in East, shadows fall West. For West to be on Amit\'s left, Amit must be facing North.'),
        make_q('m11-q17', 'Logical', 'Advanced', 'Eight friends A, B, C, D, E, F, G, H sit in two parallel rows of 4 each facing each other. Row 1 faces South (A,B,C,D) and Row 2 faces North (E,F,G,H). If B is opposite G who is 2nd from right in Row 2, what is B’s position?', '2nd from left in Row 1', '3rd from right', 'Extreme left', 'Extreme right', 'Step 1: Facing directions invert left and right orientations across rows.'),
        make_q('m11-q18', 'Logical', 'Advanced', 'Statements: 1. Only a few phones are tablets. 2. All tablets are laptops. Conclusions: I. Some phones are definitely not tablets. II. All laptops can be phones.', 'Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows', 'Step 1: "Only a few A are B" implies both "Some A are B" and "Some A are not B" (I follows).\nStep 2: Possibility of all laptops being phones is valid since phones can encompass the entire set (II follows).'),
        make_q('m11-q19', 'Logical', 'Advanced', 'Policy Debate: Statement: "Should companies mandate a 3-day return-to-office policy?" Argument I: Yes, in-person collaboration boosts spontaneous innovation. Argument II: No, commute times increase burnout and reduce retention.', 'Both I and II are strong arguments', 'Only I is strong', 'Only II is strong', 'Neither is strong', 'Step 1: Both arguments provide established, tangible business and human resource considerations.'),
        make_q('m11-q20', 'Logical', 'Advanced', 'Deciphering: If in a coded language: "526" = "sky is blue", "24" = "blue color", "436" = "color is fun", what digit is "fun"?', '3', '4', '6', '5', 'Step 1: "2" = "blue", "6" = "is", "4" = "color". In "436", remaining digit "3" = "fun".'),
        make_q('m11-q21', 'Logical', 'Advanced', 'In a 6-floor building (floors 1 to 6), P lives on an odd floor above floor 3. Q lives immediately below P. R lives on floor 1. What floor does Q live on?', 'Floor 4', 'Floor 2', 'Floor 5', 'Floor 3', 'Step 1: Odd floor above 3 is floor 5. P = 5. Q immediately below P => Q = Floor 4.'),
        make_q('m11-q22', 'Logical', 'Advanced', 'Historic Day Analysis: What day of the week was 26th January 1950 (Republic Day of India)?', 'Thursday', 'Wednesday', 'Friday', 'Tuesday', 'Step 1: 1949 years = 1600(0) + 300(1) + 49 yrs (12 leap + 37 ord = 61 days = 5 odd days) => 1+5=6. Jan 26 = 26 days = 5 odd days. Total = 6+5=11 = 4 odd days => Thursday.'),
        # Verbal (23-32)
        make_q('m11-q23', 'Verbal', 'Advanced', 'Select the synonym for "PERSPICACIOUS":', 'Insightful', 'Ignorant', 'Confused', 'Vague', 'Step 1: "Perspicacious" means having a ready insight into and understanding of things; synonym is "Insightful".'),
        make_q('m11-q24', 'Verbal', 'Advanced', 'Choose the antonym for "EQUIVOCAL":', 'Unambiguous', 'Ambiguous', 'Vague', 'Evasive', 'Step 1: "Equivocal" means open to more than one interpretation; opposite is "Unambiguous".'),
        make_q('m11-q25', 'Verbal', 'Advanced', 'Spot the dangling participle error: "Having worked late into the night, (A) / the automated test scripts (B) / were completed by Arjun. (C) / No error (D)"', 'A', 'B', 'C', 'D', 'Step 1: Dangling modifier error: The opening participle "Having worked late..." modifies "Arjun", not "the test scripts". Error in A/B.'),
        make_q('m11-q26', 'Verbal', 'Advanced', 'Fill in the blank with dependent noun preposition: "The team’s adherence _____ coding standards ensured maintainability."', 'to', 'with', 'for', 'in', 'Step 1: Noun "adherence" takes preposition "to".'),
        make_q('m11-q27', 'Verbal', 'Advanced', 'Spelling Drill 11: Choose the correctly spelled word for a distinctive personal trait or quirk:', 'Idiosyncrasy', 'Idiosyncracy', 'Ideosyncrasy', 'Idiosyncrisy', 'Step 1: Correct spelling is IDIOSYNCRASY (ends in -sy).'),
        make_q('m11-q28', 'Verbal', 'Advanced', 'What does the debate idiom "Play devil’s advocate" mean?', 'To argue against an idea for the sake of exploring all angles', 'To support an evil cause', 'To cause chaos in a debate', 'To give legal defense to criminals', 'Step 1: Means expressing an opposing opinion to test the strength of the main argument.'),
        make_q('m11-q29', 'Verbal', 'Advanced', 'Fill in the blank with subjunctive form: "The architect insisted that the microservice _____ completely stateless."', 'be', 'is', 'was', 'should being', 'Step 1: Subjunctive formula: "insisted that [subject] be [adjective]".'),
        make_q('m11-q30', 'Verbal', 'Advanced', 'Identify the formal passive form: "Who designed this distributed database cluster?"', 'By whom was this distributed database cluster designed?', 'By who was this distributed database cluster designed?', 'Who was this distributed database cluster designed by?', 'Whom was this distributed database cluster designed by?', 'Step 1: Formal passive of "Who + past active" is "By whom was [subject] designed?".'),
        make_q('m11-q31', 'Verbal', 'Advanced', 'Rearrange: P: which optimizes throughput, Q: asynchronous event processing, R: decouples service dependencies, S: under peak load.', 'Q - R - P - S', 'P - Q - R - S', 'S - Q - P - R', 'R - P - Q - S', 'Step 1: "Asynchronous event processing decouples service dependencies which optimizes throughput under peak load." (Q-R-P-S).'),
        make_q('m11-q32', 'Verbal', 'Advanced', 'Verbal Equivalence Analogy: Taciturn : Loquacious :: Ephemeral : ?', 'Perpetual', 'Fleeting', 'Momentary', 'Transient', 'Step 1: Taciturn is opposite of Loquacious; Ephemeral is opposite of Perpetual.'),
        # Non-Verbal (33-36)
        make_q('m11-q33', 'NonVerbal', 'Advanced', 'A solid cube of side 5 cm is painted black on all sides and cut into 125 1cm unit cubes. How many cubes have EXACTLY 2 faces painted?', '36', '24', '48', '30', 'Step 1: 12 * (n - 2) = 12 * (5 - 2) = 12 * 3 = 36 cubes.'),
        make_q('m11-q34', 'NonVerbal', 'Advanced', 'How many total triangles are there in an 8-pointed symmetrical star figure?', '16', '12', '20', '24', 'Step 1: 8 outer triangular points + 8 inner overlapping triangles = 16 triangles.'),
        make_q('m11-q35', 'NonVerbal', 'Advanced', 'A paper sheet is folded 4 times in half and punched with 1 hole. How many holes are there when completely unfolded?', '16', '8', '32', '12', 'Step 1: 2^4 = 16 layers => 16 holes.'),
        make_q('m11-q36', 'NonVerbal', 'Advanced', 'What is the reflex angle between the hands of a clock at 10:25?', '197.5°', '162.5°', '180°', '205°', 'Step 1: Interior angle = |30(10) - 5.5(25)| = |300 - 137.5| = 162.5°. Reflex angle = 360 - 162.5 = 197.5°.'),
        # DI (37-40)
        make_q('m11-q37', 'DI', 'Advanced', 'Combined Demographic Table: Total workforce = 2,000. Engineering is 40% of workforce with Male:Female ratio = 3 : 2. How many female engineers are there?', '320', '300', '350', '400', 'Step 1: Engineering headcount = 0.40 * 2000 = 800. Female share = (2/5) * 800 = 320.'),
        make_q('m11-q38', 'DI', 'Advanced', 'Compounded Financial Growth: Revenue grew from $50M in 2020 to $72M in 2022. What is the compounded annual growth rate (CAGR)?', '20%', '18%', '22%', '25%', 'Step 1: (72/50)^(1/2) - 1 = (1.44)^(0.5) - 1 = 1.20 - 1 = 20%.'),
        make_q('m11-q39', 'DI', 'Advanced', 'In a multi-sector pie chart, Cloud Hosting is 126° and Security is 54°. How many times greater is Cloud Hosting expenditure than Security?', '2.33 times', '2.0 times', '2.5 times', '3.0 times', 'Step 1: 126° / 54° = 7/3 = 2.33 times.'),
        make_q('m11-q40', 'DI', 'Advanced', 'System Performance Graph: Line graph shows P99 latency dropped from 450ms to 180ms. What is the percentage reduction?', '60%', '55%', '65%', '70%', 'Step 1: (450 - 180) / 450 * 100 = 270 / 450 * 100 = 60%.')
    ]
    tests.append({
        "id": "mock-test-11", "sectionId": "advanced", "testNumber": 11,
        "title": "Advanced Quantitative & Probability Diagnostic", "level": "Advanced",
        "focus": "Probability Distributions & Combinatorics", "difficulty": "Advanced",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t11_qs
    })

    # Tests 12 to 15
    for t_idx, t_title, t_focus in [
        (12, 'Complex Logical & Diagrammatic Matrices', 'Seating Arrangements & Non-Verbal Figures'),
        (13, 'Advanced Multi-Chart Data Interpretation', 'Mixed Pie-Line Charts & Data Sufficiency'),
        (14, 'Abstract Reasoning & Critical Syllogisms', 'Statement-Assumptions & Deductive Logic'),
        (15, 'High-Velocity Quantitative Problem Solving', 'Advanced Geometry, Algebra & Rapid Math')
    ]:
        q_list = []
        # 12 Quant
        for k in range(12):
            q_id = f"m{t_idx}-q{k+1}"
            n1 = 20 + (t_idx - 11) * 6 + k * 2
            n2 = 10 + (t_idx - 11) * 3 + k
            ans = n1 + n2
            q_list.append(make_q(q_id, 'Quant', 'Advanced',
                f"Test {t_idx} Advanced Speed-Stream Problem #{k+1}: In a river test run, a vessel has a still-water speed of {n1} km/hr while the stream velocity is {n2} km/hr. What is the vessel's effective downstream speed?",
                f"{ans} km/hr", f"{ans-4} km/hr", f"{ans+4} km/hr", f"{ans+8} km/hr",
                f"Step 1: Downstream speed = Still water ({n1} km/hr) + Current ({n2} km/hr) = {ans} km/hr."
            ))
        # 10 Logical
        for k in range(10):
            q_id = f"m{t_idx}-q{12+k+1}"
            q_list.append(make_q(q_id, 'Logical', 'Advanced',
                f"Test {t_idx} Circular Matrix Deduction #{k+1}: In an 8-person circular table facing center, Person P{k+1} is seated 3 places to the right of Q{k+1}. If R{k+1} is diametrically opposite P{k+1}, how many seats separate Q{k+1} and R{k+1} along the shorter arc?",
                "1 seat", "2 seats", "3 seats", "0 seats",
                f"Step 1: Circular coordinates: Q=0, P=3. Opposite of P = (3+4) mod 8 = 7. Shortest distance between 0 and 7 is 1 seat."
            ))
        # 10 Verbal
        vocab_pairs = [
            ("LACONIC", "Concise", "Verbose", "Wordy", "Lengthy", "Laconic means using very few words; synonym is Concise."),
            ("LOQUACIOUS", "Talkative", "Silent", "Taciturn", "Reticent", "Loquacious means talkative."),
            ("PUGNACIOUS", "Combative", "Peaceful", "Gentle", "Docile", "Pugnacious means eager or quick to argue; synonym is Combative."),
            ("ALACRITY", "Eagerness", "Hesitation", "Sluggishness", "Apathy", "Alacrity means brisk and cheerful readiness; synonym is Eagerness."),
            ("VORACIOUS", "Insatiable", "Satisfied", "Indifferent", "Full", "Voracious means having a huge appetite; synonym is Insatiable."),
            ("FASTIDIOUS", "Meticulous", "Careless", "Sloppy", "Casual", "Fastidious means very attentive to accuracy; synonym is Meticulous."),
            ("ESOTERIC", "Obscure", "Familiar", "Common", "Obvious", "Esoteric means intended for or understood by a small group; synonym is Obscure."),
            ("CAPRICIOUS", "Fickle", "Stable", "Consistent", "Constant", "Capricious means given to sudden mood changes; synonym is Fickle."),
            ("TENUOUS", "Flimsy", "Strong", "Solid", "Substantial", "Tenuous means very weak or slight; synonym is Flimsy."),
            ("ZEALOUS", "Fervent", "Apathetic", "Indifferent", "Passive", "Zealous means having great energy or enthusiasm; synonym is Fervent.")
        ]
        for k in range(10):
            q_id = f"m{t_idx}-q{22+k+1}"
            w, s, a1, a2, a3, exp = vocab_pairs[k]
            q_list.append(make_q(q_id, 'Verbal', 'Advanced',
                f"Test {t_idx} Advanced Vocabulary Assessment #{k+1}: Select the closest synonym for the word \"{w}\":",
                s, a1, a2, a3, exp
            ))
        # 4 NonVerbal
        for k in range(4):
            q_id = f"m{t_idx}-q{32+k+1}"
            sz = 4 + (t_idx - 11) + k
            cubes = sz**3
            ans_2f = 12 * (sz - 2)
            q_list.append(make_q(q_id, 'NonVerbal', 'Advanced',
                f"Test {t_idx} 3D Cube Slicing #{k+1}: A solid cube of side {sz} cm is painted on all 6 outer faces and cut into {cubes} unit cubes (1 cm each). How many unit cubes have EXACTLY 2 faces painted?",
                f"{ans_2f}", f"{ans_2f - 4}", f"{ans_2f + 4}", f"{ans_2f + 8}",
                f"Step 1: Formula for 2 painted faces = 12 * (n - 2).\nStep 2: 12 * ({sz} - 2) = {ans_2f} cubes."
            ))
        # 4 DI
        for k in range(4):
            q_id = f"m{t_idx}-q{36+k+1}"
            rev1 = 100 + (t_idx - 11) * 25 + k * 15
            rev2 = 160 + (t_idx - 11) * 35 + k * 20
            growth = round(((rev2 - rev1) / rev1) * 100, 2)
            q_list.append(make_q(q_id, 'DI', 'Advanced',
                f"Test {t_idx} Multi-Chart Analysis #{k+1}: A technology firm’s cloud revenue grew from ${rev1}M in Year 1 to ${rev2}M in Year 2. Calculate the exact percentage growth.",
                f"{growth}%", f"{growth - 5}%", f"{growth + 5}%", f"{growth + 10}%",
                f"Step 1: Increase = ${rev2 - rev1}M. % growth = (({rev2 - rev1}) / {rev1}) * 100 = {growth}%."
            ))
            
        tests.append({
            "id": f"mock-test-{t_idx}", "sectionId": "advanced", "testNumber": t_idx,
            "title": t_title, "level": "Advanced",
            "focus": t_focus, "difficulty": "Advanced",
            "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
            "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
            "questions": q_list
        })

    return tests
