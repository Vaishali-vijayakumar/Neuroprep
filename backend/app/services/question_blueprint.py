"""
Question Blueprint Engine
==========================
Deterministic planner that decides WHAT concept and cognitive dimension the
next interview question should test BEFORE Gemini is called to phrase it.

Architecture:
  1. TRACK_SYLLABI  — exhaustive map of track → topics → subtopics → concepts
  2. COGNITIVE_DIMENSIONS — ordered axis every topic traverses
  3. QuestionBlueprintEngine — selects an untested or under-tested concept
     and assigns the appropriate cognitive dimension based on interview state

Cognitive Dimension Axis (in order for each concept):
  concept → application → trade_off → failure_mode → scale_optimization

The engine ensures that once a concept's current dimension has been tested,
the next visit to the same concept advances to the next dimension OR the
concept is closed and a fresh concept is opened.
"""

from __future__ import annotations
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Cognitive Dimensions ───────────────────────────────────────────────────────
COGNITIVE_DIMENSIONS = [
    "concept",           # "Explain the foundational mechanism of X."
    "application",       # "Given requirement Y, how would you use X in code?"
    "trade_off",         # "Under what constraints is X worse than Z?"
    "failure_mode",      # "Scenario: system exhibits anomaly W while using X."
    "scale_optimization" # "How does X behave at 100k req/sec across nodes?"
]

# Map track → topic → subtopics → concepts to be tested
TRACK_SYLLABI: dict[str, dict[str, dict[str, list[str]]]] = {

    "dsa": {
        "Arrays & Strings": {
            "Arrays": ["dynamic array resizing", "two-pointer technique", "sliding window",
                       "prefix sums", "Kadane's algorithm"],
            "Strings": ["KMP pattern matching", "Rabin-Karp rolling hash",
                        "string reversal in-place", "anagram detection"]
        },
        "Linked Lists": {
            "Singly Linked": ["reversal", "cycle detection (Floyd)", "merge two sorted lists",
                              "nth from end"],
            "Doubly Linked": ["LRU cache implementation", "insertion at position",
                              "deletion by value"]
        },
        "Trees": {
            "Binary Trees": ["inorder/preorder/postorder traversal", "height & balance",
                             "LCA (Lowest Common Ancestor)", "diameter"],
            "BST": ["insertion/deletion/search", "kth smallest", "validate BST",
                    "floor & ceiling"],
            "Heaps": ["min/max heap property", "heapify", "top-K elements",
                      "heap sort"],
            "Segment Trees": ["range sum query", "range minimum query", "lazy propagation"]
        },
        "Graphs": {
            "Traversal": ["BFS", "DFS", "topological sort", "connected components"],
            "Shortest Path": ["Dijkstra", "Bellman-Ford", "Floyd-Warshall"],
            "Advanced": ["Kruskal MST", "Prim MST", "cycle detection", "bipartite check"]
        },
        "Dynamic Programming": {
            "1D DP": ["Fibonacci memoization", "0/1 knapsack", "coin change", "climb stairs"],
            "2D DP": ["LCS", "LIS", "edit distance", "matrix chain multiplication"],
            "DP on Trees": ["diameter via DP", "house robber III"]
        },
        "Hashing": {
            "Hash Tables": ["hash collision resolution (chaining vs open addressing)",
                            "load factor & rehashing", "HashMap vs HashSet",
                            "consistent hashing"]
        },
        "Sorting & Searching": {
            "Sorting": ["merge sort", "quick sort (pivot strategies)", "heap sort",
                        "counting sort", "radix sort", "stability"],
            "Searching": ["binary search (standard)", "binary search on answer",
                          "ternary search", "search in rotated array"]
        },
        "Greedy & Backtracking": {
            "Greedy": ["activity selection", "fractional knapsack", "Huffman coding",
                       "interval scheduling"],
            "Backtracking": ["N-Queens", "Sudoku solver", "permutations",
                             "subset sum", "word search"]
        }
    },

    "tech": {
        "Object-Oriented Programming": {
            "Pillars": ["encapsulation", "inheritance", "polymorphism", "abstraction"],
            "Advanced OOP": ["composition vs inheritance", "method overriding vs overloading",
                             "covariant return types", "multiple inheritance problems"]
        },
        "Databases": {
            "Relational": ["ACID properties", "normalization (1NF 2NF 3NF BCNF)",
                           "indexing (B-Tree vs Hash)", "query optimization (EXPLAIN)",
                           "transactions & locking", "deadlock detection"],
            "NoSQL": ["CAP theorem", "eventual consistency", "document vs key-value vs columnar",
                      "MongoDB sharding", "Redis data structures"]
        },
        "Operating Systems": {
            "Processes & Threads": ["process vs thread", "context switching overhead",
                                    "race conditions", "deadlock conditions (Coffman)",
                                    "semaphore vs mutex"],
            "Memory": ["paging vs segmentation", "virtual memory", "page replacement (LRU FIFO)",
                       "memory-mapped files"],
            "I/O": ["blocking vs non-blocking I/O", "epoll vs select vs poll",
                    "DMA (Direct Memory Access)"]
        },
        "Networking": {
            "Protocols": ["TCP vs UDP", "HTTP/1.1 vs HTTP/2 vs HTTP/3",
                          "TCP handshake & congestion control", "DNS resolution",
                          "TLS/SSL handshake"],
            "Architecture": ["load balancing algorithms", "CDN mechanics",
                             "WebSocket vs long-polling vs SSE", "REST vs gRPC"]
        },
        "System Software": {
            "Compilers": ["compilation pipeline", "JIT vs AOT", "garbage collection algorithms"],
            "Concurrency": ["actor model", "event loop", "cooperative vs preemptive scheduling",
                            "lock-free data structures"]
        }
    },

    "coding": {
        "Arrays & Two Pointers": {
            "Core": ["two-sum", "three-sum", "container with most water",
                     "trapping rain water", "next permutation"]
        },
        "Strings": {
            "Core": ["longest palindrome substring", "valid anagram",
                     "group anagrams", "encode/decode strings", "minimum window substring"]
        },
        "Trees & Recursion": {
            "Core": ["max depth binary tree", "same tree", "invert binary tree",
                     "serialize & deserialize", "binary tree paths"]
        },
        "Dynamic Programming": {
            "Core": ["climbing stairs", "house robber", "longest increasing subsequence",
                     "word break", "decode ways"]
        },
        "Graphs": {
            "Core": ["number of islands", "clone graph", "course schedule",
                     "word ladder", "alien dictionary"]
        }
    },

    "system_design": {
        "Scalability Primitives": {
            "Caching": ["cache invalidation strategies", "write-through vs write-back vs write-around",
                        "CDN edge caching", "cache stampede prevention"],
            "Load Balancing": ["round-robin vs least-connections vs consistent hashing",
                               "L4 vs L7 load balancing", "sticky sessions"],
            "Databases at Scale": ["read replicas", "sharding (horizontal vs vertical)",
                                   "CQRS", "event sourcing", "database federation"]
        },
        "Distributed Systems": {
            "Consistency": ["CAP theorem", "PACELC model", "linearizability vs eventual consistency",
                            "vector clocks", "CRDTs"],
            "Consensus": ["Raft protocol", "Paxos overview", "leader election",
                          "split-brain problem"],
            "Messaging": ["Kafka partition mechanics", "at-least-once vs exactly-once delivery",
                          "dead-letter queues", "saga pattern"]
        },
        "Classic Designs": {
            "Storage": ["URL shortener", "distributed file system (like HDFS)",
                        "S3-like object store", "distributed key-value store"],
            "Compute": ["web crawler design", "search autocomplete system",
                        "rate limiter", "API gateway design"],
            "Real-time": ["notification system", "chat application", "live leaderboard",
                          "ride-sharing matching"]
        }
    },

    "lld": {
        "SOLID Principles": {
            "Principles": ["Single Responsibility", "Open/Closed", "Liskov Substitution",
                           "Interface Segregation", "Dependency Inversion"]
        },
        "Design Patterns": {
            "Creational": ["Singleton thread safety", "Factory Method", "Abstract Factory",
                           "Builder pattern", "Prototype"],
            "Structural": ["Adapter", "Decorator", "Facade", "Proxy vs Decorator",
                           "Composite"],
            "Behavioral": ["Strategy", "Observer", "Command", "Iterator", "Template Method",
                           "State machine"]
        },
        "Class Design": {
            "OOP Design": ["parking lot system", "elevator system", "library management system",
                           "hotel booking system", "chess game"]
        }
    },

    "behavioral": {
        "STAR Method": {
            "Situation & Task": ["setting the scene", "quantifying the challenge",
                                 "stakeholder identification"],
            "Action": ["ownership language (I vs we)", "decision rationale",
                       "cross-functional coordination"],
            "Result": ["quantified business impact", "what you learned",
                       "what you would change"]
        },
        "Leadership Themes": {
            "Conflict": ["conflict resolution process", "disagreement with manager",
                         "failed team collaboration"],
            "Ownership": ["project led end-to-end", "initiative without being asked",
                          "recovering from failure"]
        }
    },

    "hr": {
        "Self-Presentation & Narrative": {
            "Elevator Pitch & Background": [
                "career narrative pitch",
                "motivation for software engineering",
                "core technical & soft strengths",
            ],
            "Self-Awareness & Growth": [
                "genuine growth area & development plan",
                "handling self-doubt",
                "feedback receptiveness",
            ],
        },
        "Company Alignment & Culture": {
            "Motivation & Research": [
                "why this company over competitors",
                "company value alignment",
                "understanding company products & mission",
            ],
            "Work Style & Environment": [
                "preferred team culture",
                "cross-functional collaboration",
                "remote vs hybrid adaptability",
            ],
        },
        "STAR Behavioral & Conflict": {
            "Team Dynamics & Disagreements": [
                "technical disagreement resolution",
                "managing friction with manager or peer",
                "difficult teammate communication",
            ],
            "Pressure & Deadlines": [
                "handling tight project deadlines",
                "scope changes & prioritization",
                "managing project failure & recovery",
            ],
        },
        "Leadership & Accountability": {
            "Ownership": [
                "initiative beyond assigned scope",
                "taking ownership of mistakes",
                "mentoring or helping peers",
            ],
            "Ethics & Integrity": [
                "handling workplace ethical dilemma",
                "managing conflicting client/business priorities",
            ],
        },
        "Career Vision & Synthesis": {
            "Roadmap": [
                "2 to 3 year career roadmap",
                "long term aspiration alignment",
                "thoughtful reverse questions for HR",
            ],
        },
    },

    "ai_ml": {
        "Fundamentals": {
            "ML Basics": ["bias-variance tradeoff", "overfitting & regularization",
                          "cross-validation", "evaluation metrics (F1 ROC AUC)"],
            "Deep Learning": ["backpropagation mechanics", "vanishing gradient",
                              "batch normalization", "dropout"]
        },
        "Transformers & LLMs": {
            "Attention": ["self-attention mechanism", "multi-head attention",
                          "positional encoding", "KV cache optimization"],
            "LLM Engineering": ["RAG pipeline design", "chunking strategies",
                                "embedding model selection", "hallucination mitigation",
                                "fine-tuning vs RAG tradeoff"]
        },
        "MLOps": {
            "Production": ["model versioning", "A/B testing models", "feature stores",
                           "data drift detection", "shadow deployment"]
        }
    },

    "devops": {
        "Containers & Orchestration": {
            "Docker": ["image layer caching", "multi-stage builds", "container networking",
                       "Docker security best practices"],
            "Kubernetes": ["pod lifecycle", "deployments vs statefulsets",
                           "HPA (Horizontal Pod Autoscaler)", "service mesh (Istio)",
                           "persistent volume claims"]
        },
        "CI/CD": {
            "Pipelines": ["trunk-based development", "feature flags", "blue-green deployment",
                          "canary releases", "rollback strategies"]
        },
        "Observability": {
            "Monitoring": ["RED metrics (Rate Error Duration)", "SLO vs SLA vs SLI",
                           "distributed tracing (Jaeger OpenTelemetry)",
                           "log aggregation (ELK stack)"]
        }
    },

    "cloud": {
        "AWS Core": {
            "Compute": ["EC2 instance types & placement groups", "Lambda cold start optimization",
                        "ECS vs EKS vs Fargate"],
            "Storage": ["S3 storage classes & lifecycle policies", "EBS vs EFS vs S3",
                        "S3 replication & versioning"],
            "Networking": ["VPC architecture (subnets, NAT, IGW)", "Route 53 routing policies",
                           "CloudFront cache behaviors", "Direct Connect vs VPN"]
        },
        "Architecture Patterns": {
            "Reliability": ["multi-AZ vs multi-region", "disaster recovery (RTO RPO)",
                            "AWS WAF & Shield", "circuit breaker pattern"],
            "Cost": ["reserved vs spot vs on-demand", "right-sizing", "savings plans"]
        }
    },

    "cybersecurity": {
        "Web Security": {
            "OWASP Top 10": ["SQL injection prevention", "XSS (stored vs reflected vs DOM)",
                             "CSRF tokens", "broken access control", "security misconfiguration"],
            "Authentication": ["OAuth 2.0 flows", "JWT vulnerabilities", "session fixation",
                               "MFA bypass attacks"]
        },
        "Network Security": {
            "Threats": ["man-in-the-middle attack", "DDoS mitigation", "DNS poisoning",
                        "ARP spoofing"],
            "Defense": ["firewall rules (stateful vs stateless)", "IDS vs IPS",
                        "network segmentation", "zero-trust architecture"]
        }
    },

    "project": {
        "Project Viva": {
            "Architecture": ["architectural decision rationale", "technology selection",
                             "monolith vs microservices decision"],
            "Implementation": ["database schema design", "API design choices",
                               "authentication implementation", "deployment pipeline"],
            "Resilience": ["failure scenarios handled", "scaling bottlenecks",
                           "data backup & recovery", "monitoring setup"]
        }
    },

    "default": {
        "General": {
            "Self": ["professional background", "key strengths", "career motivation"],
            "Problem Solving": ["complex problem faced", "approach to ambiguity",
                                "cross-team collaboration"],
            "Technical": ["recent technical achievement", "technology choices",
                          "learning new technologies"]
        }
    }
}


# ── Blueprint Engine ───────────────────────────────────────────────────────────

class QuestionBlueprintEngine:
    """
    Selects the next (topic, subtopic, concept, cognitive_dimension) tuple
    based on the current interview knowledge state.

    Selection priority:
      1. Concepts the candidate STRUGGLED with (deficit) — advance cognitive dimension
      2. Concepts NEVER tested — open new concept at 'concept' level
      3. If all concepts exhausted — revisit a weak concept at a higher dimension
    """

    MAX_TOPIC_SATURATION_RATIO: float = 0.35   # No topic can consume >35% of total turns
    MAX_CONCEPT_TURNS: int = 2                 # Max times one concept is tested in a session
    DEFICIT_THRESHOLD: int = 60               # Score below this → concept marked as deficit

    def __init__(self, track: str):
        self.track   = track
        self.syllabus = TRACK_SYLLABI.get(track, TRACK_SYLLABI["default"])

    def select(
        self,
        knowledge_graph: dict,   # current session knowledge state
        concept_counts: dict,    # {concept_slug: int}
        topic_turn_counts: dict, # {topic: int}
        total_turns: int,
        stress_index: int = 0,
        difficulty: str = "Intermediate",
    ) -> dict:
        """
        Returns a blueprint dict:
        {
          "topic":        str,
          "subtopic":     str,
          "concept":      str,
          "dimension":    str,   # one of COGNITIVE_DIMENSIONS
          "difficulty":   str,
          "instruction":  str,   # rich constraint injected into Gemini prompt
          "rationale":    str,   # why this was selected (for logging)
        }
        """
        # Under extreme stress → pick the least-threatening topic/concept
        if stress_index >= 75:
            return self._stress_relief_blueprint(knowledge_graph)

        # Try to find a concept the candidate struggled with (advance its dimension)
        deficit_bp = self._deficit_advancement(knowledge_graph, concept_counts,
                                               topic_turn_counts, total_turns)
        if deficit_bp:
            return deficit_bp

        # Otherwise, pick the next completely untested concept
        fresh_bp = self._fresh_concept(knowledge_graph, concept_counts,
                                       topic_turn_counts, total_turns)
        if fresh_bp:
            return fresh_bp

        # All concepts exhausted → fallback to first weak concept at highest available dimension
        return self._exhausted_fallback(knowledge_graph)

    def _pick_dimension(self, concept_slug: str, knowledge_graph: dict) -> str:
        """Return the next untested cognitive dimension for a given concept."""
        tested = set()
        for topic_data in knowledge_graph.values():
            for sub_data in topic_data.values():
                for c_slug, c_data in sub_data.items():
                    if c_slug == concept_slug:
                        tested = set(c_data.get("dimensions_used", []))
        for dim in COGNITIVE_DIMENSIONS:
            if dim not in tested:
                return dim
        return COGNITIVE_DIMENSIONS[-1]  # saturated — return highest dimension

    def _make_instruction(self, topic, subtopic, concept, dimension) -> str:
        """Build a rich constraint string for the Gemini prompt."""
        if self.track in ("hr", "behavioral", "managerial", "communication"):
            dim_templates = {
                "concept":           f"Explore the candidate's personal perspective, self-awareness, and core philosophy regarding '{concept}', referencing what they shared in their transcript.",
                "application":       f"Ask the candidate for a specific past experience using the STAR format demonstrating '{concept}', building directly upon what they shared in their transcript.",
                "trade_off":         f"Present a realistic workplace dilemma, conflicting priority, or tough interpersonal choice involving '{concept}' and ask how they would navigate the trade-offs.",
                "failure_mode":      f"Probe into a difficult setback, mistake, or challenging conflict involving '{concept}', asking how they took ownership, adapted, and grew from it.",
                "scale_optimization":f"Ask how the candidate influences team culture, mentors colleagues, or scales their collaboration across larger teams regarding '{concept}'.",
            }
        else:
            dim_templates = {
                "concept":           f"Ask a foundational question explaining the core mechanism of '{concept}'.",
                "application":       f"Present a realistic scenario where the candidate must apply '{concept}' to solve a concrete implementation problem.",
                "trade_off":         f"Challenge the candidate to compare '{concept}' against an alternative, focusing on specific constraints where one is inferior.",
                "failure_mode":      f"Describe a realistic system failure or bug scenario involving '{concept}' and ask the candidate to diagnose the root cause.",
                "scale_optimization":f"Ask how '{concept}' behaves or must be redesigned when the system scales to enterprise load (millions of users or requests per second).",
            }
        base = dim_templates.get(dimension, dim_templates["concept"])
        return (
            f"[BLUEPRINT DIRECTIVE — MANDATORY]\n"
            f"Topic: {topic} | Subtopic: {subtopic} | Concept: {concept} | "
            f"Cognitive Dimension: {dimension.upper()}\n"
            f"Task: {base}\n"
            f"IMPORTANT: Do NOT introduce any unrelated topic. The question MUST directly test "
            f"'{concept}' at the '{dimension}' cognitive level. "
            f"Reference the candidate's profile context and speech transcript in your phrasing."
        )

    def _slugify(self, text: str) -> str:
        return re.sub(r"\s+", "_", text.lower().strip())

    def _deficit_advancement(self, knowledge_graph, concept_counts,
                             topic_turn_counts, total_turns) -> Optional[dict]:
        """Find a concept with deficit mastery and advance its cognitive dimension."""
        best = None
        best_score = 999
        for topic, subtopics in self.syllabus.items():
            topic_turns = topic_turn_counts.get(topic, 0)
            if total_turns > 0 and topic_turns / total_turns > self.MAX_TOPIC_SATURATION_RATIO:
                continue  # topic saturated
            for subtopic, concepts in subtopics.items():
                for concept in concepts:
                    c_slug = self._slugify(concept)
                    c_data = (knowledge_graph
                              .get(topic, {})
                              .get(subtopic, {})
                              .get(c_slug, {}))
                    if not c_data:
                        continue  # never tested
                    mastery = c_data.get("mastery", 100)
                    count   = concept_counts.get(c_slug, 0)
                    if mastery < self.DEFICIT_THRESHOLD and count < self.MAX_CONCEPT_TURNS:
                        if mastery < best_score:
                            best_score = mastery
                            next_dim   = self._pick_dimension(c_slug, knowledge_graph)
                            if next_dim == COGNITIVE_DIMENSIONS[-1] and count >= 1:
                                continue  # already at highest, don't over-probe
                            best = {
                                "topic": topic, "subtopic": subtopic,
                                "concept": concept,
                                "dimension": next_dim,
                                "difficulty": self._difficulty_for_dim(next_dim),
                                "instruction": self._make_instruction(
                                    topic, subtopic, concept, next_dim),
                                "rationale": f"Deficit advancement: mastery={mastery}/100, "
                                             f"dim={next_dim}"
                            }
        return best

    def _fresh_concept(self, knowledge_graph, concept_counts,
                       topic_turn_counts, total_turns) -> Optional[dict]:
        """Select the first completely untested concept, respecting topic saturation."""
        for topic, subtopics in self.syllabus.items():
            topic_turns = topic_turn_counts.get(topic, 0)
            if total_turns > 0 and topic_turns / total_turns > self.MAX_TOPIC_SATURATION_RATIO:
                continue
            for subtopic, concepts in subtopics.items():
                for concept in concepts:
                    c_slug = self._slugify(concept)
                    if concept_counts.get(c_slug, 0) == 0:
                        dim = "concept"
                        return {
                            "topic": topic, "subtopic": subtopic,
                            "concept": concept,
                            "dimension": dim,
                            "difficulty": "Intermediate",
                            "instruction": self._make_instruction(topic, subtopic, concept, dim),
                            "rationale": f"Fresh concept: never tested in session"
                        }
        return None

    def _exhausted_fallback(self, knowledge_graph) -> dict:
        """All concepts visited — pick the weakest concept at its next dimension."""
        weakest_concept = "general topics"
        weakest_score   = 999
        weakest_topic   = next(iter(self.syllabus), "General")
        weakest_subtopic = "Core"

        for topic, subtopics in self.syllabus.items():
            for subtopic, concepts in subtopics.items():
                for concept in concepts:
                    c_slug = concept.lower().replace(" ", "_")
                    c_data = knowledge_graph.get(topic, {}).get(subtopic, {}).get(c_slug, {})
                    mastery = c_data.get("mastery", 70) if c_data else 70
                    if mastery < weakest_score:
                        weakest_score   = mastery
                        weakest_concept = concept
                        weakest_topic   = topic
                        weakest_subtopic = subtopic

        dim = "trade_off"  # jump to higher dimension when revisiting
        return {
            "topic": weakest_topic, "subtopic": weakest_subtopic,
            "concept": weakest_concept,
            "dimension": dim,
            "difficulty": "Advanced",
            "instruction": self._make_instruction(weakest_topic, weakest_subtopic,
                                                   weakest_concept, dim),
            "rationale": "Exhausted fallback: all concepts visited, revisiting weakest at higher dim"
        }

    def _stress_relief_blueprint(self, knowledge_graph) -> dict:
        """Under high stress → pick a familiar, already-passed topic at concept level."""
        topic    = next(iter(self.syllabus), "General")
        subtopic = next(iter(self.syllabus[topic]), "Core")
        concept  = next(iter(self.syllabus[topic][subtopic]), "core concepts")
        return {
            "topic": topic, "subtopic": subtopic,
            "concept": concept,
            "dimension": "concept",
            "difficulty": "Beginner",
            "instruction": (
                f"[STRESS RELIEF MODE] The candidate is under high physiological stress. "
                f"Ask a straightforward, confidence-building question about '{concept}'. "
                f"Be exceptionally warm and supportive in tone."
            ),
            "rationale": "Stress relief: reduced difficulty to help candidate recover composure"
        }

    @staticmethod
    def _difficulty_for_dim(dimension: str) -> str:
        mapping = {
            "concept":            "Intermediate",
            "application":        "Intermediate",
            "trade_off":          "Advanced",
            "failure_mode":       "Advanced",
            "scale_optimization": "Expert",
        }
        return mapping.get(dimension, "Intermediate")


# ── Per-session engine cache ───────────────────────────────────────────────────
_engines: dict[str, QuestionBlueprintEngine] = {}

def get_blueprint_engine(session_id: str, track: str) -> QuestionBlueprintEngine:
    if session_id not in _engines:
        _engines[session_id] = QuestionBlueprintEngine(track)
    return _engines[session_id]

def cleanup_engine(session_id: str) -> None:
    _engines.pop(session_id, None)
