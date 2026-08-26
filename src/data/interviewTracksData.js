/**
 * NeuroPrep 12-Track Interview Matrix & Evaluation Engine
 * Complete track configurations, specialized user input fields, and 8-point rubric matrices.
 */

export const INTERVIEW_TRACKS = [
  {
    id: 'hr',
    name: 'HR Interview',
    desc: 'Personality, communication and cultural fit evaluation.',
    tags: ['Confidence', 'Communication', 'STAR', 'Culture Fit'],
    persona: { name: 'MAYA', title: 'HR Talent Lead' },
    stages: ['Introduction', 'Background', 'Experience', 'Behavioral', 'Career Goals', 'Company Fit', 'Final'],
    evaluationMatrix: [
      { id: 'culture_fit', label: 'Cultural & Company Fit', color: '#111827', desc: 'Alignment with target company core values and workplace culture' },
      { id: 'communication', label: 'Communication & Clarity', color: '#111827', desc: 'Clear articulation, active listening, and structured responses' },
      { id: 'eq', label: 'Emotional Intelligence (EQ)', color: '#111827', desc: 'Self-awareness, empathy, and interpersonal workplace handling' },
      { id: 'growth_mindset', label: 'Growth Mindset & Curiosity', color: '#111827', desc: 'Continuous learning, openness to feedback, and resilience' },
      { id: 'career_goals', label: 'Career Motivation & Ambition', color: '#111827', desc: 'Clarity of 3-5 year vision and alignment with the target role' },
      { id: 'demeanor', label: 'Professional Demeanor', color: '#111827', desc: 'Executive presence, poise, and professional confidence' },
      { id: 'authenticity', label: 'Authenticity & Honesty', color: '#111827', desc: 'Genuine self-reflection and candid sharing of past experiences' },
      { id: 'ethics', label: 'Ethics & Value Alignment', color: '#111827', desc: 'Integrity, workplace ethics, and collaborative decision-making' }
    ]
  },
  {
    id: 'tech',
    name: 'Technical Interview',
    desc: 'Core CS subjects, OOP, DBMS, OS, Networks and more.',
    tags: ['Java', 'Python', 'DBMS', 'OS', 'Networks'],
    persona: { name: 'ALEX', title: 'Technical Specialist' },
    stages: ['Introduction', 'Language Deep Dive', 'OOP & Design', 'DBMS & SQL', 'OS & Concurrency', 'Networking', 'Wrap-up'],
    evaluationMatrix: [
      { id: 'cs_fundamentals', label: 'Core CS Fundamentals', color: '#111827', desc: 'Solid grasp of fundamental computer science theory and abstractions' },
      { id: 'oop_architecture', label: 'OOP & Class Design', color: '#111827', desc: 'Encapsulation, inheritance, polymorphism, and composition patterns' },
      { id: 'dbms_sql', label: 'Database & SQL Knowledge', color: '#111827', desc: 'ACID transactions, indexing mechanisms, normalization, and queries' },
      { id: 'os_concurrency', label: 'OS & Thread Concurrency', color: '#111827', desc: 'Processes, threads, deadlocks, memory management, and context switching' },
      { id: 'networking', label: 'Networking & Protocols', color: '#111827', desc: 'TCP/IP, HTTP/2, DNS, WebSockets, and network security' },
      { id: 'tech_accuracy', label: 'Technical Precision', color: '#111827', desc: 'Accuracy in technical terminology, syntax, and conceptual definitions' },
      { id: 'tradeoff_reasoning', label: 'Trade-off Analysis', color: '#111827', desc: 'Ability to evaluate pros/cons of architectural and implementation choices' },
      { id: 'explanation_clarity', label: 'Explanation Structure', color: '#111827', desc: 'Structured, easy-to-follow technical communication and analogies' }
    ]
  },
  {
    id: 'dsa',
    name: 'DSA & Coding Interview',
    desc: 'Data structures, algorithms, complexity analysis, live coding, and AI code review.',
    tags: ['DSA', 'Live Coding', 'Test Cases', 'Complexity'],
    persona: { name: 'ARIA', title: 'DSA Evaluator' },
    stages: ['Warm-up', 'Problem Formulation', 'Approach & Proof', 'Live Coding', 'Complexity Analysis', 'Edge Cases & Optimization'],
    evaluationMatrix: [
      { id: 'problem_understanding', label: 'Problem Understanding', color: '#111827', desc: 'Ability to dissect problem constraints, I/O specifications, and requirements' },
      { id: 'algo_selection', label: 'Algorithm Selection', color: '#111827', desc: 'Choosing the optimal algorithmic paradigm (Two Pointers, DP, Greedy, BFS/DFS)' },
      { id: 'data_structures', label: 'Data Structure Mastery', color: '#111827', desc: 'Effective use of HashMaps, Trees, Heaps, Stacks, Queues, and Graphs' },
      { id: 'time_complexity', label: 'Time Complexity (Big-O)', color: '#111827', desc: 'Mathematical analysis of runtime and asymptotic worst-case bounds' },
      { id: 'space_complexity', label: 'Space Complexity (Big-O)', color: '#111827', desc: 'Auxiliary memory tracking, recursion call stack, and in-place optimization' },
      { id: 'edge_cases', label: 'Edge Case Handling', color: '#111827', desc: 'Handling empty inputs, overflow, single elements, duplicates, and boundary values' },
      { id: 'code_quality', label: 'Code Quality & Clean Syntax', color: '#111827', desc: 'Readability, modular functions, variable naming, and idiomatic conventions' },
      { id: 'test_validation', label: 'Test Case Validation', color: '#111827', desc: 'Dry-running with custom examples and methodical bug identification' }
    ]
  },
  {
    id: 'system_design',
    name: 'System Design & Architecture (HLD & LLD)',
    desc: 'Scalable distributed systems architecture, low-level design, SOLID principles, and design patterns.',
    tags: ['Scalability', 'HLD', 'LLD', 'SOLID', 'Distributed Systems'],
    persona: { name: 'DANIEL', title: 'System Architect' },
    stages: ['Requirements & Scope', 'Capacity Estimation', 'High-Level Design', 'Data Model & DB', 'Low-Level Design', 'Bottlenecks & Caching', 'Fault Tolerance'],
    evaluationMatrix: [
      { id: 'req_gathering', label: 'Requirements & Scope', color: '#111827', desc: 'Clarifying functional/non-functional requirements and calculating scale estimates' },
      { id: 'hld_architecture', label: 'High-Level Architecture (HLD)', color: '#111827', desc: 'Microservices layout, Load Balancers, API Gateways, and Message Brokers' },
      { id: 'lld_solid', label: 'Low-Level Design & SOLID', color: '#111827', desc: 'Class hierarchy, SOLID principles, Design Patterns, and schema design' },
      { id: 'db_sharding', label: 'Data Modeling & Sharding', color: '#111827', desc: 'SQL vs NoSQL selection, read replicas, sharding keys, and consistency models' },
      { id: 'scalability', label: 'Scalability & Throughput', color: '#111827', desc: 'Handling millions of QPS, horizontal scaling, and stateless compute' },
      { id: 'caching_queues', label: 'Caching & Async Queues', color: '#111827', desc: 'Redis/Memcached eviction, write-through/behind, and Kafka/RabbitMQ decoupling' },
      { id: 'resilience', label: 'Fault Tolerance & SPOF', color: '#111827', desc: 'Circuit breakers, rate limiting, health checks, and cross-region disaster recovery' },
      { id: 'tradeoff_depth', label: 'Trade-off Justification', color: '#111827', desc: 'CAP theorem navigation, latency vs consistency, and cost vs performance' }
    ]
  },
  {
    id: 'behavioral',
    name: 'Behavioral & Managerial Interview',
    desc: 'STAR method based evaluation of professional behaviour, leadership, team management, delegation, and stakeholder handling.',
    tags: ['STAR', 'Leadership', 'Delegation', 'Conflict', 'Management'],
    persona: { name: 'SARAH', title: 'Senior Engineering Manager' },
    stages: ['Context Setting', 'Situation & Task', 'Action & Ownership', 'Result & Metrics', 'Leadership Dilemmas', 'Conflict & People', 'Wrap-up'],
    evaluationMatrix: [
      { id: 'star_situation', label: 'Situation & Task Framing (S/T)', color: '#111827', desc: 'Crisp articulation of the background challenge, project context, and objectives' },
      { id: 'star_action', label: 'Action & Personal Ownership (A)', color: '#111827', desc: 'Highlighting personal contributions, proactive problem-solving, and initiatives' },
      { id: 'star_result', label: 'Result & Business Impact (R)', color: '#111827', desc: 'Quantifiable outcomes, metrics improved, percentages, and delivered impact' },
      { id: 'leadership', label: 'Leadership & Mentorship', color: '#111827', desc: 'Guiding teammates, fostering positive culture, and taking initiative' },
      { id: 'conflict_res', label: 'Conflict Resolution', color: '#111827', desc: 'Handling disagreements constructively, de-escalating tension, and alignment' },
      { id: 'delegation', label: 'Delegation & Prioritization', color: '#111827', desc: 'Managing workload trade-offs, scoping, and effective task allocation' },
      { id: 'stakeholder_mgmt', label: 'Stakeholder Management', color: '#111827', desc: 'Managing cross-functional relationships with Product, QA, and Clients' },
      { id: 'self_reflection', label: 'Self-Reflection & Growth', color: '#111827', desc: 'Learning from mistakes, accepting critical feedback, and emotional maturity' }
    ]
  },
  {
    id: 'gd',
    name: 'Group Discussion',
    desc: 'AI-driven group discussion with moderated rounds.',
    tags: ['Speaking', 'Leadership', 'Debate', 'Collaboration'],
    persona: { name: 'MODERATOR', title: 'GD Lead Facilitator' },
    stages: ['Topic Introduction', 'Opening Stances', 'Rebuttal Round', 'Collaborative Consensus', 'Synthesis & Summary'],
    evaluationMatrix: [
      { id: 'topic_depth', label: 'Content Depth & Topical Knowledge', color: '#111827', desc: 'Understanding core issues, current industry trends, and substantiated points' },
      { id: 'argument_structure', label: 'Argument Formulation', color: '#111827', desc: 'Logical flow, clear thesis statements, and persuasive reasoning' },
      { id: 'active_listening', label: 'Active Listening & Rebuttals', color: '#111827', desc: 'Building on others’ inputs, constructive counter-arguments, and respect' },
      { id: 'group_leadership', label: 'Facilitation & Leadership', color: '#111827', desc: 'Guiding discussion back on track, encouraging quiet members, and initiative' },
      { id: 'vocal_clarity', label: 'Vocal Clarity & Modulation', color: '#111827', desc: 'Audible volume, tone variation, confident cadence, and articulation' },
      { id: 'confidence_presence', label: 'Confidence & Body Language', color: '#111827', desc: 'Poised presence, steady eye contact, and professional composure' },
      { id: 'persuasion', label: 'Persuasion & Influence', color: '#111827', desc: 'Winning consensus through diplomatic, evidence-backed arguments' },
      { id: 'time_management', label: 'Time & Turn Management', color: '#111827', desc: 'Optimal speaking duration without dominating or remaining silent' }
    ]
  },
  {
    id: 'communication',
    name: 'Communication Interview',
    desc: 'Fluency, grammar, pronunciation and speaking speed analysis.',
    tags: ['Fluency', 'Grammar', 'Vocabulary', 'Pronunciation', 'Pacing'],
    persona: { name: 'ELENA', title: 'Executive Voice & Comms Coach' },
    stages: ['Self Pitch', 'Technical Explanation', 'Spontaneous Scenario', 'Vocabulary & Pronunciation', 'Executive Summary'],
    evaluationMatrix: [
      { id: 'fluency_articulation', label: 'Fluency & Articulation', color: '#111827', desc: 'Smooth, unbroken speech delivery without hesitation or abrupt pauses' },
      { id: 'grammar_structure', label: 'Grammar & Syntax', color: '#111827', desc: 'Accurate verb tenses, subject-verb agreement, and complex sentences' },
      { id: 'vocabulary_diction', label: 'Vocabulary & Diction', color: '#111827', desc: 'Rich professional phrasing, domain precision, and elimination of slang' },
      { id: 'pronunciation', label: 'Pronunciation & Phrasing', color: '#111827', desc: 'Clear enunciation of technical terms and natural syllable stress' },
      { id: 'speaking_speed', label: 'Pacing & Rhythm (130-150 WPM)', color: '#111827', desc: 'Controlled speaking rate avoiding rushed delivery or dragging' },
      { id: 'filler_control', label: 'Filler Word Elimination', color: '#111827', desc: 'Minimizing "um", "ah", "like", "you know", and vocal fillers' },
      { id: 'executive_presence', label: 'Executive Presence', color: '#111827', desc: 'Confident vocal projection, clarity under scrutiny, and poise' },
      { id: 'listening_response', label: 'Active Comprehension', color: '#111827', desc: 'Direct, focused answers that match the exact nuance of questions' }
    ]
  },
  {
    id: 'ai_ml',
    name: 'AI / ML Interview',
    desc: 'Transformers, LLMs, RAG, fine-tuning and vector databases.',
    tags: ['LLM', 'CNN', 'RAG', 'RL', 'Transformers', 'PyTorch'],
    persona: { name: 'NOVA', title: 'Principal AI/ML Scientist' },
    stages: ['ML Fundamentals', 'Deep Learning & CNNs', 'Transformers & Attention', 'LLMs, RAG & Vector DBs', 'Model Evaluation & MLOps'],
    evaluationMatrix: [
      { id: 'ml_theory', label: 'ML Foundations & Mathematics', color: '#111827', desc: 'Linear algebra, gradient descent, bias-variance trade-off, and loss functions' },
      { id: 'deep_learning', label: 'Deep Learning & Neural Networks', color: '#111827', desc: 'Backpropagation, activation functions, CNNs, and vanishing gradients' },
      { id: 'transformers', label: 'Transformers & Self-Attention', color: '#111827', desc: 'Query-Key-Value attention, multi-head mechanisms, and positional encoding' },
      { id: 'llm_rag', label: 'LLMs, RAG & Vector Search', color: '#111827', desc: 'Cosine similarity, chunking strategies, embeddings, and context window optimization' },
      { id: 'finetuning', label: 'Fine-Tuning & Prompt Engineering', color: '#111827', desc: 'LoRA, QLoRA, instruction tuning, RLHF, and few-shot prompting' },
      { id: 'eval_metrics', label: 'Model Evaluation & Validation', color: '#111827', desc: 'Precision, Recall, F1, ROC-AUC, BLEU, ROUGE, and perplexity' },
      { id: 'mlops', label: 'MLOps & Model Deployment', color: '#111827', desc: 'Model registry, ONNX/TensorRT inference, data drift, and serving scale' },
      { id: 'practical_problem', label: 'Applied AI Problem Solving', color: '#111827', desc: 'Formulating business requirements into robust AI/ML architectures' }
    ]
  },
  {
    id: 'devops',
    name: 'DevOps Interview',
    desc: 'Docker, Kubernetes, CI/CD, Jenkins and monitoring.',
    tags: ['Docker', 'K8s', 'CI/CD', 'Terraform', 'Prometheus'],
    persona: { name: 'SOREN', title: 'Lead DevOps Architect' },
    stages: ['Linux & Networking', 'Containerization (Docker)', 'Kubernetes Orchestration', 'CI/CD Pipelines', 'IaC (Terraform)', 'Monitoring & SRE'],
    evaluationMatrix: [
      { id: 'docker_containers', label: 'Containerization (Docker)', color: '#111827', desc: 'Dockerfile optimization, multi-stage builds, cgroups, and container networking' },
      { id: 'k8s_orchestration', label: 'Kubernetes Orchestration', color: '#111827', desc: 'Pods, Deployments, Services, Ingress, HPA, ConfigMaps, and StatefulSets' },
      { id: 'cicd_automation', label: 'CI/CD Pipeline Design', color: '#111827', desc: 'GitHub Actions, Jenkins, automated testing, artifact caching, and release gates' },
      { id: 'iac_terraform', label: 'Infrastructure as Code (Terraform)', color: '#111827', desc: 'HCL modules, remote state management, drift detection, and idempotency' },
      { id: 'observability', label: 'Monitoring & Observability', color: '#111827', desc: 'Prometheus, Grafana, ELK stack, distributed tracing, and SLA alerting' },
      { id: 'cloud_infra', label: 'Cloud & Linux Networking', color: '#111827', desc: 'VPC, subnets, iptables, DNS resolution, and security groups' },
      { id: 'deployment_strategies', label: 'Zero-Downtime Deployments', color: '#111827', desc: 'Blue-Green, Canary rollouts, rolling updates, and rollback strategies' },
      { id: 'devsecops', label: 'DevSecOps & Secrets Management', color: '#111827', desc: 'Vault, image vulnerability scanning (Trivy), SAST/DAST, and IAM' }
    ]
  },
  {
    id: 'cloud',
    name: 'Cloud Interview',
    desc: 'AWS, Azure, GCP, serverless, IAM and cloud networking.',
    tags: ['AWS', 'Azure', 'GCP', 'Serverless', 'Cloud Architect'],
    persona: { name: 'MARCUS', title: 'Principal Cloud Architect' },
    stages: ['Cloud Architecture', 'Compute & Serverless', 'Storage & Databases', 'Networking & VPC', 'IAM & Security', 'Cost & Multi-Cloud'],
    evaluationMatrix: [
      { id: 'cloud_patterns', label: 'Cloud Architecture Patterns', color: '#111827', desc: 'Well-Architected Framework: Reliability, Performance, and Security pillars' },
      { id: 'compute_serverless', label: 'Compute & Serverless Architecture', color: '#111827', desc: 'EC2, Lambda, ECS/Fargate, Azure Functions, and event-driven triggers' },
      { id: 'storage_database', label: 'Storage & Cloud Databases', color: '#111827', desc: 'S3, EBS, RDS Aurora, DynamoDB, CosmosDB, and lifecycle policies' },
      { id: 'iam_security', label: 'IAM Policies & Cloud Security', color: '#111827', desc: 'Least privilege, role assumption, KMS encryption, and Security Hub' },
      { id: 'vpc_networking', label: 'VPC & Cloud Networking', color: '#111827', desc: 'Subnets, NAT Gateways, Route Tables, Transit Gateway, and Direct Connect' },
      { id: 'ha_scalability', label: 'High Availability & Auto-Scaling', color: '#111827', desc: 'Multi-AZ deployments, ALB target groups, and global CDN caching' },
      { id: 'cost_finops', label: 'Cost Optimization (FinOps)', color: '#111827', desc: 'Reserved Instances, Savings Plans, Spot instances, and resource right-sizing' },
      { id: 'dr_backup', label: 'Disaster Recovery & Backup', color: '#111827', desc: 'RPO/RTO calculation, cross-region replication, and automated failover' }
    ]
  },
  {
    id: 'cybersec',
    name: 'Cybersecurity Interview',
    desc: 'OWASP, encryption, firewalls and incident response.',
    tags: ['OWASP', 'Encryption', 'SOC', 'PenTesting', 'IAM'],
    persona: { name: 'CIPHER', title: 'Lead Security Operations Engineer' },
    stages: ['Threat Modeling', 'OWASP Top 10', 'Cryptography & PKI', 'Network Security', 'SOC & Incident Response', 'Compliance & IAM'],
    evaluationMatrix: [
      { id: 'threat_modeling', label: 'Threat Modeling & Risk Analysis', color: '#111827', desc: 'STRIDE framework, attack surface mapping, and risk prioritization' },
      { id: 'owasp_web', label: 'OWASP Top 10 & AppSec', color: '#111827', desc: 'SQLi, XSS, CSRF, SSRF, Broken Object Level Auth, and secure headers' },
      { id: 'crypto_pki', label: 'Cryptography & Data Protection', color: '#111827', desc: 'AES-256, RSA, TLS 1.3 handshakes, hashing algorithms, and PKI certificates' },
      { id: 'network_defense', label: 'Network Defense & Firewalls', color: '#111827', desc: 'WAF rules, DDoS mitigation, IDS/IPS, zero-trust network access' },
      { id: 'soc_incident', label: 'SOC Operations & Incident Response', color: '#111827', desc: 'SIEM log correlation, forensics, containment, and MITRE ATT&CK framework' },
      { id: 'iam_auth', label: 'IAM, OAuth 2.0 & Zero Trust', color: '#111827', desc: 'MFA enforcement, JWT security, OAuth PKCE flows, and RBAC/ABAC' },
      { id: 'vuln_pentest', label: 'Vulnerability Assessment & PenTesting', color: '#111827', desc: 'Burp Suite, CVE patching, ethical hacking methodologies, and remediation' },
      { id: 'compliance', label: 'Governance & Compliance Standards', color: '#111827', desc: 'SOC 2, ISO 27001, GDPR, HIPAA, and security audit readiness' }
    ]
  },
  {
    id: 'qa',
    name: 'QA / Testing Interview',
    desc: 'Manual and automation testing, Selenium, Cypress and API testing.',
    tags: ['Selenium', 'Cypress', 'Postman', 'API Testing', 'Automation'],
    persona: { name: 'VERA', title: 'Principal QA Test Architect' },
    stages: ['Test Strategy', 'UI Automation (Selenium/Cypress)', 'API & Integration Testing', 'Defect Management', 'Performance & Load Testing'],
    evaluationMatrix: [
      { id: 'test_strategy', label: 'Test Strategy & Test Plan Design', color: '#111827', desc: 'Test pyramid, coverage matrices, traceability, and acceptance criteria' },
      { id: 'ui_automation', label: 'UI Automation Frameworks', color: '#111827', desc: 'Page Object Model (POM), Selenium WebDrivers, Cypress, Playwright, and locators' },
      { id: 'api_testing', label: 'API Testing & Validation', color: '#111827', desc: 'Postman, REST Assured, JSON schema assertion, status codes, and mock servers' },
      { id: 'defect_lifecycle', label: 'Bug Reporting & Defect Lifecycle', color: '#111827', desc: 'Root cause analysis, reproduction steps, severity vs priority, and Jira tracking' },
      { id: 'boundary_analysis', label: 'Boundary Value & Edge Testing', color: '#111827', desc: 'Equivalence partitioning, stress edge cases, and exploratory testing' },
      { id: 'performance_load', label: 'Performance & Load Testing', color: '#111827', desc: 'JMeter, k6, throughput, response time latency, and bottleneck diagnosis' },
      { id: 'code_assertions', label: 'Test Code Quality & Assertions', color: '#111827', desc: 'Clean test scripts, parameterized data-driven tests, and robust assertions' },
      { id: 'cicd_qa', label: 'CI/CD Test Pipeline Integration', color: '#111827', desc: 'Automated test suite execution in Jenkins/GitHub Actions on PR merges' }
    ]
  }
];

export function getTrackConfig(trackId) {
  const normId = String(trackId || 'hr').toLowerCase();
  const found = INTERVIEW_TRACKS.find(t => t.id === normId || (normId === 'cybersecurity' && t.id === 'cybersec') || (normId === 'group_discussion' && t.id === 'gd') || (normId === 'coding' && t.id === 'dsa'));
  return found || INTERVIEW_TRACKS[0];
}
