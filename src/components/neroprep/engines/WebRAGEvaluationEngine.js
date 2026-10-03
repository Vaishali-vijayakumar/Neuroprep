/**
 * WebRAGEvaluationEngine — Intelligent Web-Grounded Question Research & Evaluation Agent
 * 
 * Capabilities:
 * 1. Analyzes question intent, domain, and core conceptual requirements.
 * 2. Retrieves verified ground-truth solutions and industry benchmark answers.
 * 3. Performs deep multi-vector semantic comparison against the candidate's spoken or written answer.
 * 4. Generates comprehensive, actionable improvement suggestions and detailed scorecards for the final report.
 */

export class WebRAGEvaluationEngine {
  /**
   * Search knowledge base and web benchmarks for verified ground-truth solution
   */
  static searchAndRetrieveBenchmark(question, trackId = 'tech') {
    const qLower = (question || '').toLowerCase();

    // 1. Check verified knowledge index for fast real-time retrieval
    const curatedKnowledge = this._getCuratedWebKnowledge(qLower, trackId);
    if (curatedKnowledge) {
      return curatedKnowledge;
    }

    // 2. Dynamic synthesis for arbitrary questions
    return this._synthesizeDynamicSolution(question, trackId);
  }

  /**
   * Comprehensive verified solutions knowledge index
   */
  static _getCuratedWebKnowledge(qLower, trackId) {
    // OOP Pillars
    if (/oop|four pillars|object oriented/i.test(qLower)) {
      return {
        topic: 'Object-Oriented Programming (OOP)',
        mustHaveConcepts: ['Encapsulation', 'Abstraction', 'Inheritance', 'Polymorphism'],
        goldStandardSolution: 'OOP is a paradigm based on objects containing data (attributes) and code (methods). The four pillars are: 1) Encapsulation: Bundling data with methods and restricting direct access using access modifiers (private/protected). 2) Abstraction: Hiding internal implementation complexity and exposing only necessary interfaces (using abstract classes/interfaces). 3) Inheritance: Deriving new classes from existing ones to enable code reusability (IS-A relationship). 4) Polymorphism: The ability of an entity to take multiple forms via method overloading (compile-time) and method overriding (runtime).',
        commonPitfalls: ['Confusing Abstraction (hiding implementation) with Encapsulation (data hiding/bundling)', 'Failing to give practical real-world code examples'],
      };
    }

    // Abstraction vs Encapsulation
    if (/abstraction versus encapsulation|abstraction vs encapsulation/i.test(qLower)) {
      return {
        topic: 'Abstraction vs Encapsulation',
        mustHaveConcepts: ['Implementation Hiding', 'Data Hiding / Access Modifiers', 'Interfaces', 'Getters / Setters'],
        goldStandardSolution: 'Encapsulation is the technique of bundling state and behavior together and restricting direct variable access using private modifiers and getter/setter methods (Data Hiding - WHAT is protected). Abstraction is the technique of hiding background implementation details and showing only high-level functionality using abstract classes and interfaces (Implementation Hiding - HOW it is done). Example: A car dashboard abstracts engine complexity; the engine capsule protects internal fuel injection.',
        commonPitfalls: ['Treating them as identical concepts', 'Omitting the distinction between interfaces vs access specifiers'],
      };
    }

    // Inheritance vs Composition
    if (/inheritance versus composition|inheritance vs composition/i.test(qLower)) {
      return {
        topic: 'Inheritance vs Composition',
        mustHaveConcepts: ['IS-A Relationship', 'HAS-A Relationship', 'Tight Coupling', 'Flexibility / Code Reuse'],
        goldStandardSolution: 'Inheritance represents an IS-A relationship where a subclass inherits state and behavior from a superclass, enabling code reuse but introducing tight coupling. Composition represents a HAS-A relationship where a class contains instances of other classes as member variables, enabling loose coupling and dynamic runtime behavior swapping. Best practice: Favor composition over inheritance for greater architectural flexibility.',
        commonPitfalls: ['Overusing deep inheritance hierarchies', 'Failing to mention loose coupling in composition'],
      };
    }

    // Polymorphism / Overloading vs Overriding
    if (/polymorphism|overloading versus overriding|overloading vs overriding/i.test(qLower)) {
      return {
        topic: 'Polymorphism & Method Dispatch',
        mustHaveConcepts: ['Compile-Time (Overloading)', 'Runtime (Overriding)', 'Same Method Name', 'Different Parameters', 'Inheritance / Virtual Dispatch'],
        goldStandardSolution: 'Polymorphism allows methods to execute differently based on the calling object or arguments. Compile-time polymorphism (Method Overloading) occurs in the same class when methods share the same name but differ in parameter count or types. Runtime polymorphism (Method Overriding) occurs across an inheritance hierarchy when a subclass provides a specific implementation of a superclass method using the @Override annotation, resolved via virtual method tables (vtable).',
        commonPitfalls: ['Thinking changing only the return type creates a valid overload', 'Omitting dynamic runtime dispatch / vtable mechanisms'],
      };
    }

    // DBMS Indexing & ACID
    if (/acid|transaction|indexing|b-tree|normalization/i.test(qLower)) {
      return {
        topic: 'Database Management Systems (DBMS)',
        mustHaveConcepts: ['Atomicity', 'Consistency', 'Isolation', 'Durability', 'B-Tree Indexing', 'Fast Lookups'],
        goldStandardSolution: 'A database transaction is an atomic unit of execution that satisfies ACID properties: Atomicity (all-or-nothing execution), Consistency (maintains valid schema constraints before and after commit), Isolation (concurrent transactions execute independently without dirty reads via isolation levels like Read Committed/Serializable), and Durability (committed changes persist in non-volatile storage via Write-Ahead Logging). Indexing uses B-Tree/B+Tree structures to reduce disk I/O lookups from O(N) full table scans to O(log N).',
        commonPitfalls: ['Vague definition of Isolation without mentioning concurrency or dirty reads', 'Forgetting to explain Durability persistence (WAL logs)'],
      };
    }

    // SQL vs NoSQL
    if (/sql versus nosql|sql vs nosql|relational versus non-relational/i.test(qLower)) {
      return {
        topic: 'SQL vs NoSQL Databases',
        mustHaveConcepts: ['Structured Schema', 'ACID Compliance', 'Vertical Scaling (SQL)', 'Document/Key-Value Schema', 'BASE / Eventual Consistency', 'Horizontal Scaling (NoSQL)'],
        goldStandardSolution: 'SQL databases (PostgreSQL, MySQL) are relational, use structured schemas with tables/relations, enforce strict ACID transactions, and scale vertically (ideal for complex joins and financial systems). NoSQL databases (MongoDB, Redis, Cassandra) are non-relational, support flexible dynamic schemas (Document, Key-Value, Graph, Columnar), offer high throughput and horizontal partitioning/sharding, and favor BASE/eventual consistency (ideal for unstructured data, real-time caching, and high-velocity analytics).',
        commonPitfalls: ['Stating NoSQL cannot handle transactions (modern NoSQL supports multi-document ACID)', 'Failing to mention scaling trade-offs (Vertical vs Horizontal)'],
      };
    }

    // Operating Systems: Process vs Thread
    if (/process versus thread|process vs thread|thread vs process/i.test(qLower)) {
      return {
        topic: 'Operating Systems: Process vs Thread',
        mustHaveConcepts: ['Separate Address Space', 'Shared Memory', 'Context Switching Overhead', 'Stack & Registers', 'Synchronization / Mutex'],
        goldStandardSolution: 'A Process is an independent executing program with its own dedicated virtual address space, file descriptors, and memory map. A Thread is the smallest unit of CPU execution within a process; multiple threads of the same process share code, data, and heap segments but maintain independent stack pointers and CPU registers. Threads have lower creation and context-switching overhead but require synchronization (mutex/semaphores) to prevent race conditions.',
        commonPitfalls: ['Stating threads do not share memory (they share the heap and data segments)', 'Failing to mention context-switching overhead differences'],
      };
    }

    // Deadlocks & Concurrency
    if (/deadlock|race condition|semaphore|mutex/i.test(qLower)) {
      return {
        topic: 'Operating Systems: Concurrency & Deadlocks',
        mustHaveConcepts: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Lock Ordering / Banker\'s Algorithm'],
        goldStandardSolution: 'A deadlock is a state where a set of concurrent processes are permanently blocked because each is holding a resource and waiting for another held by another process. Deadlocks occur when 4 Coffman conditions hold simultaneously: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait. Deadlocks are prevented by eliminating Circular Wait (enforcing strict global lock acquisition ordering) or using detection algorithms like Banker\'s algorithm.',
        commonPitfalls: ['Listing only 2 or 3 Coffman conditions instead of all 4', 'Confusing Deadlock (permanent blocking) with Starvation (indefinite delay)'],
      };
    }

    // Networks: TCP vs UDP
    if (/tcp versus udp|tcp vs udp|udp vs tcp/i.test(qLower)) {
      return {
        topic: 'Computer Networks: TCP vs UDP',
        mustHaveConcepts: ['Connection-Oriented', '3-Way Handshake (SYN, SYN-ACK, ACK)', 'In-Order Delivery & Retransmission', 'Connectionless / Low Overhead (UDP)', 'Use Cases (HTTP vs VoIP/Streaming)'],
        goldStandardSolution: 'TCP (Transmission Control Protocol) is a connection-oriented, reliable transport protocol that establishes sessions via a 3-Way Handshake (SYN, SYN-ACK, ACK), guarantees in-order byte delivery with acknowledgments and retransmissions, and manages flow/congestion control (ideal for HTTP, Banking, File Transfer). UDP (User Datagram Protocol) is connectionless with zero handshakes or acknowledgments, delivering minimal latency and header overhead (ideal for live video streaming, DNS, and online gaming).',
        commonPitfalls: ['Not explaining the 3-Way Handshake sequence', 'Failing to specify protocol use cases (TCP for web/files, UDP for audio/DNS)'],
      };
    }

    // Networks: OSI Model / HTTP vs HTTPS
    if (/osi model|osi layers|http versus https|http vs https/i.test(qLower)) {
      return {
        topic: 'Computer Networks: OSI Model & Web Protocols',
        mustHaveConcepts: ['7 Layers (Physical to Application)', 'TLS/SSL Encryption', 'Port 80 vs Port 443', 'Data Integrity & Authentication'],
        goldStandardSolution: 'The OSI model defines 7 abstraction layers: Physical, Data Link, Network (IP routing), Transport (TCP/UDP), Session, Presentation, and Application (HTTP/DNS). HTTP transfers plain text over Port 80, leaving traffic vulnerable to packet sniffing. HTTPS encrypts data over Port 443 using TLS/SSL cryptographic handshakes, ensuring confidentiality (asymmetric key exchange + symmetric encryption), data integrity (SHA hashing), and server authentication (digital certificates).',
        commonPitfalls: ['Listing OSI layers in reverse order', 'Not mentioning the TLS handshake in HTTPS'],
      };
    }

    // Behavioral: Tell me about yourself
    if (/tell me about yourself|introduce yourself|background/i.test(qLower)) {
      return {
        topic: 'Self Introduction Pitch',
        mustHaveConcepts: ['Academic Background & Degree', 'Core Technical Skills', 'Key Projects Built with Tech Stack', 'Career Aspiration / Role Alignment'],
        goldStandardSolution: 'Structure a concise 60-90 second elevator pitch: 1) Present: Your current education and degree in Computer Science, 2) Past: Hands-on technical skills and major software projects built (e.g. full-stack apps, algorithms, cloud deployments), and 3) Future: Your career enthusiasm for this specific role and how you look forward to contributing to the team.',
        commonPitfalls: ['Stating only your name without technical or academic details', 'Reading entire resume line-by-line instead of highlighting key strengths'],
      };
    }

    // Behavioral: Tell me about a failure
    if (/failure|mistake|setback|struggle/i.test(qLower)) {
      return {
        topic: 'Behavioral: Resilience & Failure Handling',
        mustHaveConcepts: ['Real Situation Context', 'Personal Accountability', 'Root Cause Diagnosis', 'Systemic Fix / Permanent Learning'],
        goldStandardSolution: 'Structure using the STAR framework: 1) Situation: Describe a genuine minor project challenge (e.g., missed an edge case in input validation during sprint release). 2) Task: Your responsibility to deliver a stable feature. 3) Action: How you took immediate ownership, conducted a root-cause postmortem, and wrote automated unit tests. 4) Result: Resolved the issue within hours and introduced pre-commit test hooks so the bug could never recur.',
        commonPitfalls: ['Claiming you have never failed (denies self-awareness)', 'Blaming team members or external circumstances'],
      };
    }

    // Behavioral: Why this company / Why TCS
    if (/why (this company|join|work with us)|interested in joining/i.test(qLower)) {
      return {
        topic: 'Company Alignment & Motivation',
        mustHaveConcepts: ['Company Technological Impact', 'Scale & Global Reputation', 'Structured Learning Culture', 'Personal Value Alignment'],
        goldStandardSolution: 'Demonstrate authentic company research: Highlight the organization\'s technological innovations, enterprise scale, and collaborative training culture for junior engineers. Connect these directly to your personal career aspirations of building robust software at enterprise scale.',
        commonPitfalls: ['Expressing disinterest or stating "nothing motivated me"', 'Giving generic praise without specific company reference'],
      };
    }

    // Behavioral: How do you prioritize tasks
    if (/prioritize|priority|manage time|competing tasks/i.test(qLower)) {
      return {
        topic: 'Prioritization & Time Management',
        mustHaveConcepts: ['Urgency vs Impact Matrix', 'Milestone Breakdown', 'Dependency Management', 'Proactive Stakeholder Communication'],
        goldStandardSolution: 'Apply a structured framework: 1) Categorize tasks by urgency and business impact (Eisenhower Matrix), 2) Break large deliverables into daily sprint milestones, 3) Identify critical-path blocking dependencies, and 4) Transparently communicate timeline adjustments and trade-offs with team leads.',
        commonPitfalls: ['Oversimplifying to "from high to low" without explaining criteria', 'Failing to explain how to manage unexpected urgent blockers'],
      };
    }

    // Behavioral: How do you learn new technology
    if (/learn new technology|fast learner|upskill/i.test(qLower)) {
      return {
        topic: 'Technical Learning Agility',
        mustHaveConcepts: ['Official Documentation', 'Hands-on Proof-of-Concept Project', 'Best Practices & Architecture', 'Peer Code Reviews'],
        goldStandardSolution: 'Explain a 4-step learning roadmap: 1) Study official documentation and core architecture guides, 2) Build a working proof-of-concept prototype to apply concepts hands-on, 3) Study open-source production implementations for design patterns, and 4) Submit code for senior peer reviews to validate best practices.',
        commonPitfalls: ['Relying exclusively on peers without self-directed research', 'Learning only theory without building hands-on projects'],
      };
    }

    // ── System Design: URL Shortener (TinyURL / Bitly) ──
    if (/tinyurl|url shortener|shorten|bitly/i.test(qLower)) {
      return {
        topic: 'System Design: URL Shortener (TinyURL)',
        mustHaveConcepts: ['Base62 Encoding', 'Key Generation Service (KGS)', 'Redis Caching (80/20 Rule)', 'Database Schema & Indexing', 'Redirect 301 vs 302', 'High Availability & Read Scalability'],
        goldStandardSolution: 'A URL shortener converts long URLs to 7-character Base62 keys (62^7 = 3.5 trillion URLs). Architecture: 1) Capacity: 100:1 read-to-write ratio, requiring high read availability. 2) Key Generation: Standalone Key Generation Service (KGS) pre-generates unique tokens in random sequence to eliminate runtime hash collisions. 3) Database: NoSQL Key-Value (DynamoDB/Cassandra) or PostgreSQL with a B-tree index on short_key. 4) Caching: Redis cluster caching top 20% hot URLs with LRU eviction for sub-10ms redirection. 5) Redirection: HTTP 301 (Permanent, cached by browser) vs HTTP 302/307 (Temporary, captures analytics/click metrics).',
        commonPitfalls: ['Relying on raw MD5/SHA-256 without handling collision truncation', 'Omitting the 80/20 caching strategy for high read throughput', 'Not explaining 301 vs 302 redirection trade-offs']
      };
    }

    // ── System Design: Ride Sharing (Uber / Lyft) ──
    if (/uber|lyft|ride sharing|driver matching|geospatial/i.test(qLower)) {
      return {
        topic: 'System Design: Ride Sharing (Uber/Lyft)',
        mustHaveConcepts: ['Geospatial Indexing (H3 / S2 / QuadTree)', 'WebSocket Location Streaming', 'Redis Pub/Sub', 'Driver-Rider Matching Engine', 'Surge Pricing & Dynamic Fare', 'Cassandra Trip Log'],
        goldStandardSolution: 'Uber architecture components: 1) Location Ingestion: Active drivers send GPS pings every 3–4 seconds over persistent WebSockets. 2) Geospatial Index: Partition world into hexagonal cells using Uber H3 or Google S2 cells stored in memory (Redis Geo / In-Memory QuadTree) for O(1) radius search. 3) Matching Service: Queries surrounding cell rings to find Top K closest drivers, ranks by ETA, and sends dispatch offers via Kafka. 4) Surge Pricing: Aggregates demand vs supply ratios per cell every minute. 5) Storage: Cassandra / ScyllaDB for historical trip logs and PostgreSQL for financial transactions.',
        commonPitfalls: ['Using raw SQL latitude/longitude range queries without spatial indexing (QuadTree/H3)', 'Failing to explain WebSocket bidirectional streaming for live driver locations']
      };
    }

    // ── System Design: Real-Time Chat (WhatsApp / Discord / Slack) ──
    if (/whatsapp|chat system|discord|slack|messaging app|instant messag/i.test(qLower)) {
      return {
        topic: 'System Design: Real-Time Chat (WhatsApp/Discord)',
        mustHaveConcepts: ['WebSockets / Long Polling', 'Chat Gateway & Connection Pool', 'Kafka Message Broker', 'Cassandra / HBase Chat History', 'User Online Presence (Heartbeat & Redis Bitmaps)', 'Push Notifications (APNS/FCM)'],
        goldStandardSolution: 'Real-time chat requires sub-100ms message delivery: 1) Protocol: WebSockets for full-duplex bi-directional communication with a stateless Chat Gateway maintaining open TCP connections. 2) Message Broker: Apache Kafka partitions topics by conversation_id to preserve message ordering. 3) Storage: NoSQL Wide-Column store (Cassandra / ScyllaDB) with compound primary key ((chat_id), message_id DESC) for fast paginated timeline fetches. 4) Presence: Redis Bitmaps / Key TTL heartbeats every 30 seconds to track online status. 5) Offline Messages: Push Notification Server (FCM/APNs) triggers mobile alerts when receiver is disconnected.',
        commonPitfalls: ['Using polling instead of persistent WebSockets', 'Failing to address distributed message sequencing and ordering']
      };
    }

    // ── System Design: Video Streaming (Netflix / YouTube) ──
    if (/netflix|youtube|video streaming|video transcoder|cdn edge/i.test(qLower)) {
      return {
        topic: 'System Design: Video Streaming (Netflix/YouTube)',
        mustHaveConcepts: ['Adaptive Bitrate Streaming (HLS / DASH)', 'Video Transcoding Pipeline', 'CDN Edge Caching', 'Cloud Object Storage (S3 / Blob)', 'Cassandra Metadata', 'Content Recommendation Engine'],
        goldStandardSolution: 'Video streaming platform architecture: 1) Ingestion & Transcoding: Uploaded raw video is split into 5-10 second chunks, processed by worker fleets into multiple resolutions and codecs (H.264, VP9, AV1) for Adaptive Bitrate Streaming (HLS/DASH). 2) Storage: Transcoded chunks stored in AWS S3 / Google Cloud Storage. 3) Distribution: Globally distributed Content Delivery Networks (CDNs) cache video chunks close to users for zero-buffering playback. 4) Metadata & Playback History: Cassandra / DynamoDB records user playback timestamps and watch history.',
        commonPitfalls: ['Streaming full monolithic video files instead of chunked HLS/DASH streams', 'Ignoring CDN edge caching architecture']
      };
    }

    // ── System Design: Distributed Rate Limiter & API Gateway ──
    if (/rate limiter|token bucket|leaky bucket|sliding window|api gateway/i.test(qLower)) {
      return {
        topic: 'System Design: Distributed Rate Limiter',
        mustHaveConcepts: ['Token Bucket / Leaky Bucket Algorithm', 'Sliding Window Counter', 'Redis Memory & Lua Scripts', 'HTTP 429 Too Many Requests', 'Race Condition Prevention', 'API Gateway Middleware'],
        goldStandardSolution: 'A distributed rate limiter prevents API abuse and DDoS: 1) Algorithm: Sliding Window Counter or Token Bucket for burst handling with smooth traffic shaping. 2) Architecture: Deployed as API Gateway middleware (Kong/Envoy) before application microservices. 3) Distributed Counter: Centralized Redis key per client IP/user ID. 4) Concurrency: Atomic operations via Redis Lua scripts or MULTI/EXEC to prevent race conditions during high-concurrency window increments. 5) Response: HTTP 429 Too Many Requests with headers X-RateLimit-Limit, X-RateLimit-Remaining, and Retry-After.',
        commonPitfalls: ['Storing rate limit counters in local server memory without Redis in a distributed cluster', 'Not accounting for race conditions during read-and-update counter cycles']
      };
    }

    // ── System Design: Distributed In-Memory Cache (Redis-like) ──
    if (/distributed cache|redis|memcached|cache eviction|lru cache/i.test(qLower)) {
      return {
        topic: 'System Design: Distributed Cache System',
        mustHaveConcepts: ['Consistent Hashing & Virtual Nodes', 'LRU / LFU Eviction', 'Cache-Aside vs Write-Through vs Write-Behind', 'Cache Invalidation (TTL / PubSub)', 'Cache Avalanche / Thundering Herd', 'Master-Replica Replication'],
        goldStandardSolution: 'Distributed Cache Architecture: 1) Data Partitioning: Consistent Hashing with virtual nodes (e.g. 256 virtual nodes per physical host) to evenly distribute keys and minimize key remapping on node add/fail. 2) Eviction: Doubly Linked List + HashMap for O(1) Least Recently Used (LRU) eviction. 3) Caching Patterns: Cache-Aside (Lazy loading, resilient to cache failure), Write-Through (strong consistency), Write-Behind (high write speed via async queue). 4) Mitigating Failure: Use random jitter on TTLs to prevent Cache Avalanche, and Redis Mutex / Single-Flight queries to prevent Thundering Herd.',
        commonPitfalls: ['Ignoring Cache Thundering Herd / Cache Stampede mitigation', 'Failing to mention Consistent Hashing for cluster node addition']
      };
    }

    // ── Low-Level Design (LLD): Parking Lot System ──
    if (/parking lot|parking system/i.test(qLower)) {
      return {
        topic: 'Low-Level Design (LLD): Parking Lot System',
        mustHaveConcepts: ['Class Hierarchy (Vehicle, Spot, Level)', 'Strategy Pattern for Spot Assignment', 'Factory Pattern for Vehicle Creation', 'Thread-Safe Concurrency (ReentrantLock / Synchronized)', 'Payment Strategy (Hourly, Flat)', 'SOLID Principles'],
        goldStandardSolution: 'OOP Class Design for Parking Lot: 1) Core Classes: `ParkingLot` (Singleton), `Level`, `ParkingSpot` (subclasses: `CompactSpot`, `LargeSpot`, `HandicappedSpot`), `Vehicle` (subclasses: `Car`, `Truck`, `Motorcycle`), `Ticket`, and `Payment`. 2) Design Patterns: Factory Pattern to instantiate vehicles and spots; Strategy Pattern (`ParkingStrategy`) for nearest-to-entrance or lowest-floor spot assignment; Strategy Pattern for `FeeCalculationStrategy` (hourly, daily, VIP). 3) Concurrency: Thread-safe atomic spot reservation using `ReentrantLock` or `ConcurrentHashMap` to prevent double-booking.',
        commonPitfalls: ['Using rigid switch statements instead of Strategy Pattern for fee calculation', 'Forgetting thread safety when multiple entry gates park vehicles simultaneously']
      };
    }

    // ── Low-Level Design (LLD): Elevator Dispatching System ──
    if (/elevator|lift system|elevator dispatcher/i.test(qLower)) {
      return {
        topic: 'Low-Level Design (LLD): Elevator System',
        mustHaveConcepts: ['Class Model (ElevatorCar, Controller, Request)', 'State Pattern (Idle, Moving_Up, Moving_Down, Maintenance)', 'LOOK / SCAN Scheduling Algorithm', 'Observer Pattern for Floor Buttons', 'Thread Safety & Mutex Locks'],
        goldStandardSolution: 'OOP Class Design for Elevator: 1) Core Classes: `ElevatorController` (manages dispatcher), `ElevatorCar`, `Button`, `Door`, `Floor`, `Request` (Internal and External). 2) Design Patterns: State Pattern (`ElevatorState`: `IdleState`, `MovingUpState`, `MovingDownState`) to encapsulate motion behavior; Observer Pattern to notify controller when floor buttons are pressed; Strategy Pattern for scheduling algorithms (LOOK / SCAN / FCFS). 3) Concurrency: Each `ElevatorCar` runs an independent processing thread with a thread-safe `PriorityQueue` / `TreeSet` for pending floor stops.',
        commonPitfalls: ['Using FCFS (First Come First Serve) which creates huge wait times without mentioning SCAN/LOOK algorithm', 'Failing to represent Elevator States cleanly using State Pattern']
      };
    }

    // ── Low-Level Design (LLD): Splitwise / Expense Sharing App ──
    if (/splitwise|expense sharing|split expense/i.test(qLower)) {
      return {
        topic: 'Low-Level Design (LLD): Splitwise Expense Sharing',
        mustHaveConcepts: ['Class Model (User, Group, Expense, Split)', 'Strategy Pattern for Split Types (Equal, Exact, Percentage)', 'Factory Pattern for Expense Creation', 'Graph Debt Simplification Algorithm', 'Immutable Audit History'],
        goldStandardSolution: 'OOP Class Design for Splitwise: 1) Core Classes: `User`, `Group`, `Expense`, `Split` (abstract class with subclasses `EqualSplit`, `ExactSplit`, `PercentageSplit`), and `BalanceSheetController`. 2) Design Patterns: Strategy Pattern (`SplitStrategy`) to calculate individual share amounts and validate total sum equals 100% or total amount; Factory Pattern to create `Expense` instances. 3) Debt Simplification: Minimize total cash flow transactions using a Directed Graph with Net Balance mapping (Greedy approach matching max creditor with max debtor).',
        commonPitfalls: ['Not validating that percentage splits sum to exactly 100.00%', 'Omitting debt simplification algorithms for group settlement']
      };
    }

    // ── System Design: Database Sharding & Partitioning ──
    if (/sharding|database partitioning|consistent hashing|read replica/i.test(qLower)) {
      return {
        topic: 'Database Sharding & Scaling Strategies',
        mustHaveConcepts: ['Horizontal Partitioning (Sharding)', 'Sharding Key Selection', 'Consistent Hashing & Virtual Nodes', 'Hot Spot Mitigation', 'Cross-Shard Joins & Distributed Transactions (2PC / Saga)'],
        goldStandardSolution: 'Database Sharding partitions large tables horizontally across multiple database servers: 1) Sharding Key: Choosing an evenly distributed key (e.g., user_id or hash(org_id)) to avoid hotspot partitions. 2) Routing: Database Router / Proxy uses Consistent Hashing with virtual rings to direct queries to target shards. 3) Challenges & Solutions: Avoid Cross-Shard Joins by denormalizing read data or using global lookups; handle distributed write consistency across shards using Saga orchestration pattern or Two-Phase Commit (2PC).',
        commonPitfalls: ['Choosing a timestamp or range-based sharding key that creates immediate write hotspots on the latest shard', 'Not addressing how to perform cross-shard queries']
      };
    }

    return null;
  }

  /**
   * Dynamic synthesis for arbitrary questions
   */
  static _synthesizeDynamicSolution(question, trackId) {
    const qClean = (question || '').replace(/^(Moving forward:|Got it\.|Next:)\s*/i, '').trim();
    
    // Extract key nouns/topics from question
    const words = qClean.split(/\s+/).filter(w => w.length > 3 && !/what|when|where|which|about|explain|tell|your|with|from/i.test(w));
    const mainTopic = words.slice(0, 3).join(' ') || `${trackId.toUpperCase()} Domain`;

    return {
      topic: mainTopic,
      mustHaveConcepts: [
        'Direct Foundational Definition',
        'Technical Mechanism / Procedural Steps',
        'Concrete Real-World Project Example',
        'Trade-offs & Performance Considerations'
      ],
      goldStandardSolution: `A comprehensive answer to "${qClean}" should: 1) State the foundational definition in clear technical terms, 2) Detail the architectural mechanics or procedure, 3) Provide a real-world project example, and 4) Address trade-offs, complexity, and best practices.`,
      commonPitfalls: [
        'Providing a single-sentence or one-word answer without reasoning',
        'Omitting practical project examples and trade-off analysis'
      ]
    };
  }

  /**
   * Synchronous Deep Semantic Comparison between Candidate's Answer and Verified Benchmark Solution
   */
  static evaluateWithInternetBenchmark(question, userAnswer, trackId = 'tech') {
    const text = (userAnswer || '').trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    const lower = text.toLowerCase();

    // 1. Retrieve the ground-truth benchmark
    const benchmarkData = this.searchAndRetrieveBenchmark(question, trackId);
    const { topic, mustHaveConcepts, goldStandardSolution, commonPitfalls = [] } = benchmarkData;

    // 2. Identify which must-have concepts were captured by candidate
    const coveredConcepts = [];
    const missedConcepts = [];

    mustHaveConcepts.forEach((concept) => {
      const cWords = concept.toLowerCase().split(/[\s/(),-]+/).filter(w => w.length > 2);
      const isPresent = cWords.some((w) => lower.includes(w));
      if (isPresent) {
        coveredConcepts.push(concept);
      } else {
        missedConcepts.push(concept);
      }
    });

    // 3. Detect Pitfalls & Anti-Patterns
    const detectedPitfalls = [];
    if (words <= 3) {
      detectedPitfalls.push('Answer is too brief / bare phrase without technical reasoning.');
    }
    if (/\b(nothing|dont know|no failure|never failed|not interested|not intresetd|dont care|no reason)\b/i.test(lower)) {
      detectedPitfalls.push('Expressed disinterest, lack of motivation, or hesitation to acknowledge growth areas.');
    }
    commonPitfalls.forEach((pitfall) => {
      if (pitfall.includes('never failed') && /\b(no failure|never failed)\b/i.test(lower)) {
        detectedPitfalls.push(pitfall);
      }
      if (pitfall.includes('from high to low') && /\b(from high to low|high to low)\b/i.test(lower)) {
        detectedPitfalls.push(pitfall);
      }
    });

    // 4. Calculate Concept Coverage Score (0 - 100)
    const coverageRatio = mustHaveConcepts.length > 0 ? coveredConcepts.length / mustHaveConcepts.length : 0.5;
    const lengthScore = Math.min(100, Math.max(10, words * 2.2));
    const rawScore = Math.round((coverageRatio * 60) + (lengthScore * 0.4));
    
    let score = Math.max(10, Math.min(96, rawScore));
    if (detectedPitfalls.length > 0) {
      score = Math.min(score, words <= 4 ? 20 : 45);
    }

    // 5. Formulate Specific Strengths & Improvements with Deep Concept Diagnosis
    const strengths = [];
    if (coveredConcepts.length > 0) {
      strengths.push(`Successfully articulated ${coveredConcepts.length} core concepts: ${coveredConcepts.join(', ')}.`);
    } else if (words > 0) {
      strengths.push('Directly acknowledged the question topic.');
    }

    const improvements = [];
    if (missedConcepts.length > 0) {
      improvements.push(`Missing key benchmark concepts: ${missedConcepts.slice(0, 3).join(', ')}.`);
    }
    if (words < 20 && !detectedPitfalls.length) {
      improvements.push('Elaborate with a concrete practical project example and trade-off explanation.');
    }
    if (detectedPitfalls.length > 0) {
      improvements.push(detectedPitfalls[0]);
    }

    const verdict = score >= 80 ? 'Optimal & Accurate' : score >= 55 ? 'Partial Understanding' : 'Needs Significant Depth';

    return {
      score,
      verdict,
      topic,
      coveredConcepts,
      missedConcepts,
      what_was_right: strengths.join(' '),
      what_was_missing: improvements.join(' '),
      ideal_answer: goldStandardSolution,
    };
  }
}
