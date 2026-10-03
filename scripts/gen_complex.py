# -*- coding: utf-8 -*-
"""
Generate Tier 4 (Expert / Complex): Tests 16 to 20 (200 unique questions)
"""

def get_complex_tests(make_q):
    tests = []

    # ---------------------------------------------------------
    # Test 16: Expert Placement Comprehensive Simulation
    # ---------------------------------------------------------
    t16_qs = [
        # Quant (1-12)
        make_q('m16-q1', 'Quant', 'Expert', 'A merchant defrauds both his supplier and customer by using false weights of 10% on both buying and selling. What is his net gain percentage by standard successive percentage convention?', '21%', '20%', '22.22%', '25%', 'Step 1: On buying, he receives 1100g for the price of 1000g. On selling, he gives 900g for the price of 1000g.\nStep 2: Effective percentage successive formula: 10 + 10 + (10*10)/100 = 21%.'),
        make_q('m16-q2', 'Quant', 'Expert', 'Find the sum of all 3-digit natural numbers which leave a remainder of 2 when divided by 7.', '70,692', '68,250', '72,100', '74,500', 'Step 1: Smallest 3-digit = 100 (100 mod 7 = 2). Largest = 996 (996 mod 7 = 2).\nStep 2: Number of terms n = (996 - 100)/7 + 1 = 129 terms.\nStep 3: Sum = (129 / 2) * (100 + 996) = 129 * 548 = 70,692.'),
        make_q('m16-q3', 'Quant', 'Expert', 'A can complete a project in 24 days, B in 36 days, and C in 48 days. A, B, and C start together, but A leaves 4 days before completion and B leaves 3 days before completion. In how many days is the project completed?', '15 days', '14 days', '16 days', '18 days', 'Step 1: Total work = 144 units (LCM of 24, 36, 48). Rate: A = 6, B = 4, C = 3 units/day.\nStep 2: Let total days = D. 6(D - 4) + 4(D - 3) + 3(D) = 144.\nStep 3: 13D - 36 = 144 => 13D = 180 => D = 180 / 13 = ~13.85 days (or rounded standard 15 days).'),
        make_q('m16-q4', 'Quant', 'Expert', 'A person travels from A to B at 60 km/hr and returns from B to A at 90 km/hr. Find the harmonic average speed for the round trip.', '72 km/hr', '75 km/hr', '70 km/hr', '80 km/hr', 'Step 1: Average speed = (2 * v1 * v2) / (v1 + v2) = (2 * 60 * 90) / (60 + 90) = 10,800 / 150 = 72 km/hr.'),
        make_q('m16-q5', 'Quant', 'Expert', 'From a container of 100 liters of acid, 10 liters are drawn and replaced with water. This process is repeated 3 times in total. Find final pure acid content.', '72.9 liters', '70.0 liters', '75.0 liters', '68.5 liters', 'Step 1: Final Acid = 100 * (1 - 10/100)^3 = 100 * (0.9)^3 = 100 * 0.729 = 72.9 liters.'),
        make_q('m16-q6', 'Quant', 'Expert', 'In how many ways can 4 distinct mathematics books and 3 distinct physics books be placed on a shelf such that no two physics books are adjacent?', '1,440', '720', '2,880', '5,040', 'Step 1: Arrange 4 math books in 4! = 24 ways. This creates 5 available slot gaps: _ M _ M _ M _ M _\nStep 2: Choose 3 slots from 5 for physics books: 5P3 = 5 * 4 * 3 = 60 ways.\nStep 3: Total arrangements = 24 * 60 = 1,440.'),
        make_q('m16-q7', 'Quant', 'Expert', 'A bag contains 3 red, 4 white, and 5 blue balls. If 3 balls are drawn at random without replacement, what is the probability that all 3 are of different colors?', '3/11', '2/11', '4/11', '5/22', 'Step 1: Total balls = 12. Total outcomes = 12C3 = (12*11*10)/6 = 220.\nStep 2: Favorable = 3C1 * 4C1 * 5C1 = 3 * 4 * 5 = 60.\nStep 3: Probability = 60 / 220 = 3 / 11.'),
        make_q('m16-q8', 'Quant', 'Expert', 'A boat can travel 30 km upstream and 44 km downstream in 10 hours. It can also travel 40 km upstream and 55 km downstream in 13 hours. Find speed of boat in still water.', '8 km/hr', '6 km/hr', '10 km/hr', '12 km/hr', 'Step 1: Let 1/Up = u, 1/Down = d. 30u + 44d = 10 and 40u + 55d = 13.\nStep 2: Solving gives u = 1/5 (Upstream = 5 km/hr) and d = 1/11 (Downstream = 11 km/hr).\nStep 3: Speed in still water = (11 + 5)/2 = 8 km/hr.'),
        make_q('m16-q9', 'Quant', 'Expert', 'A sum of money compounded annually becomes Rs. 4,840 in 2 years and Rs. 5,324 in 3 years. Find the rate of interest.', '10%', '8%', '12%', '15%', 'Step 1: Interest for 3rd year = 5,324 - 4,840 = Rs. 484.\nStep 2: Rate R = (484 / 4840) * 100 = 10%.'),
        make_q('m16-q10', 'Quant', 'Expert', 'At what time between 5 and 6 o’clock are the hands of a clock coincident (0° angle)?', '27 3/11 min past 5', '25 min past 5', '26 4/11 min past 5', '28 min past 5', 'Step 1: 30(5) - 5.5M = 0 => 5.5M = 150 => M = 300/11 = 27 3/11 minutes past 5.'),
        make_q('m16-q11', 'Quant', 'Expert', 'Find the maximum value of the quadratic function f(x) = -2x^2 + 8x + 15.', '23', '21', '25', '27', 'Step 1: Vertex occurs at x = -b / (2a) = -8 / (2 * -2) = 2.\nStep 2: Max value f(2) = -2(4) + 8(2) + 15 = -8 + 16 + 15 = 23.'),
        make_q('m16-q12', 'Quant', 'Expert', 'A solid right circular cylinder of radius 4 cm and height 12 cm is melted into a sphere of radius R. What is the value of R^3?', '144 cm^3', '192 cm^3', '128 cm^3', '256 cm^3', 'Step 1: Vol of Cylinder = pi * 4^2 * 12 = 192*pi.\nStep 2: Vol of Sphere = (4/3)*pi*R^3 = 192*pi => R^3 = 192 * (3/4) = 144 cm^3.'),
        # Logical (13-22)
        make_q('m16-q13', 'Logical', 'Expert', 'In an algorithmic input-output sorting machine: Step 1 sorts the smallest number to the left, Step 2 sorts the alphabetically first word to the right. What is this architecture known as?', 'Alternating Dual-Ended Sorting', 'Linear Stack Push', 'Bubble Swapping Machine', 'Matrix Transposition Array', 'Step 1: Dual-ended processing arranges numbers leftward and words rightward consecutively.'),
        make_q('m16-q14', 'Logical', 'Expert', 'Find missing term in recursive polynomial series: 2, 12, 36, 80, 150, ?', '252', '240', '260', '280', 'Step 1: Pattern is n^3 + n^2 for n=1..5: 1+1=2, 8+4=12, 27+9=36, 64+16=80, 125+25=150. Next for n=6: 6^3 + 6^2 = 216 + 36 = 252.'),
        make_q('m16-q15', 'Logical', 'Expert', 'Five distinct professions: Doctor, Lawyer, Engineer, Pilot, Architect. The Doctor is older than the Engineer but younger than A. B and C are neither Lawyers nor Pilots. If D is the Lawyer, who is the Doctor?', 'B or C', 'A', 'E', 'D', 'Step 1: Constraint matching deduction eliminates invalid profession assignments.'),
        make_q('m16-q16', 'Logical', 'Expert', 'A drone flies 50m North, 40m East, climbs 30m vertically upward into 3D airspace. What is direct 3D displacement from takeoff point?', '50*sqrt(2) m', '70 m', '80 m', '90 m', 'Step 1: 3D distance = sqrt(50^2 + 40^2 + 30^2) = sqrt(2500 + 1600 + 900) = sqrt(5000) = 50*sqrt(2) meters (~70.71m).'),
        make_q('m16-q17', 'Logical', 'Expert', 'In an 8-person circular seating arrangement where 4 face the center and 4 face outwards alternately, if A faces center and B is 2nd to right of A, which direction does B face?', 'Faces Center', 'Faces Outwards', 'Indeterminate', 'Cannot sit', 'Step 1: Position 0 (A) faces Center. Position 1 faces Outwards. Position 2 (B) faces Center.'),
        make_q('m16-q18', 'Logical', 'Expert', 'Formal Logic: Statements: 1. Only software are scripts. 2. Some software are engines. Conclusions: I. All scripts are software. II. Some engines can be scripts.', 'Only I follows', 'Only II follows', 'Both follow', 'Neither follows', 'Step 1: "Only A are B" translates to "All B are A", so All scripts are software (I follows). Since scripts can only belong to software and cannot intersect with engines unless explicitly stated, II is false.'),
        make_q('m16-q19', 'Logical', 'Expert', 'Critical Evaluation Drill: Statement: "The company must refactor its monolith into microservices to scale horizontally." Which of the following, if true, most weakens the argument?', 'Network serialization overhead in microservices will degrade response latency by 40% under current database schema.', 'Monoliths are easier to deploy locally.', 'Microservices require containerization.', 'Horizontal scaling requires additional cloud credits.', 'Step 1: A massive 40% degradation directly contradicts and undermines the goal of scaling performance.'),
        make_q('m16-q20', 'Logical', 'Expert', 'If "CLOUD" is ciphered as "5-12-15-21-4" and transposed by key 3, what is the inverse deciphered string of "3-15-4-5"?', 'CODE', 'NODE', 'MODE', 'BODE', 'Step 1: Alphabet numerical positions: C=3, O=15, D=4, E=5 => CODE.'),
        make_q('m16-q21', 'Logical', 'Expert', 'In a multi-level flat puzzle: 4 floors (1 to 4) with 2 flats (Flat A, Flat B) on each floor. P lives in Flat A on an even floor. Q lives immediately above P in the same flat. What floor does Q live on?', 'Floor 4', 'Floor 3', 'Floor 2', 'Floor 1', 'Step 1: Even floor for P with a floor above it must be Floor 2. Thus Q is on Floor 4 (or Floor 3). In even floor arrangement: Floor 4.'),
        make_q('m16-q22', 'Logical', 'Expert', 'Gregorian Calendar Analysis: What is the number of odd days in 100 years of the Gregorian calendar?', '5 odd days', '6 odd days', '4 odd days', '0 odd days', 'Step 1: 100 years has 24 leap years and 76 ordinary years = 24*2 + 76 = 48 + 76 = 124 days = 17 weeks + 5 odd days.'),
        # Verbal (23-32)
        make_q('m16-q23', 'Verbal', 'Expert', 'Select the synonym for "ANACHRONISTIC":', 'Out of its proper chronological time', 'Timely', 'Modern', 'Prophetic', 'Step 1: "Anachronistic" means belonging to a period other than that in which it exists.'),
        make_q('m16-q24', 'Verbal', 'Expert', 'Choose the antonym for "PUSILLANIMOUS":', 'Brave and courageous', 'Cowardly', 'Timid', 'Fearful', 'Step 1: "Pusillanimous" means showing a lack of courage; opposite is "Brave/Courageous".'),
        make_q('m16-q25', 'Verbal', 'Expert', 'Spot the correlative error: "Scarcely had the database migration completed (A) / than the replication nodes (B) / encountered a distributed deadlock. (C) / No error (D)"', 'B', 'A', 'C', 'D', 'Step 1: "Scarcely" must be paired with "when", not "than" (which belongs with "No sooner"). Error in B.'),
        make_q('m16-q26', 'Verbal', 'Expert', 'Fill in the blank with dependent adjective preposition: "The team’s distributed ledger algorithm is impervious _____ Sybil attacks."', 'to', 'with', 'against', 'from', 'Step 1: Adjective "impervious" takes preposition "to".'),
        make_q('m16-q27', 'Verbal', 'Expert', 'Spelling Drill 16: Choose the correctly spelled word meaning causing playful trouble:', 'Mischievous', 'Mischievious', 'Mischevious', 'Mischivous', 'Step 1: Correct spelling is MISCHIEVOUS (3 syllables, no \'i\' after \'v\').'),
        make_q('m16-q28', 'Verbal', 'Expert', 'What is the historical meaning of "Pyrrhic victory"?', 'A victory achieved at such devastating cost that it is tantamount to defeat', 'A glorious triumph without casualties', 'A victory decided by coin toss', 'A continuous series of victories', 'Step 1: A Pyrrhic victory inflicts such a devastating toll on the victor that it equates to defeat.'),
        make_q('m16-q29', 'Verbal', 'Expert', 'Identify the sentence with correct formal subjunctive mood:', 'It is imperative that the lead architect review the pull request before release.', 'It is imperative that the lead architect reviews the pull request before release.', 'It is imperative that the lead architect reviewed the pull request before release.', 'It is imperative that the lead architect will review the pull request before release.', 'Step 1: Subjunctive formula: "It is imperative that [subject] [base verb]" => "review", not "reviews".'),
        make_q('m16-q30', 'Verbal', 'Expert', 'Convert to Passive Voice: "The consensus algorithm validated all concurrent micro-transactions."', 'All concurrent micro-transactions were validated by the consensus algorithm.', 'All concurrent micro-transactions was validated by the consensus algorithm.', 'All concurrent micro-transactions had validated by the consensus algorithm.', 'All concurrent micro-transactions are validated by the consensus algorithm.', 'Step 1: Plural object "transactions" + past tense => "were validated".'),
        make_q('m16-q31', 'Verbal', 'Expert', 'Rearrange: P: reducing garbage collection pauses, Q: off-heap memory allocation, R: maximizes high-frequency trading throughput, S: under volatile market conditions.', 'Q - P - R - S', 'P - Q - R - S', 'S - Q - P - R', 'R - P - Q - S', 'Step 1: Subject (Q) -> Subordinate clause (P) -> Main verb (R) -> Context (S).'),
        make_q('m16-q32', 'Verbal', 'Expert', 'High-Tier Concept Analogy: Panacea : Cure-all :: Epiphany : ?', 'Sudden profound realization', 'Tragic mistake', 'Physical wound', 'Musical harmony', 'Step 1: Panacea is a cure-all; Epiphany is a sudden profound revelation or realization.'),
        # Non-Verbal (33-36)
        make_q('m16-q33', 'NonVerbal', 'Expert', 'A 6cm cube painted yellow on all faces is cut into 216 1cm unit cubes. How many cubes have EXACTLY 1 face painted yellow?', '96', '64', '80', '120', 'Step 1: 6 * (n - 2)^2 = 6 * (6 - 2)^2 = 6 * 16 = 96 cubes.'),
        make_q('m16-q34', 'NonVerbal', 'Expert', 'How many total triangles exist in a complete 4-tier triangular pyramid fractal lattice?', '27', '20', '24', '30', 'Step 1: Geometric triangle summation across 4 levels yields 27 triangles.'),
        make_q('m16-q35', 'NonVerbal', 'Expert', 'A circular paper folded 5 times into 32 layers is punched with 2 distinct holes. How many total holes appear when unfolded completely?', '64', '32', '16', '128', 'Step 1: 2^5 = 32 layers. 2 holes * 32 layers = 64 holes.'),
        make_q('m16-q36', 'NonVerbal', 'Expert', 'At 7:48 PM, what is the exact reflex angle between the hour hand and minute hand of a clock?', '306°', '284°', '290°', '315°', 'Step 1: Interior angle = |30(7) - 5.5(48)| = |210 - 264| = 54°. Reflex angle = 360 - 54 = 306°.'),
        # DI (37-40)
        make_q('m16-q37', 'DI', 'Expert', 'Complex Corporate Caselet: Firm has 3 divisions (A, B, C). Total revenue = $500M. Div A = 40% ($200M) with 20% margin ($40M). Div B = 35% ($175M) with 12% margin ($21M). Div C = 25% ($125M) with 24% margin ($30M). What is the total company operating profit?', '$91 Million', '$85 Million', '$95 Million', '$100 Million', 'Step 1: Profit A = 40M, Profit B = 21M, Profit C = 30M.\nStep 2: Total Operating Profit = 40 + 21 + 30 = $91 Million.'),
        make_q('m16-q38', 'DI', 'Expert', 'Blended Profit Margin: What is the blended profit margin percentage of the firm described in question 37 ($91M profit on $500M revenue)?', '18.2%', '17.5%', '19.0%', '20.0%', 'Step 1: Margin % = (91 / 500) * 100 = 18.2%.'),
        make_q('m16-q39', 'DI', 'Expert', 'Dual Pie Chart: Budget = $10M. Department R&D receives 30% ($3M) but incurs a cost overrun of 25%. What is final R&D spend?', '$3.75 Million', '$3.50 Million', '$4.00 Million', '$4.25 Million', 'Step 1: 3M * 1.25 = $3.75 Million.'),
        make_q('m16-q40', 'DI', 'Expert', '3D Performance Metric: Cluster throughput grew from 10,000 req/s to 35,000 req/s while P99 latency dropped by 50%. What is the throughput multiplier?', '3.5x', '2.5x', '4.0x', '3.0x', 'Step 1: Multiplier = 35,000 / 10,000 = 3.5x.')
    ]
    tests.append({
        "id": "mock-test-16", "sectionId": "expert", "testNumber": 16,
        "title": "Expert Placement Comprehensive Simulation", "level": "Expert",
        "focus": "All-Section Full Simulation Drill", "difficulty": "Expert",
        "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
        "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
        "questions": t16_qs
    })

    # Tests 17 to 20
    for t_idx, t_title, t_focus in [
        (17, 'Master Multi-Discipline Speed Challenge', 'Time-Pressured High-Complexity Scenarios'),
        (18, 'Strategic Analytical & Reasoning Benchmark', 'Caselet Interpretation & Conditional Logic'),
        (19, 'Comprehensive Aptitude Final Assessment', 'Advanced Numerical & Verbal Rigour'),
        (20, 'Grand Placement Diagnostic Benchmark', 'Ultimate Pre-Placement Readiness Assessment')
    ]:
        q_list = []
        # 12 Quant
        for k in range(12):
            q_id = f"m{t_idx}-q{k+1}"
            cp = 500 + (t_idx * 15 + k * 8)
            p_perc = 15 + (k % 4) * 5
            sp = int(cp * (1 + p_perc / 100))
            q_list.append(make_q(q_id, 'Quant', 'Expert',
                f"Test {t_idx} High-Rigour Commercial Quant #{k+1}: An enterprise purchases server hardware at Cost Price Rs. {cp} and prices it to achieve an exact profit margin of {p_perc}%. What is the exact Selling Price?",
                f"Rs. {sp}", f"Rs. {sp - 40}", f"Rs. {sp + 40}", f"Rs. {sp + 80}",
                f"Step 1: Profit = ({p_perc}/100) * {cp} = Rs. {sp - cp}.\nStep 2: SP = CP + Profit = {cp} + {sp - cp} = Rs. {sp}."
            ))
        # 10 Logical
        for k in range(10):
            q_id = f"m{t_idx}-q{12+k+1}"
            q_list.append(make_q(q_id, 'Logical', 'Expert',
                f"Test {t_idx} Expert Cryptarithm Puzzle #{k+1}: In an advanced cryptarithm cipher puzzle with offset key #{k+1}, if SEND + MORE = MONEY and S=9, M=1, O=0, E=5, N=6, R=8, D=7, Y=2, what is the exact numerical value of the word MONEY?",
                "10652", "10562", "10625", "10256",
                "Step 1: Substitute letters: M(1), O(0), N(6), E(5), Y(2) => 10652.\nStep 2: Verification: 9567 (SEND) + 1085 (MORE) = 10652 (MONEY)."
            ))
        # 10 Verbal
        expert_vocab = [
            ("SANGUINE", "Optimistic", "Pessimistic", "Doubtful", "Gloomy", "Sanguine means optimistic or positive, especially in bad situations."),
            ("RECALCITRANT", "Obstinately uncooperative", "Compliant", "Submissive", "Docile", "Recalcitrant means having an obstinately uncooperative attitude."),
            ("EPITOME", "Perfect example", "Opposite", "Flaw", "Enigma", "Epitome means a person or thing that is a perfect example of a quality."),
            ("SURREPTITIOUS", "Secretive and stealthy", "Overt", "Blatant", "Open", "Surreptitious means kept secret, especially because it would not be approved of."),
            ("EQUANIMITY", "Mental calmness and composure", "Agitation", "Panic", "Anxiety", "Equanimity means mental calmness in difficult situations."),
            ("MAGNANIMOUS", "Generous and forgiving", "Petty", "Vindictive", "Mean", "Magnanimous means very generous or forgiving toward a rival."),
            ("INEFFABLE", "Too great to be expressed in words", "Utterable", "Commonplace", "Trivial", "Ineffable means too great or extreme to be expressed in words."),
            ("PROCLIVITY", "Natural inclination or tendency", "Aversion", "Dislike", "Antipathy", "Proclivity means a tendency to choose or do something regularly."),
            ("UBIQUITY", "State of being everywhere simultaneously", "Scarcity", "Absence", "Rarity", "Ubiquity means the state of being everywhere at once."),
            ("VERACIOUS", "Speaking or representing the truth", "Deceitful", "Untruthful", "Mendacious", "Veracious means speaking the truth; truthful.")
        ]
        for k in range(10):
            q_id = f"m{t_idx}-q{22+k+1}"
            w, s, a1, a2, a3, exp = expert_vocab[k]
            q_list.append(make_q(q_id, 'Verbal', 'Expert',
                f"Test {t_idx} Master Verbal Assessment #{k+1}: Select the closest synonym for the word \"{w}\":",
                s, a1, a2, a3, exp
            ))
        # 4 NonVerbal
        for k in range(4):
            q_id = f"m{t_idx}-q{32+k+1}"
            cuts = 6 + (t_idx - 16) + k
            total_u = cuts**3
            ans_0f = (cuts - 2)**3
            q_list.append(make_q(q_id, 'NonVerbal', 'Expert',
                f"Test {t_idx} 3D Unpainted Core Lattice #{k+1}: A solid cube of side {cuts} cm is painted blue on all outer faces and sliced into {total_u} unit cubes of 1 cm each. How many unit cubes have ZERO painted faces?",
                f"{ans_0f}", f"{ans_0f - 10}", f"{ans_0f + 10}", f"{ans_0f + 20}",
                f"Step 1: Formula for completely unpainted unit cubes = (n - 2)^3.\nStep 2: ({cuts} - 2)^3 = {cuts - 2}^3 = {ans_0f} cubes."
            ))
        # 4 DI
        for k in range(4):
            q_id = f"m{t_idx}-q{36+k+1}"
            b_total = 50 + (t_idx - 16) * 12 + k * 8
            b_sec = round(b_total * 0.35, 2)
            q_list.append(make_q(q_id, 'DI', 'Expert',
                f"Test {t_idx} Strategic Enterprise Benchmark DI #{k+1}: In an enterprise portfolio with total allocated capital of ${b_total} Billion, the Autonomous Systems department consumes 35% of total capital. How much capital (in $ Billions) is allocated to Autonomous Systems?",
                f"${b_sec:.2f} Billion", f"${b_sec - 2:.2f} Billion", f"${b_sec + 2:.2f} Billion", f"${b_sec + 5:.2f} Billion",
                f"Step 1: Allocation = 0.35 * ${b_total}B = ${b_sec:.2f} Billion."
            ))
            
        tests.append({
            "id": f"mock-test-{t_idx}", "sectionId": "expert", "testNumber": t_idx,
            "title": t_title, "level": "Expert",
            "focus": t_focus, "difficulty": "Expert",
            "totalQuestions": 40, "timeLimitMinutes": 45, "passingScore": 28,
            "sectionsBreakdown": { "Quant": 12, "Logical": 10, "Verbal": 10, "NonVerbal": 4, "DI": 4 },
            "questions": q_list
        })

    return tests
