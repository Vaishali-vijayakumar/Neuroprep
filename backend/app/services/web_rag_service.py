"""
Google Search Engine Replication Engine for Technical & Placement Topics
Replicates Google's Organic Search Engine:
- Organic Search Results with Breadcrumb URLs & Meta Snippets
- Knowledge Graph Overview Panel
- "People Also Ask" (PAA) Interactive Accordion
- Related Searches & Search Refinement Chips
- Filter Categories (All, Documentation, Interview Q&A, Practice Problems)
"""

import time
import urllib.parse
import re
from typing import Dict, Any, List, Optional

class GoogleSearchEngineReplication:
    @staticmethod
    def search(query: str, category_filter: str = "All", top_k: int = 6) -> Dict[str, Any]:
        start_time = time.time()
        clean_q = (query or "").strip()
        if not clean_q:
            clean_q = "Placement Technical Concepts"
        
        q_lower = clean_q.lower()
        encoded_q = urllib.parse.quote(clean_q)

        # ── 1. KNOWLEDGE GRAPH GENERATOR ──
        knowledge_graph = GoogleSearchEngineReplication._generate_knowledge_graph(clean_q, q_lower)

        # ── 2. PEOPLE ALSO ASK (PAA) GENERATOR ──
        people_also_ask = GoogleSearchEngineReplication._generate_paa(clean_q, q_lower)

        # ── 3. ORGANIC WEB RESULTS ──
        organic_results = GoogleSearchEngineReplication._generate_organic_results(clean_q, q_lower, encoded_q)

        # ── 4. RELATED SEARCHES ──
        related_searches = GoogleSearchEngineReplication._generate_related_searches(clean_q, q_lower)

        # Filter by category if specified
        if category_filter and category_filter != "All":
            filtered = [r for r in organic_results if r.get("filter_tag", "").lower() == category_filter.lower()]
            if filtered:
                organic_results = filtered

        search_time = round(time.time() - start_time, 2)
        total_estimated = f"About {len(organic_results) * 382000:,} results"

        return {
            "query": clean_q,
            "search_time_seconds": search_time,
            "total_estimated_results": total_estimated,
            "filter_applied": category_filter,
            "knowledge_graph": knowledge_graph,
            "people_also_ask": people_also_ask,
            "organic_results": organic_results[:top_k],
            "recommendations": organic_results[:top_k],
            "websites": organic_results[:top_k],
            "related_searches": related_searches
        }

    @staticmethod
    def _generate_knowledge_graph(clean_q: str, q_lower: str) -> Dict[str, Any]:
        if "deadlock" in q_lower:
            return {
                "title": "Deadlock",
                "subtitle": "Computer Science & Operating Systems Concept",
                "summary": "A deadlock is a state in concurrent computing where two or more processes are permanently blocked because each process holds a resource and waits for another resource held by another process in a circular chain.",
                "key_facts": [
                    {"label": "Necessary Conditions", "value": "Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait"},
                    {"label": "Prevention Algorithm", "value": "Banker's Algorithm (Dijkstra)"},
                    {"label": "Detection Method", "value": "Resource Allocation Graph (RAG) Cycle Detection"},
                    {"label": "Subject Area", "value": "Operating Systems / Concurrency"}
                ],
                "official_url": "https://www.geeksforgeeks.org/introduction-of-deadlock-in-operating-system/",
                "official_site": "GeeksforGeeks OS Architecture"
            }
        elif "binary search" in q_lower:
            return {
                "title": "Binary Search Algorithm",
                "subtitle": "Search Algorithm • Time Complexity: O(log N)",
                "summary": "Binary search is an efficient divide-and-conquer algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item.",
                "key_facts": [
                    {"label": "Time Complexity", "value": "Best: O(1), Average/Worst: O(log N)"},
                    {"label": "Space Complexity", "value": "Iterative: O(1), Recursive: O(log N)"},
                    {"label": "Prerequisite", "value": "Array/Data must be sorted (Monotonic)"},
                    {"label": "Mid Calculation", "value": "mid = low + (high - low) / 2"}
                ],
                "official_url": "https://leetcode.com/problems/binary-search/",
                "official_site": "LeetCode Algorithmic Standards"
            }
        elif "java" in q_lower or "oop" in q_lower:
            return {
                "title": "Object-Oriented Programming (Java)",
                "subtitle": "Programming Paradigm & Architecture",
                "summary": "Object-Oriented Programming (OOP) is a programming paradigm based on the concept of 'objects', which contain data in the form of fields and code in the form of procedures. Java enforces pure class-based OOP.",
                "key_facts": [
                    {"label": "4 Pillars", "value": "Encapsulation, Abstraction, Inheritance, Polymorphism"},
                    {"label": "Memory Layout", "value": "Objects on Heap, References on Stack"},
                    {"label": "Multiple Inheritance", "value": "Achieved via Interfaces to avoid Diamond Problem"},
                    {"label": "Execution Engine", "value": "Java Virtual Machine (JVM)"}
                ],
                "official_url": "https://www.javatpoint.com/java-oops-concepts",
                "official_site": "JavaTpoint Core Java Specification"
            }
        elif "normaliz" in q_lower or "dbms" in q_lower or "sql" in q_lower:
            return {
                "title": "Database Normalization",
                "subtitle": "Relational Database Management Systems (RDBMS)",
                "summary": "Database normalization is the process of organizing data in a database to reduce data redundancy and improve data integrity by decomposing tables according to normal forms.",
                "key_facts": [
                    {"label": "Normal Forms", "value": "1NF (Atomic), 2NF (No partial dependency), 3NF (No transitive dependency), BCNF"},
                    {"label": "Primary Objective", "value": "Eliminate Insertion, Update, and Deletion Anomalies"},
                    {"label": "Decomposition Criteria", "value": "Lossless Join + Dependency Preservation"},
                    {"label": "Field", "value": "DBMS & Enterprise Data Architecture"}
                ],
                "official_url": "https://www.geeksforgeeks.org/database-normalization-normal-forms/",
                "official_site": "GeeksforGeeks DBMS Editorial"
            }
        elif any(k in q_lower for k in ["probab", "quant", "aptitude", "time and work"]):
            return {
                "title": f"{clean_q}",
                "subtitle": "Quantitative Aptitude & Placement Examination",
                "summary": f"Standard quantitative and problem-solving framework used across campus placement examinations and technical screening rounds for {clean_q}.",
                "key_facts": [
                    {"label": "Primary Focus", "value": "Speed math shortcuts & analytical formulas"},
                    {"label": "Exam Weightage", "value": "High in TCS, Infosys, Wipro, Accenture & Cognizant rounds"},
                    {"label": "Standard Practice Time", "value": "Under 60 seconds per question"},
                    {"label": "Category", "value": "Quantitative Aptitude & Placement Reasoning"}
                ],
                "official_url": f"https://www.indiabix.com/search.php?q={urllib.parse.quote(clean_q)}",
                "official_site": "IndiaBIX Placement Standards"
            }
        else:
            return {
                "title": clean_q,
                "subtitle": "Computer Science & Placement Architecture Reference",
                "summary": f"Core technical mechanisms, architectural invariants, runtime trade-offs, and placement interview solutions for {clean_q}.",
                "key_facts": [
                    {"label": "Topic Domain", "value": "Computer Science & Engineering"},
                    {"label": "Interview Importance", "value": "High Probability in SDE & Technical Rounds"},
                    {"label": "Standard Reference", "value": "GeeksforGeeks, Scaler & LeetCode"},
                    {"label": "Target Level", "value": "Campus Placement & SDE-1 Candidates"}
                ],
                "official_url": f"https://www.geeksforgeeks.org/search/?q={urllib.parse.quote(clean_q)}",
                "official_site": "GeeksforGeeks Placement Reference"
            }

    @staticmethod
    def _generate_paa(clean_q: str, q_lower: str) -> List[Dict[str, str]]:
        if "deadlock" in q_lower:
            return [
                {
                    "question": "What are the 4 necessary conditions for deadlock in OS?",
                    "answer": "The four Coffman conditions are: 1. Mutual Exclusion (non-shareable resources), 2. Hold and Wait (processes hold resources while requesting others), 3. No Preemption (resources cannot be forcibly taken), and 4. Circular Wait (a circular chain of waiting processes exists)."
                },
                {
                    "question": "What is the difference between Deadlock and Starvation?",
                    "answer": "Deadlock is a circular standstill where no process can proceed, whereas Starvation is indefinite delay where a low-priority process waits forever because higher-priority processes keep acquiring the resource."
                },
                {
                    "question": "How does Banker's Algorithm avoid deadlock?",
                    "answer": "Banker's Algorithm checks before granting a resource whether the system will remain in a 'Safe State' (a sequence of processes where all can complete with remaining available resources). If unsafe, the request is denied."
                }
            ]
        elif "binary search" in q_lower:
            return [
                {
                    "question": "Why is Binary Search time complexity O(log n)?",
                    "answer": "Because the search space is divided by 2 in each comparison step: N, N/2, N/4, ..., 1. Thus, N / (2^k) = 1 => 2^k = N => k = log2(N) steps."
                },
                {
                    "question": "Why do we use mid = low + (high - low) / 2 instead of (low + high) / 2?",
                    "answer": "In languages like Java, C, and C++, (low + high) can exceed the maximum 32-bit integer value (2,147,483,647) and cause an integer overflow bug resulting in a negative number."
                },
                {
                    "question": "What is Binary Search on Answer Space?",
                    "answer": "When the validation function f(x) is monotonic (e.g. False...False, True...True), binary search can be applied on the range of possible answers to find the minimum/maximum threshold in O(log(range) * check_time)."
                }
            ]
        elif "java" in q_lower or "oop" in q_lower:
            return [
                {
                    "question": "Why does Java not support multiple inheritance with classes?",
                    "answer": "To prevent the Diamond Problem ambiguity, where two parent classes have a method with the same signature and the compiler cannot determine which method to inherit. Java resolves this cleanly via Interfaces."
                },
                {
                    "question": "What is the difference between Abstraction and Encapsulation?",
                    "answer": "Encapsulation is data-hiding (binding data and methods together with private variables and public getters/setters). Abstraction is detail-hiding (showing only essential functionality via interfaces/abstract classes)."
                }
            ]
        else:
            return [
                {
                    "question": f"What are the core concepts of {clean_q}?",
                    "answer": f"{clean_q} involves fundamental architectural rules, data modeling guarantees, algorithmic time complexities, and edge case handling frequently evaluated in campus placement interviews."
                },
                {
                    "question": f"How is {clean_q} asked in placement interviews?",
                    "answer": f"Interviewers evaluate conceptual clarity, dry-run code traces, time/space complexity optimizations, and real-world system design trade-offs regarding {clean_q}."
                }
            ]

    @staticmethod
    def _generate_organic_results(clean_q: str, q_lower: str, encoded_q: str) -> List[Dict[str, Any]]:
        # Check topic category
        is_apt = any(k in q_lower for k in ["aptitude", "quant", "probability", "time and work", "percentage", "blood relation", "syllogism", "profit loss", "reasoning"])
        is_java_oop = any(k in q_lower for k in ["java", "oop", "oops", "inheritance", "polymorphism", "encapsulation", "class", "object"])
        is_dbms = any(k in q_lower for k in ["dbms", "sql", "normalization", "bcnf", "acid", "database", "joins"])
        is_os = any(k in q_lower for k in ["os", "operating system", "deadlock", "paging", "semaphore", "process", "thread", "scheduling"])
        is_web = any(k in q_lower for k in ["html", "css", "javascript", "react", "dom", "web"])

        results = []

        if is_apt:
            results = [
                {
                    "id": "res-apt-1",
                    "title": f"{clean_q} — Quantitative Aptitude Questions, Formulas & Solutions",
                    "url": f"https://www.indiabix.com/search.php?q={encoded_q}",
                    "domain": "indiabix.com",
                    "breadcrumb": f"https://www.indiabix.com > aptitude > {clean_q.lower().replace(' ', '-')}",
                    "website": "IndiaBIX",
                    "reason": "Best for: Formulas + Placement MCQs",
                    "learning_level": "Placement",
                    "filter_tag": "Aptitude",
                    "quality_score": 4.98,
                    "verified": True,
                    "description": f"Comprehensive collection of {clean_q} aptitude questions with standard formulas, shortcut speed-math tricks, step-by-step solved explanations, and mock test papers for campus placements.",
                    "preview_content": f"Standard shortcut formulas and company placement test patterns for {clean_q}."
                },
                {
                    "id": "res-apt-2",
                    "title": f"{clean_q} — Concepts, Shortcuts & Solved Examples for Placements",
                    "url": f"https://www.geeksforgeeks.org/aptitude-questions-and-answers/?q={encoded_q}",
                    "domain": "geeksforgeeks.org",
                    "breadcrumb": f"https://www.geeksforgeeks.org > aptitude > {clean_q.lower().replace(' ', '-')}",
                    "website": "GeeksforGeeks",
                    "reason": "Best for: Speed Math Tricks & Theory",
                    "learning_level": "Interview",
                    "filter_tag": "Tutorials",
                    "quality_score": 4.92,
                    "verified": True,
                    "description": f"Learn foundational principles, speed calculation shortcuts, and high-frequency company interview aptitude questions for {clean_q}.",
                    "preview_content": f"Speed calculation shortcuts and company placement aptitude sets for {clean_q}."
                },
                {
                    "id": "res-apt-3",
                    "title": f"{clean_q} — IT Company Placement Questions & Exam Patterns",
                    "url": f"https://prepinsta.com/?s={encoded_q}",
                    "domain": "prepinsta.com",
                    "breadcrumb": f"https://www.prepinsta.com > placements > {clean_q.lower().replace(' ', '-')}",
                    "website": "PrepInsta",
                    "reason": "Best for: TCS, Infosys & Wipro Patterns",
                    "learning_level": "Placement",
                    "filter_tag": "Interview Q&A",
                    "quality_score": 4.88,
                    "verified": True,
                    "description": f"Targeted placement questions asked by TCS NQT, Infosys, Wipro, Accenture, and Cognizant with previous year exam archives on {clean_q}.",
                    "preview_content": f"Company-specific assessment variations and tier-1 IT hiring round questions on {clean_q}."
                },
                {
                    "id": "res-apt-4",
                    "title": f"{clean_q} — Online Practice Tests & Timed Mock Quizzes",
                    "url": f"https://testbook.com/search?q={encoded_q}",
                    "domain": "testbook.com",
                    "breadcrumb": f"https://testbook.com > test-series > {clean_q.lower().replace(' ', '-')}",
                    "website": "Testbook",
                    "reason": "Best for: Timed Mock Sets",
                    "learning_level": "Beginner",
                    "filter_tag": "Practice Problems",
                    "quality_score": 4.85,
                    "verified": True,
                    "description": f"Timed mock quizzes, accuracy percentile ranking, and instant solution steps for {clean_q}.",
                    "preview_content": f"Timed placement mock tests and accuracy breakdown for {clean_q}."
                }
            ]
        elif is_java_oop:
            results = [
                {
                    "id": "res-java-1",
                    "title": f"{clean_q} — Core Java OOP Concepts with Illustrated Examples",
                    "url": f"https://www.javatpoint.com/search.php?q={encoded_q}",
                    "domain": "javatpoint.com",
                    "breadcrumb": f"https://www.javatpoint.com > java-tutorial > {clean_q.lower().replace(' ', '-')}",
                    "website": "JavaTpoint",
                    "reason": "Best for: Java & OOP Foundations",
                    "learning_level": "Beginner",
                    "filter_tag": "Documentation",
                    "quality_score": 4.95,
                    "verified": True,
                    "description": f"Complete guide to {clean_q} in Java covering Encapsulation, Abstraction, Inheritance, Polymorphism, JVM memory layout, and interview viva questions.",
                    "preview_content": f"Core Java OOP principles, memory allocation, and class/object lifecycle for {clean_q}."
                },
                {
                    "id": "res-java-2",
                    "title": f"{clean_q} — GeeksforGeeks Java & OOP Deep Dive",
                    "url": f"https://www.geeksforgeeks.org/search/?q={encoded_q}",
                    "domain": "geeksforgeeks.org",
                    "breadcrumb": f"https://www.geeksforgeeks.org > java > {clean_q.lower().replace(' ', '-')}",
                    "website": "GeeksforGeeks",
                    "reason": "Best for: Concepts + Interviews",
                    "learning_level": "Interview",
                    "filter_tag": "Tutorials",
                    "quality_score": 4.95,
                    "verified": True,
                    "description": f"Step-by-step technical tutorial with execution traces, real-world analogies, JVM internals, and interview problem sets on {clean_q}.",
                    "preview_content": f"Detailed Java code walkthroughs, design pattern implementations, and interview viva notes for {clean_q}."
                },
                {
                    "id": "res-java-3",
                    "title": f"{clean_q} — Scaler Topics Java & System Design Interview Notes",
                    "url": f"https://www.scaler.com/topics/search/?q={encoded_q}",
                    "domain": "scaler.com/topics",
                    "breadcrumb": f"https://www.scaler.com > topics > java > {clean_q.lower().replace(' ', '-')}",
                    "website": "Scaler Topics",
                    "reason": "Best for: Visual Traces & Placement Q&A",
                    "learning_level": "Placement",
                    "filter_tag": "Interview Q&A",
                    "quality_score": 4.90,
                    "verified": True,
                    "description": f"In-depth analysis of {clean_q} with architectural diagrams, interface vs abstract class design trade-offs, and placement interview questions.",
                    "preview_content": f"Visual object diagrams, design patterns, and high-probability interview questions for {clean_q}."
                },
                {
                    "id": "res-java-4",
                    "title": f"{clean_q} — Programiz Illustrated Java Walkthroughs",
                    "url": f"https://www.programiz.com/search/{encoded_q}",
                    "domain": "programiz.com",
                    "breadcrumb": f"https://www.programiz.com > java-programming > {clean_q.lower().replace(' ', '-')}",
                    "website": "Programiz",
                    "reason": "Best for: Beginners & Clean Syntax",
                    "learning_level": "Beginner",
                    "filter_tag": "Tutorials",
                    "quality_score": 4.85,
                    "verified": True,
                    "description": f"Beginner-friendly clean Java code examples, visual execution outputs, and syntax references for {clean_q}.",
                    "preview_content": f"Step-by-step code demonstrations and memory execution diagrams for {clean_q}."
                }
            ]
        elif is_os or "deadlock" in q_lower:
            results = [
                {
                    "id": "res-os-1",
                    "title": f"{clean_q} — Complete Operating Systems Reference & Interview Notes",
                    "url": f"https://www.geeksforgeeks.org/search/?q={encoded_q}",
                    "domain": "geeksforgeeks.org",
                    "breadcrumb": f"https://www.geeksforgeeks.org > operating-systems > {clean_q.lower().replace(' ', '-')}",
                    "website": "GeeksforGeeks",
                    "reason": "Best for: Concepts + Interviews",
                    "learning_level": "Interview",
                    "filter_tag": "Tutorials",
                    "quality_score": 4.98,
                    "verified": True,
                    "description": f"Comprehensive guide covering process synchronization, Coffman conditions, Resource Allocation Graph (RAG), Banker's algorithm, and campus placement viva questions on {clean_q}.",
                    "preview_content": f"Detailed OS mechanisms, state machine transitions, and interview proofs for {clean_q}."
                },
                {
                    "id": "res-os-2",
                    "title": f"{clean_q} — TutorialsPoint OS Architecture Handbook",
                    "url": f"https://www.tutorialspoint.com/search/{encoded_q}",
                    "domain": "tutorialspoint.com",
                    "breadcrumb": f"https://www.tutorialspoint.com > operating_system > {clean_q.lower().replace(' ', '-')}",
                    "website": "TutorialsPoint",
                    "reason": "Best for: Beginners & OS Architecture",
                    "learning_level": "Beginner",
                    "filter_tag": "Documentation",
                    "quality_score": 4.88,
                    "verified": True,
                    "description": f"Modular OS architecture notes with diagrams explaining process scheduling, critical section problems, and deadlock recovery strategies for {clean_q}.",
                    "preview_content": f"Modular architecture diagrams and conceptual notes for {clean_q}."
                },
                {
                    "id": "res-os-3",
                    "title": f"{clean_q} — Scaler Topics Operating Systems Deep Dive",
                    "url": f"https://www.scaler.com/topics/search/?q={encoded_q}",
                    "domain": "scaler.com/topics",
                    "breadcrumb": f"https://www.scaler.com > topics > operating-system > {clean_q.lower().replace(' ', '-')}",
                    "website": "Scaler Topics",
                    "reason": "Best for: Visual Traces & Placement Q&A",
                    "learning_level": "Placement",
                    "filter_tag": "Interview Q&A",
                    "quality_score": 4.90,
                    "verified": True,
                    "description": f"Visual trace diagrams, safety state mathematical proofs, and top placement interview questions asked by product companies on {clean_q}.",
                    "preview_content": f"Safety state proofs, Banker's algorithm traces, and placement viva notes for {clean_q}."
                },
                {
                    "id": "res-os-4",
                    "title": f"{clean_q} — JavaTpoint OS Mechanisms & Comparison Tables",
                    "url": f"https://www.javatpoint.com/search.php?q={encoded_q}",
                    "domain": "javatpoint.com",
                    "breadcrumb": f"https://www.javatpoint.com > os > {clean_q.lower().replace(' ', '-')}",
                    "website": "JavaTpoint",
                    "reason": "Best for: Quick Lookup Tables",
                    "learning_level": "Beginner",
                    "filter_tag": "Documentation",
                    "quality_score": 4.82,
                    "verified": True,
                    "description": f"Quick lookup comparison tables, definition points, and semester & interview exam points for {clean_q}.",
                    "preview_content": f"Comparison tables, definitions, and placement points for {clean_q}."
                }
            ]
        elif is_dbms or "normaliz" in q_lower or "sql" in q_lower:
            results = [
                {
                    "id": "res-dbms-1",
                    "title": f"{clean_q} — Complete Database Management & SQL Guide",
                    "url": f"https://www.geeksforgeeks.org/search/?q={encoded_q}",
                    "domain": "geeksforgeeks.org",
                    "breadcrumb": f"https://www.geeksforgeeks.org > dbms > {clean_q.lower().replace(' ', '-')}",
                    "website": "GeeksforGeeks",
                    "reason": "Best for: Concepts + Normal Form Proofs",
                    "learning_level": "Interview",
                    "filter_tag": "Tutorials",
                    "quality_score": 4.96,
                    "verified": True,
                    "description": f"Complete relational database theory covering functional dependencies, decomposition, ACID transactions, and SQL queries on {clean_q}.",
                    "preview_content": f"Relational algebra, functional dependencies, indexing, and SQL optimization for {clean_q}."
                },
                {
                    "id": "res-dbms-2",
                    "title": f"{clean_q} — W3Schools Interactive SQL Reference",
                    "url": f"https://www.w3schools.com/howto/howto_js_search_menu.asp?q={encoded_q}",
                    "domain": "w3schools.com",
                    "breadcrumb": f"https://www.w3schools.com > sql > {clean_q.lower().replace(' ', '-')}",
                    "website": "W3Schools",
                    "reason": "Best for: Beginners & Syntax Practice",
                    "learning_level": "Beginner",
                    "filter_tag": "Documentation",
                    "quality_score": 4.90,
                    "verified": True,
                    "description": f"Interactive try-it-yourself SQL playground, syntax tables, and query execution examples for {clean_q}.",
                    "preview_content": f"Interactive SQL execution, join Venn diagrams, and syntax guides for {clean_q}."
                },
                {
                    "id": "res-dbms-3",
                    "title": f"{clean_q} — TutorialsPoint Database Architecture",
                    "url": f"https://www.tutorialspoint.com/search/{encoded_q}",
                    "domain": "tutorialspoint.com",
                    "breadcrumb": f"https://www.tutorialspoint.com > dbms > {clean_q.lower().replace(' ', '-')}",
                    "website": "TutorialsPoint",
                    "reason": "Best for: Database Architecture",
                    "learning_level": "Beginner",
                    "filter_tag": "Documentation",
                    "quality_score": 4.85,
                    "verified": True,
                    "description": f"Schema design, transaction management, query evaluation plans, and storage engines for {clean_q}.",
                    "preview_content": f"Two-phase locking, serializability graphs, and relational schemas for {clean_q}."
                },
                {
                    "id": "res-dbms-4",
                    "title": f"{clean_q} — Scaler Topics Database Systems & Design",
                    "url": f"https://www.scaler.com/topics/search/?q={encoded_q}",
                    "domain": "scaler.com/topics",
                    "breadcrumb": f"https://www.scaler.com > topics > dbms > {clean_q.lower().replace(' ', '-')}",
                    "website": "Scaler Topics",
                    "reason": "Best for: Placement Interview Questions",
                    "learning_level": "Placement",
                    "filter_tag": "Interview Q&A",
                    "quality_score": 4.88,
                    "verified": True,
                    "description": f"Visual database architecture diagrams, indexing trade-offs, and company placement database questions for {clean_q}.",
                    "preview_content": f"Database scaling, partitioning, and placement interview solutions for {clean_q}."
                }
            ]
        else:
            # DSA & Problem Solving (Default)
            results = [
                {
                    "id": "res-dsa-1",
                    "title": f"{clean_q} — LeetCode Coding & Algorithmic Practice",
                    "url": f"https://leetcode.com/problemset/all/?search={encoded_q}",
                    "domain": "leetcode.com",
                    "breadcrumb": f"https://leetcode.com > problemset > {clean_q.lower().replace(' ', '-')}",
                    "website": "LeetCode",
                    "reason": "Best for: Hands-on Problem Solving & Edge Cases",
                    "learning_level": "Problem Solving",
                    "filter_tag": "Practice Problems",
                    "quality_score": 5.0,
                    "verified": True,
                    "description": f"Industry standard coding challenges, edge test cases, benchmark timings, and community discussion threads on {clean_q}.",
                    "preview_content": f"Interactive test benches, competitive constraints, optimal time-space trade-offs for {clean_q}."
                },
                {
                    "id": "res-dsa-2",
                    "title": f"{clean_q} — InterviewBit Solved Interview Questions",
                    "url": f"https://www.interviewbit.com/search/?q={encoded_q}",
                    "domain": "interviewbit.com",
                    "breadcrumb": f"https://www.interviewbit.com > practice > {clean_q.lower().replace(' ', '-')}",
                    "website": "InterviewBit",
                    "reason": "Best for: Interview Coding & Solutions",
                    "learning_level": "Interview",
                    "filter_tag": "Interview Q&A",
                    "quality_score": 4.95,
                    "verified": True,
                    "description": f"Curated interview questions, optimal algorithmic solutions, time-space complexity proofs, and edge case breakdowns for {clean_q}.",
                    "preview_content": f"Top company interview questions, optimal time-space trade-offs, and step-by-step solutions for {clean_q}."
                },
                {
                    "id": "res-dsa-3",
                    "title": f"{clean_q} — GeeksforGeeks Complete Tutorial & Algorithm Proofs",
                    "url": f"https://www.geeksforgeeks.org/search/?q={encoded_q}",
                    "domain": "geeksforgeeks.org",
                    "breadcrumb": f"https://www.geeksforgeeks.org > dsa > {clean_q.lower().replace(' ', '-')}",
                    "website": "GeeksforGeeks",
                    "reason": "Best for: Concepts + Algorithms",
                    "learning_level": "Interview",
                    "filter_tag": "Tutorials",
                    "quality_score": 4.95,
                    "verified": True,
                    "description": f"In-depth technical tutorial covering fundamental concepts, code implementations (C++, Java, Python), complexity analysis, and practice problems on {clean_q}.",
                    "preview_content": f"Comprehensive code walkthroughs, runtime complexity invariants, memory layout for {clean_q}."
                },
                {
                    "id": "res-dsa-4",
                    "title": f"{clean_q} — Programiz Illustrated DSA Walkthroughs",
                    "url": f"https://www.programiz.com/search/{encoded_q}",
                    "domain": "programiz.com",
                    "breadcrumb": f"https://www.programiz.com > dsa > {clean_q.lower().replace(' ', '-')}",
                    "website": "Programiz",
                    "reason": "Best for: Beginners & Visual Traces",
                    "learning_level": "Beginner",
                    "filter_tag": "Tutorials",
                    "quality_score": 4.85,
                    "verified": True,
                    "description": f"Beginner to advanced illustrated tutorials with minimal clean code examples and output traces for {clean_q}.",
                    "preview_content": f"Step-by-step code demonstrations, execution traces, and practical programming patterns for {clean_q}."
                }
            ]

        return results

    @staticmethod
    def _generate_related_searches(clean_q: str, q_lower: str) -> List[str]:
        if "deadlock" in q_lower:
            return [
                "deadlock prevention vs avoidance in OS",
                "banker's algorithm code in C++",
                "4 Coffman conditions for deadlock",
                "deadlock in DBMS vs Operating System",
                "resource allocation graph cycle detection",
                "starvation vs deadlock difference with examples"
            ]
        elif "binary search" in q_lower:
            return [
                "binary search on rotated sorted array",
                "binary search on answer space placement problems",
                "binary search iterative vs recursive time complexity",
                "allocate minimum pages binary search",
                "aggressive cows problem binary search leetcode"
            ]
        elif "java" in q_lower or "oop" in q_lower:
            return [
                "4 pillars of OOP in Java with real world examples",
                "abstraction vs encapsulation interview difference",
                "why Java does not support multiple inheritance",
                "method overloading vs overriding in Java",
                "Java OOP placement viva questions"
            ]
        elif "normaliz" in q_lower or "dbms" in q_lower:
            return [
                "1NF 2NF 3NF BCNF with solved examples",
                "lossless join decomposition in DBMS",
                "functional dependency and candidate key finding",
                "SQL joins vs subqueries performance",
                "ACID properties in DBMS interview questions"
            ]
        elif any(k in q_lower for k in ["probab", "quant", "aptitude", "time and work"]):
            return [
                f"{clean_q} shortcut formulas for campus placement",
                f"{clean_q} TCS NQT previous year questions",
                f"{clean_q} practice questions with step-by-step solutions",
                f"{clean_q} speed math tricks IndiaBIX"
            ]
        else:
            return [
                f"{clean_q} interview questions and answers",
                f"{clean_q} best practices and design patterns",
                f"{clean_q} time complexity and space complexity",
                f"{clean_q} implementation in C++ and Java",
                f"{clean_q} campus placement tutorial GeeksforGeeks"
            ]

def search_web_rag(query: str, category_filter: str = "All", top_k: int = 6) -> Dict[str, Any]:
    """Entrypoint for the Google Search Engine replication."""
    return GoogleSearchEngineReplication.search(query, category_filter=category_filter, top_k=top_k)
