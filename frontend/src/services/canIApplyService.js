/**
 * Can I Apply? — Intelligence Evaluation Service
 * Evaluates candidate readiness against target employer requirements across
 * 4 distinct, unmixed dimensions:
 * 1. Eligibility Check (CGPA vs cutoff, degree, graduation year, backlogs, branch)
 * 2. Technical Readiness % (DSA, Core CS, System Design)
 * 3. Profile Readiness % (Projects, GitHub depth, Resume ATS score, Stack alignment)
 * 4. Interview Readiness % (Communication, HR behavioral, Mock history)
 */

export const COMPANY_BENCHMARK_PROFILES = {
  microsoft: {
    name: "Microsoft",
    slug: "microsoft",
    tier: "Tier-1 Product",
    minCgpa: 7.5,
    preferredCgpa: 8.0,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "M.S.", "Dual Degree", "MCA"],
    allowedBranches: ["CS/IT", "Circuit Branches", "ECE", "EEE", "Maths & Computing"],
    targetDsaScore: 85,
    targetCoreCsScore: 80,
    targetSystemDesignScore: 75,
    targetProjectScore: 75,
    targetResumeAtsScore: 82,
    targetResumeScore: 82,
    targetCommunicationScore: 75,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 78,
    primaryLanguage: "C# / C++ / Java",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["Java", "C#", "C++", "Data Structures", "Algorithms", "Object-Oriented Design", "SQL"],
    preferredSkills: ["Azure", "Distributed Systems", "Cloud Computing", "Kafka", "Microservices"],
    dsaKeyTopics: ["Binary Trees & BST", "Linked Lists", "Dynamic Programming", "Graphs", "Strings & Arrays"],
    coreCsKeyTopics: ["Operating Systems (Threads, Memory)", "DBMS & Transactions", "Computer Networks (TCP/IP)", "OOP Principles"],
    behavioralPillars: ["Growth Mindset", "Customer Empathy", "One Microsoft Collaboration", "Handling Failure"],
    careersUrl: "https://careers.microsoft.com",
    avgPackageLpa: 44,
  },
  google: {
    name: "Google",
    slug: "google",
    tier: "Tier-1 Big Tech",
    minCgpa: 8.0,
    preferredCgpa: 8.5,
    minTenthPct: 75,
    minTwelfthPct: 75,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "M.S.", "Dual Degree", "PhD", "MCA"],
    allowedBranches: ["All Branches", "CS/IT", "ECE", "EEE", "Mechanical", "Civil"],
    targetDsaScore: 90,
    targetCoreCsScore: 85,
    targetSystemDesignScore: 80,
    targetProjectScore: 80,
    targetResumeAtsScore: 85,
    targetResumeScore: 85,
    targetCommunicationScore: 80,
    targetBehavioralScore: 85,
    targetMockInterviewScore: 82,
    primaryLanguage: "C++ / Java / Python / Go",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["C++", "Java", "Python", "Go", "Algorithms", "Data Structures", "Big-O Optimization"],
    preferredSkills: ["Distributed Systems", "GCP", "Kubernetes", "gRPC", "Concurrency"],
    dsaKeyTopics: ["Graph Algorithms (Dijkstra, Topological Sort)", "2D Dynamic Programming", "Trie & Advanced Trees", "Binary Search Variations"],
    coreCsKeyTopics: ["Concurrency & Multithreading", "Memory Management", "Distributed Storage & Spanner", "Network Protocols"],
    behavioralPillars: ["Googliness", "10x Thinking", "Intellectual Humility", "Thriving in Ambiguity"],
    careersUrl: "https://careers.google.com",
    avgPackageLpa: 45,
  },
  amazon: {
    name: "Amazon",
    slug: "amazon",
    tier: "Tier-1 Cloud & E-Commerce",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "MCA", "Dual Degree"],
    allowedBranches: ["All Engineering Branches"],
    targetDsaScore: 82,
    targetCoreCsScore: 78,
    targetSystemDesignScore: 75,
    targetProjectScore: 75,
    targetResumeAtsScore: 80,
    targetResumeScore: 80,
    targetCommunicationScore: 75,
    targetBehavioralScore: 85,
    targetMockInterviewScore: 80,
    primaryLanguage: "Java / C++",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["Java", "C++", "Object-Oriented Design", "Data Structures", "Algorithms", "SQL"],
    preferredSkills: ["AWS (DynamoDB, SQS, S3)", "Microservices", "Spring Boot", "Distributed Caching"],
    dsaKeyTopics: ["Trees & Binary Search Trees", "Priority Queue & Heaps (Top-K)", "BFS/DFS & Connected Components", "Sliding Window"],
    coreCsKeyTopics: ["OOP & Design Patterns", "Database Indexing & ACID", "REST APIs & Microservices", "Operating Systems"],
    behavioralPillars: ["Customer Obsession", "Ownership", "Bias for Action", "Dive Deep & Deliver Results (16 LPs)"],
    careersUrl: "https://amazon.jobs",
    avgPackageLpa: 38,
  },
  uber: {
    name: "Uber",
    slug: "uber",
    tier: "Tier-1 High Scale",
    minCgpa: 8.0,
    preferredCgpa: 8.5,
    minTenthPct: 75,
    minTwelfthPct: 75,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "Dual Degree"],
    allowedBranches: ["CS/IT", "Circuit Branches"],
    targetDsaScore: 88,
    targetCoreCsScore: 82,
    targetSystemDesignScore: 80,
    targetProjectScore: 80,
    targetResumeAtsScore: 82,
    targetResumeScore: 82,
    targetCommunicationScore: 78,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 80,
    primaryLanguage: "Go / Java / Python",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["Go", "Java", "Python", "Distributed Systems", "Data Structures", "Algorithms"],
    preferredSkills: ["Kafka", "Redis", "Cassandra", "gRPC", "Geospatial Indexing (H3)"],
    dsaKeyTopics: ["Geospatial & 2D Grid Algorithms", "Heaps & Real-time Priority Queues", "Graph Shortest Paths (Dijkstra, A*)", "Trie & Prefix Matching"],
    coreCsKeyTopics: ["Distributed Systems (CAP theorem)", "Event Streaming with Kafka", "Locking & Concurrency", "Database Sharding"],
    behavioralPillars: ["Trip Obsessed", "Go Get It", "Operational Resilience", "Blameless Post-Mortems"],
    careersUrl: "https://www.uber.com/careers",
    avgPackageLpa: 48,
  },
  atlassian: {
    name: "Atlassian",
    slug: "atlassian",
    tier: "Tier-1 Product",
    minCgpa: 8.0,
    preferredCgpa: 8.5,
    minTenthPct: 75,
    minTwelfthPct: 75,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "Dual Degree", "MCA"],
    allowedBranches: ["CS/IT", "ECE"],
    targetDsaScore: 85,
    targetCoreCsScore: 82,
    targetSystemDesignScore: 80,
    targetProjectScore: 80,
    targetResumeAtsScore: 82,
    targetResumeScore: 82,
    targetCommunicationScore: 80,
    targetBehavioralScore: 82,
    targetMockInterviewScore: 80,
    primaryLanguage: "Java / React / TypeScript",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["Java", "React", "TypeScript", "Data Structures", "Algorithms", "System Design"],
    preferredSkills: ["GraphQL", "Micro-frontends", "AWS", "Design Systems", "Web Performance"],
    dsaKeyTopics: ["Arrays & Hash Maps", "Trees & Recursion", "Intervals & Greedy Algorithms", "Dynamic Programming"],
    coreCsKeyTopics: ["Web Security & Auth", "Database Normalization & SQL", "REST API Contract Design", "Event Architecture"],
    behavioralPillars: ["Open Company No Bullshit", "Build with Heart & Balance", "Don't #@!% the Customer", "Play as a Team"],
    careersUrl: "https://www.atlassian.com/company/careers",
    avgPackageLpa: 52,
  },
  stripe: {
    name: "Stripe",
    slug: "stripe",
    tier: "Tier-1 FinTech Global",
    minCgpa: 7.5,
    preferredCgpa: 8.0,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "Dual Degree", "MCA"],
    allowedBranches: ["All Engineering Branches"],
    targetDsaScore: 85,
    targetCoreCsScore: 85,
    targetSystemDesignScore: 85,
    targetProjectScore: 85,
    targetResumeAtsScore: 84,
    targetResumeScore: 84,
    targetCommunicationScore: 82,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 82,
    primaryLanguage: "Java / Go / Ruby",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["Java", "Go", "Ruby", "PostgreSQL", "Idempotency", "Distributed Transactions"],
    preferredSkills: ["High Availability (99.999%)", "Kafka", "Redis", "Security & Encryption"],
    dsaKeyTopics: ["Practical Machine Coding", "Data Structure Design (LRU, Rate Limiter)", "String Parsing & Formatting", "Concurrency"],
    coreCsKeyTopics: ["ACID Guarantees & Isolation Levels", "Idempotency & Deduplication", "API Backward Compatibility", "Network Security"],
    behavioralPillars: ["Move Rigorously", "Users First", "Intellectual Honesty", "Efficiency & Frugality"],
    careersUrl: "https://stripe.com/jobs",
    avgPackageLpa: 45,
  },
  razorpay: {
    name: "Razorpay",
    slug: "razorpay",
    tier: "FinTech Unicorn",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "MCA"],
    allowedBranches: ["All Engineering Branches"],
    targetDsaScore: 80,
    targetCoreCsScore: 80,
    targetSystemDesignScore: 75,
    targetProjectScore: 78,
    targetResumeAtsScore: 80,
    targetResumeScore: 80,
    targetCommunicationScore: 75,
    targetBehavioralScore: 78,
    targetMockInterviewScore: 76,
    primaryLanguage: "Node.js / Go / PHP",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["Node.js", "Go", "PHP", "MySQL", "Kafka", "Redis", "REST APIs"],
    preferredSkills: ["UPI Switch Architecture", "Docker", "AWS", "Microservices", "PCI-DSS"],
    dsaKeyTopics: ["Hash Tables & Two Pointers", "Stacks & Queues", "Trees & Graphs", "Dynamic Programming Fundamentals"],
    coreCsKeyTopics: ["Relational Database Indexing", "Message Queues & Event Processing", "HTTP Protocols & Security", "OOP & Design Patterns"],
    behavioralPillars: ["Customer First", "Transparency", "High Ownership", "Bold Innovation"],
    careersUrl: "https://razorpay.com/jobs",
    avgPackageLpa: 26,
  },
  meta: {
    name: "Meta",
    slug: "meta",
    tier: "Tier-1 Big Tech",
    minCgpa: 7.5,
    preferredCgpa: 8.2,
    minTenthPct: 75,
    minTwelfthPct: 75,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "PhD", "MCA"],
    allowedBranches: ["All Engineering Branches"],
    targetDsaScore: 92,
    targetCoreCsScore: 85,
    targetSystemDesignScore: 85,
    targetProjectScore: 82,
    targetResumeAtsScore: 85,
    targetResumeScore: 85,
    targetCommunicationScore: 80,
    targetBehavioralScore: 82,
    targetMockInterviewScore: 85,
    primaryLanguage: "C++ / Python / React",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["C++", "Python", "React", "PyTorch", "Algorithms", "Data Structures"],
    preferredSkills: ["Distributed Systems", "Graph Databases (TAO)", "High-speed Bug-free Coding", "System Design"],
    dsaKeyTopics: ["Binary Search Variations", "Tree & Graph LCA/BFS/DFS", "Subarrays & Interval Merging", "Topological Sort"],
    coreCsKeyTopics: ["Scalable Feed Architecture", "Graph Data Structures", "Caching Layers & Memory", "Distributed Consensus"],
    behavioralPillars: ["Move Fast", "Focus on Long-Term Impact", "Build Awesome Things", "Be Direct & Respectful"],
    careersUrl: "https://metacareers.com",
    avgPackageLpa: 48,
  },
  adobe: {
    name: "Adobe",
    slug: "adobe",
    tier: "Tier-1 Product",
    minCgpa: 7.5,
    preferredCgpa: 8.2,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "MCA"],
    allowedBranches: ["CS/IT", "ECE", "EEE", "Math & Computing"],
    targetDsaScore: 85,
    targetCoreCsScore: 80,
    targetSystemDesignScore: 78,
    targetProjectScore: 78,
    targetResumeAtsScore: 80,
    targetResumeScore: 80,
    targetCommunicationScore: 75,
    targetBehavioralScore: 78,
    targetMockInterviewScore: 78,
    primaryLanguage: "C++ / Java",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["C++", "Java", "Data Structures", "Algorithms", "Operating Systems"],
    preferredSkills: ["Cloud Infrastructure", "Kubernetes", "Image Processing / Graphics", "Machine Learning"],
    dsaKeyTopics: ["Strings & Pattern Matching", "Binary Trees & BST", "Dynamic Programming", "Bit Manipulation"],
    coreCsKeyTopics: ["Operating Systems & Memory", "OOPs & Solid Principles", "Computer Networks", "DBMS"],
    behavioralPillars: ["Genuine", "Exceptional", "Innovative", "Involved"],
    careersUrl: "https://www.adobe.com/careers.html",
    avgPackageLpa: 40,
  },
  flipkart: {
    name: "Flipkart",
    slug: "flipkart",
    tier: "Tier-1 Product",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "MCA"],
    allowedBranches: ["All Engineering Branches"],
    targetDsaScore: 82,
    targetCoreCsScore: 80,
    targetSystemDesignScore: 78,
    targetProjectScore: 75,
    targetResumeAtsScore: 80,
    targetResumeScore: 80,
    targetCommunicationScore: 75,
    targetBehavioralScore: 78,
    targetMockInterviewScore: 78,
    primaryLanguage: "Java / Spring Boot",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["Java", "Spring Boot", "MySQL", "Kafka", "Data Structures", "Algorithms"],
    preferredSkills: ["Elasticsearch", "MongoDB", "Distributed Caching", "Machine Coding"],
    dsaKeyTopics: ["Trees & Graphs", "Dynamic Programming", "Machine Coding / Low Level Design", "Heaps"],
    coreCsKeyTopics: ["Low Level Design (LLD)", "Design Patterns (Factory, Strategy, Observer)", "Database Indexing", "Concurrency"],
    behavioralPillars: ["Customer First", "Audacity", "Bias for Action", "Integrity"],
    careersUrl: "https://www.flipkartcareers.com",
    avgPackageLpa: 32,
  },
  swiggy: {
    name: "Swiggy",
    slug: "swiggy",
    tier: "Tier 2 Unicorn",
    minCgpa: 6.5,
    preferredCgpa: 7.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "MCA"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 80,
    targetCoreCsScore: 78,
    targetSystemDesignScore: 75,
    targetProjectScore: 78,
    targetResumeAtsScore: 78,
    targetResumeScore: 78,
    primaryLanguage: "Java / Golang",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 75,
    requiredSkills: ["Java", "Spring Boot", "MySQL", "Kafka", "Redis"],
    preferredSkills: ["Microservices", "Docker", "Elasticsearch", "AWS"],
    dsaKeyTopics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "Priority Queues"],
    coreCsKeyTopics: ["Microservices Architecture", "Caching Strategies", "REST APIs", "Database Optimization"],
    behavioralPillars: ["Consumer Comes First", "Always Be Curious", "Stand Shoulder to Shoulder", "Display Bias for Action"],
    careersUrl: "https://careers.swiggy.com",
    avgPackageLpa: 26,
  },
  zomato: {
    name: "Zomato",
    slug: "zomato",
    tier: "Tier 2 Unicorn",
    minCgpa: 6.5,
    preferredCgpa: 7.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "BCA", "MCA"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 78,
    targetCoreCsScore: 75,
    targetSystemDesignScore: 75,
    targetProjectScore: 80,
    targetResumeAtsScore: 78,
    targetResumeScore: 78,
    primaryLanguage: "React / Node.js / Python",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 75,
    requiredSkills: ["React", "Node.js", "Python", "PostgreSQL", "Next.js"],
    preferredSkills: ["Redis", "Docker", "Tailwind CSS", "A/B Testing"],
    dsaKeyTopics: ["Arrays & Two Pointers", "Trees", "Sorting & Searching", "Dynamic Programming"],
    coreCsKeyTopics: ["Full Stack Architecture", "Server Side Rendering", "API Integration", "Database Design"],
    behavioralPillars: ["Extreme Ownership", "Speed of Execution", "Simplification", "Product First"],
    careersUrl: "https://www.zomato.com/careers",
    avgPackageLpa: 25,
  },
  tcs: {
    name: "TCS",
    slug: "tcs",
    tier: "IT Services / Global Delivery",
    minCgpa: 6.0,
    preferredCgpa: 7.0,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 1,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "BCA", "MCA", "B.Sc (IT/CS)"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 65,
    targetCoreCsScore: 70,
    targetSystemDesignScore: 60,
    targetProjectScore: 65,
    targetResumeAtsScore: 75,
    targetResumeScore: 75,
    primaryLanguage: "Java / Python / C",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 70,
    requiredSkills: ["Java", "Python", "C", "SQL", "OOP Concepts"],
    preferredSkills: ["Spring Boot", "HTML/CSS/JS", "Git", "Cloud Basics"],
    dsaKeyTopics: ["Arrays & Strings", "Basic Data Structures", "Recursion", "Searching & Sorting"],
    coreCsKeyTopics: ["DBMS & Basic SQL Queries", "OOPs Concepts (Inheritance, Polymorphism)", "Computer Networks Basics", "SDLC"],
    behavioralPillars: ["Integrity", "Excellence", "Respect for Individual", "Learning Agility"],
    careersUrl: "https://www.tcs.com/careers",
    avgPackageLpa: 9,
  },
  tcsdigital: {
    name: "TCS Digital / Prime",
    slug: "tcsdigital",
    tier: "IT Services - High Tier",
    minCgpa: 7.0,
    preferredCgpa: 7.5,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "BCA", "MCA", "B.Sc (IT/CS)"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 75,
    targetCoreCsScore: 75,
    targetSystemDesignScore: 70,
    targetProjectScore: 72,
    targetResumeAtsScore: 78,
    targetResumeScore: 78,
    primaryLanguage: "Java / Python / C++",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 72,
    requiredSkills: ["Java", "Python", "C++", "SQL", "Data Structures", "OOP Concepts"],
    preferredSkills: ["Cloud", "Full Stack", "Spring Boot", "Git"],
    dsaKeyTopics: ["Trees & Graphs", "Dynamic Programming Fundamentals", "String Parsing"],
    coreCsKeyTopics: ["DBMS & Transactions", "Operating Systems", "Computer Networks"],
    behavioralPillars: ["Integrity", "Excellence", "Continuous Learning"],
    careersUrl: "https://www.tcs.com/careers",
    avgPackageLpa: 9,
  },
  tcsninja: {
    name: "TCS Ninja",
    slug: "tcsninja",
    tier: "IT Services",
    minCgpa: 6.0,
    preferredCgpa: 6.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 1,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "BCA", "MCA", "B.Sc (IT/CS)"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 60,
    targetCoreCsScore: 65,
    targetSystemDesignScore: 55,
    targetProjectScore: 60,
    targetResumeAtsScore: 70,
    targetResumeScore: 70,
    primaryLanguage: "C / Java / Python",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 70,
    targetBehavioralScore: 70,
    targetMockInterviewScore: 65,
    requiredSkills: ["C", "Java", "Python", "Basic SQL"],
    preferredSkills: ["HTML/CSS", "JavaScript"],
    dsaKeyTopics: ["Arrays & Strings", "Basic Searching & Sorting"],
    coreCsKeyTopics: ["Basic OOP", "Basic DBMS", "SDLC"],
    behavioralPillars: ["Integrity", "Learning Agility"],
    careersUrl: "https://www.tcs.com/careers",
    avgPackageLpa: 3.8,
  },
  infosys: {
    name: "Infosys",
    slug: "infosys",
    tier: "IT Services / Global Delivery",
    minCgpa: 6.0,
    preferredCgpa: 7.0,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 2,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "BCA", "MCA", "B.Sc (IT/CS)"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 65,
    targetCoreCsScore: 70,
    targetSystemDesignScore: 60,
    targetProjectScore: 65,
    targetResumeAtsScore: 75,
    targetResumeScore: 75,
    primaryLanguage: "Java / Python / C++",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 70,
    requiredSkills: ["Java", "Python", "C++", "SQL", "Data Structures Basics"],
    preferredSkills: ["Spring Boot", "React", "Cloud Fundamentals"],
    dsaKeyTopics: ["Arrays & Strings", "Stacks & Queues", "Linked Lists", "Basic Trees"],
    coreCsKeyTopics: ["DBMS & SQL Joins", "OOP Principles", "Operating Systems Basics", "Software Engineering"],
    behavioralPillars: ["Client Value", "Leadership by Example", "Integrity & Transparency", "Excellence"],
    careersUrl: "https://www.infosys.com/careers.html",
    avgPackageLpa: 9.5,
  },
  infosyssp: {
    name: "Infosys DSE / SP",
    slug: "infosyssp",
    tier: "IT Services - High Tier",
    minCgpa: 6.5,
    preferredCgpa: 7.2,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "BCA", "MCA"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 78,
    targetCoreCsScore: 75,
    targetSystemDesignScore: 70,
    targetProjectScore: 72,
    targetResumeAtsScore: 78,
    targetResumeScore: 78,
    primaryLanguage: "Java / Python",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 72,
    requiredSkills: ["Java", "Python", "Algorithms", "Data Structures", "Database Management"],
    preferredSkills: ["Cloud", "Microservices", "Spring Boot"],
    dsaKeyTopics: ["Dynamic Programming", "Trees & Graphs", "Greedy Algorithms"],
    coreCsKeyTopics: ["DBMS & Transactions", "Operating Systems", "System Design Basics"],
    behavioralPillars: ["Client Value", "Innovation", "Excellence"],
    careersUrl: "https://www.infosys.com/careers.html",
    avgPackageLpa: 9.5,
  },
  goldmansachs: {
    name: "Goldman Sachs",
    slug: "goldmansachs",
    tier: "FinTech / Investment Banking",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "Dual Degree"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 88,
    targetCoreCsScore: 85,
    targetSystemDesignScore: 80,
    targetProjectScore: 78,
    targetResumeAtsScore: 82,
    targetResumeScore: 82,
    primaryLanguage: "Java / C++ / Python",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 80,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 80,
    requiredSkills: ["Java", "C++", "Python", "Data Structures", "Algorithms", "Quant & Probability"],
    preferredSkills: ["Spring Boot", "Kafka", "Low Latency Systems", "SQL"],
    dsaKeyTopics: ["Dynamic Programming", "Trees & Graphs", "Probability & Math Puzzles", "Heaps & Hash Tables"],
    coreCsKeyTopics: ["Operating Systems & Concurrency", "DBMS & SQL Query Optimization", "OOP Design Patterns", "Computer Networks"],
    behavioralPillars: ["Client Service", "Excellence", "Integrity", "Partnership"],
    careersUrl: "https://www.goldmansachs.com/careers",
    avgPackageLpa: 30,
  },
  morganstanley: {
    name: "Morgan Stanley",
    slug: "morganstanley",
    tier: "FinTech / Quant",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "Dual Degree"],
    allowedBranches: ["CS/IT", "Circuit Branches", "Maths"],
    targetDsaScore: 85,
    targetCoreCsScore: 85,
    targetSystemDesignScore: 80,
    targetProjectScore: 78,
    targetResumeAtsScore: 80,
    targetResumeScore: 80,
    primaryLanguage: "Java / C++",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 80,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 80,
    requiredSkills: ["Java", "C++", "SQL", "DBMS", "Operating Systems", "Data Structures"],
    preferredSkills: ["Spring", "Kafka", "Distributed Architecture"],
    dsaKeyTopics: ["Trees & Graphs", "Dynamic Programming", "Bit Manipulation"],
    coreCsKeyTopics: ["Database Transactions & Indexing", "Concurrency & Threads", "OOP Design Patterns"],
    behavioralPillars: ["Do the Right Thing", "Put Clients First", "Lead with Exceptional Ideas", "Commit to Diversity"],
    careersUrl: "https://www.morganstanley.com/about-us/careers",
    avgPackageLpa: 28,
  },
  cisco: {
    name: "Cisco",
    slug: "cisco",
    tier: "Tier 1 Networking",
    minCgpa: 7.0,
    preferredCgpa: 7.8,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "Dual Degree"],
    allowedBranches: ["CS/IT", "ECE", "EEE", "Telecomm"],
    targetDsaScore: 80,
    targetCoreCsScore: 85,
    targetSystemDesignScore: 75,
    targetProjectScore: 75,
    targetResumeAtsScore: 80,
    targetResumeScore: 80,
    primaryLanguage: "C / C++ / Python",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 75,
    requiredSkills: ["C", "C++", "Python", "Computer Networks", "Data Structures"],
    preferredSkills: ["Linux Kernel", "Socket Programming", "TCP/IP Stack", "Network Security"],
    dsaKeyTopics: ["Bit Manipulation", "Arrays & Linked Lists", "Trees & Graphs", "Queues & Stacks"],
    coreCsKeyTopics: ["Deep Computer Networks (OSI, TCP/UDP, BGP, Subnetting)", "Operating Systems & Memory", "C/C++ Pointers & Concurrency", "DBMS"],
    behavioralPillars: ["Connect Everything", "Innovate Everywhere", "Benefit Everyone", "High Integrity"],
    careersUrl: "https://www.cisco.com/c/en/us/about/careers.html",
    avgPackageLpa: 24,
  },
  oracle: {
    name: "Oracle",
    slug: "oracle",
    tier: "Tier 1 Enterprise & Cloud",
    minCgpa: 7.0,
    preferredCgpa: 7.5,
    minTenthPct: 65,
    minTwelfthPct: 65,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "MCA"],
    allowedBranches: ["CS/IT", "Circuit Branches"],
    targetDsaScore: 80,
    targetCoreCsScore: 82,
    targetSystemDesignScore: 75,
    targetProjectScore: 75,
    targetResumeAtsScore: 80,
    targetResumeScore: 80,
    primaryLanguage: "Java / SQL / C++",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 75,
    requiredSkills: ["Java", "C++", "SQL", "DBMS", "Data Structures"],
    preferredSkills: ["Cloud Fundamentals", "Docker", "Linux", "REST APIs"],
    dsaKeyTopics: ["Trees & BST", "Linked Lists", "Arrays & Strings", "Dynamic Programming"],
    coreCsKeyTopics: ["Deep DBMS & SQL Indexes", "Transactions & ACID", "Operating Systems", "OOP Principles"],
    behavioralPillars: ["Customer Focus", "Integrity", "Mutual Respect", "Innovation"],
    careersUrl: "https://www.oracle.com/careers",
    avgPackageLpa: 22,
  },
  wipro: {
    name: "Wipro Turbo",
    slug: "wipro",
    tier: "IT Services - High Tier",
    minCgpa: 6.5,
    preferredCgpa: 7.0,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "BCA", "MCA"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 70,
    targetCoreCsScore: 72,
    targetSystemDesignScore: 65,
    targetProjectScore: 68,
    targetResumeAtsScore: 75,
    targetResumeScore: 75,
    primaryLanguage: "Java / Python",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 72,
    targetBehavioralScore: 72,
    targetMockInterviewScore: 70,
    requiredSkills: ["Java", "Python", "Data Structures", "DBMS"],
    preferredSkills: ["Cloud Basics", "Web Dev"],
    dsaKeyTopics: ["Arrays & Strings", "Stacks & Queues", "Trees"],
    coreCsKeyTopics: ["DBMS", "OOPs", "OS Basics"],
    behavioralPillars: ["Be Passionate About Clients' Success", "Treat Each Person with Respect"],
    careersUrl: "https://careers.wipro.com",
    avgPackageLpa: 6.5,
  },
  accenture: {
    name: "Accenture Adv ASE",
    slug: "accenture",
    tier: "Consulting & IT",
    minCgpa: 6.5,
    preferredCgpa: 7.2,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "MCA"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 72,
    targetCoreCsScore: 72,
    targetSystemDesignScore: 65,
    targetProjectScore: 70,
    targetResumeAtsScore: 75,
    targetResumeScore: 75,
    primaryLanguage: "Java / Full Stack",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 75,
    targetBehavioralScore: 75,
    targetMockInterviewScore: 70,
    requiredSkills: ["Java", "Python", "SQL", "Cloud Fundamentals", "Problem Solving"],
    preferredSkills: ["Agile", "DevOps Basics", "Web Tech"],
    dsaKeyTopics: ["Data Structures Basics", "Algorithms & Logic"],
    coreCsKeyTopics: ["Cloud & Infrastructure", "Software Engineering", "DBMS"],
    behavioralPillars: ["Client Value Creation", "One Global Network", "Respect for the Individual"],
    careersUrl: "https://www.accenture.com/careers",
    avgPackageLpa: 6.5,
  },
  capgemini: {
    name: "Capgemini",
    slug: "capgemini",
    tier: "IT Services",
    minCgpa: 6.0,
    preferredCgpa: 6.5,
    minTenthPct: 60,
    minTwelfthPct: 60,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "MCA", "B.Sc"],
    allowedBranches: ["All Branches"],
    targetDsaScore: 65,
    targetCoreCsScore: 68,
    targetSystemDesignScore: 60,
    targetProjectScore: 65,
    targetResumeAtsScore: 70,
    targetResumeScore: 70,
    primaryLanguage: "Java / C++",
    eligibleGraduationYears: [2025, 2026, 2027],
    targetCommunicationScore: 72,
    targetBehavioralScore: 72,
    targetMockInterviewScore: 68,
    requiredSkills: ["Java", "C++", "C", "SQL", "OOP Concepts"],
    preferredSkills: ["Web Technologies", "Git"],
    dsaKeyTopics: ["Searching & Sorting", "Arrays & Strings", "Basic Linked Lists"],
    coreCsKeyTopics: ["DBMS", "OOP", "Computer Networks Basics"],
    behavioralPillars: ["Honesty", "Boldness", "Trust", "Freedom", "Fun"],
    careersUrl: "https://www.capgemini.com/careers",
    avgPackageLpa: 4.2,
  },
};

export const POPULAR_COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "Adobe",
  "Atlassian",
  "Stripe",
  "Goldman Sachs",
  "Salesforce",
  "NVIDIA",
  "Oracle",
  "Cisco",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Razorpay",
  "Intuit",
];

export const POPULAR_ROLES = [
  "Software Development Engineer (SDE / Core)",
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "DevOps & Cloud Platform Engineer",
  "Data Engineer & Analytics",
  "AI/ML Engineering",
  "Mobile Application Developer",
];

/**
 * Classifies a branch string into engineering, CS/IT, circuit, or non-tech
 */
export function classifyBranch(branch) {
  if (!branch || typeof branch !== "string") {
    return { isCsOrIt: false, isCircuit: false, isMathComputing: false, isEngineering: false, raw: "" };
  }
  const b = branch.toLowerCase().trim();

  const isCsOrIt =
    /\b(cs|cse|it|is|ise|swe)\b/.test(b) ||
    b.includes("computer") ||
    b.includes("information technology") ||
    b.includes("information science") ||
    b.includes("software engineering") ||
    b.includes("data science") ||
    b.includes("artificial intelligence") ||
    b.includes("machine learning") ||
    b.includes("ai & ml") ||
    b.includes("ai/ml") ||
    b.includes("cyber security") ||
    b.includes("cloud computing");

  const isMathComputing =
    /\b(mnc)\b/.test(b) ||
    b.includes("math") ||
    b.includes("computing") ||
    b.includes("computational");

  const isCircuit =
    isCsOrIt ||
    isMathComputing ||
    /\b(ece|eee|etc|eie|ee)\b/.test(b) ||
    b.includes("electronics") ||
    b.includes("electrical") ||
    b.includes("telecommunication") ||
    b.includes("telecomm") ||
    b.includes("instrumentation") ||
    b.includes("embedded") ||
    b.includes("vlsi") ||
    b.includes("microelectronics");

  const isEngineering =
    isCircuit ||
    b.includes("engineering") ||
    b.includes("b.tech") ||
    b.includes("b.e.") ||
    b.includes("mechanical") ||
    b.includes("civil") ||
    b.includes("chemical") ||
    b.includes("aerospace") ||
    b.includes("biotechnology") ||
    b.includes("production") ||
    b.includes("metallurgy") ||
    b.includes("materials") ||
    b.includes("robotics") ||
    b.includes("mechatronics") ||
    b.includes("automobile");

  return { isCsOrIt, isCircuit, isMathComputing, isEngineering, raw: b };
}

/**
 * Evaluates whether a branch fits company's allowed branches
 */
export function evaluateBranchFit(branchInfo, allowedBranches) {
  if (!allowedBranches || allowedBranches.length === 0) return true;
  if (allowedBranches.includes("All Branches")) return true;
  if (allowedBranches.includes("All Engineering Branches")) {
    return branchInfo.isEngineering || branchInfo.isCircuit || branchInfo.isCsOrIt;
  }

  return allowedBranches.some((allowed) => {
    const aLower = allowed.toLowerCase().trim();
    if (aLower === "all branches") return true;
    if (aLower === "all engineering branches") {
      return branchInfo.isEngineering || branchInfo.isCircuit || branchInfo.isCsOrIt;
    }
    if (aLower.includes("cs") || aLower.includes("it")) {
      if (branchInfo.isCsOrIt) return true;
    }
    if (aLower.includes("circuit")) {
      if (branchInfo.isCircuit) return true;
    }
    if (aLower.includes("math")) {
      if (branchInfo.isMathComputing) return true;
    }
    return branchInfo.raw.includes(aLower) || aLower.includes(branchInfo.raw);
  });
}

/**
 * Normalizes company key string for fast benchmark lookup
 */
export function normalizeCompanyKey(name) {
  if (!name || typeof name !== "string") return "microsoft";
  const raw = name.toLowerCase().trim();
  const cleaned = raw.replace(/[^a-z0-9]/g, "");

  // 1. Direct key match
  if (COMPANY_BENCHMARK_PROFILES[cleaned]) return cleaned;

  // 2. Direct slug or name match
  for (const [key, profile] of Object.entries(COMPANY_BENCHMARK_PROFILES)) {
    if (
      profile.slug?.toLowerCase() === raw ||
      profile.name?.toLowerCase() === raw ||
      profile.name?.toLowerCase().replace(/[^a-z0-9]/g, "") === cleaned
    ) {
      return key;
    }
  }

  // 3. Substring matching ordered by key length descending (prevents 'tcs' prefix matching 'tcsdigital')
  const keysByLengthDesc = Object.keys(COMPANY_BENCHMARK_PROFILES).sort((a, b) => b.length - a.length);
  for (const key of keysByLengthDesc) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return key;
    }
  }
  return "microsoft";
}

/**
 * Finds benchmark profile for given company name (falls back to calibrated Tier-1 standard)
 */
export function getCompanyBenchmark(companyName) {
  const key = normalizeCompanyKey(companyName);
  const found = COMPANY_BENCHMARK_PROFILES[key];
  if (found) {
    return {
      ...found,
      targetResumeScore: found.targetResumeScore ?? found.targetResumeAtsScore ?? 80,
      primaryLanguage: found.primaryLanguage || found.requiredSkills?.[0] || "Java / Python",
      eligibleGraduationYears: found.eligibleGraduationYears || [2025, 2026, 2027],
    };
  }

  // Generic fallback benchmark
  return {
    name: companyName || "Target Tech",
    slug: (companyName || "target-tech").toLowerCase().replace(/\s+/g, "-"),
    tier: "Tier-1 Technology",
    minCgpa: 7.5,
    preferredCgpa: 8.0,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 1,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "Dual Degree", "MCA"],
    allowedBranches: ["All Engineering Branches"],
    targetDsaScore: 82,
    targetCoreCsScore: 80,
    targetSystemDesignScore: 75,
    targetProjectScore: 75,
    targetResumeAtsScore: 80,
    targetResumeScore: 80,
    targetCommunicationScore: 75,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 78,
    primaryLanguage: "Java / Python",
    eligibleGraduationYears: [2025, 2026, 2027],
    requiredSkills: ["Java", "Python", "Data Structures", "Algorithms", "SQL", "OOP Concepts"],
    preferredSkills: ["Cloud", "Docker", "Git", "System Design"],
    dsaKeyTopics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "Heaps"],
    coreCsKeyTopics: ["Operating Systems", "DBMS", "Computer Networks", "OOPs"],
    behavioralPillars: ["Problem Solving", "Ownership", "Teamwork", "Continuous Learning"],
    careersUrl: `https://www.google.com/search?q=${encodeURIComponent((companyName || "target") + " careers")}`,
    avgPackageLpa: 30,
  };
}

/**
 * Evaluates Application Readiness across the 4 distinct, unmixed dimensions:
 * 1. Eligibility Check (Strict cutoff verification)
 * 2. Technical Readiness % (DSA, Core CS, System Design)
 * 3. Profile Readiness % (Projects, GitHub, Resume ATS, Stack alignment)
 * 4. Interview Readiness % (Communication, HR behavioral, Mock history)
 */
export function evaluateApplicationReadiness({
  targetCompany = "Microsoft",
  targetRole = "Software Development Engineer (SDE 1)",
  userProfile = null,
  academicProfile = null,
  readinessData = null,
  githubProfile = null,
  leetcodeProfile = null,
  companyIntelligence = null,
}) {
  const benchmark = getCompanyBenchmark(targetCompany);

  // If live company intelligence is available, enrich benchmark
  if (companyIntelligence) {
    if (companyIntelligence.tech_stack?.backend) {
      benchmark.requiredSkills = Array.from(
        new Set([...benchmark.requiredSkills, ...companyIntelligence.tech_stack.backend])
      );
    }
    if (companyIntelligence.core_values?.length) {
      benchmark.behavioralPillars = companyIntelligence.core_values.map((v) =>
        typeof v === "string" ? v.split(":")[0] : v
      );
    }
  }

  // -------------------------------------------------------------
  // 1. ELIGIBILITY CHECK (Strict Cutoff / Blocker dimension)
  // Precedence: latest updatedAt timestamp between userProfile and academicProfile
  // -------------------------------------------------------------
  const parseNumeric = (val) =>
    val !== null && val !== undefined && val !== "" && !isNaN(Number(val)) ? Number(val) : null;

  const userUpdated = userProfile?.updatedAt ? new Date(userProfile.updatedAt).getTime() : 0;
  const academicUpdated = academicProfile?.updatedAt ? new Date(academicProfile.updatedAt).getTime() : 0;
  const preferAcademic = academicUpdated > userUpdated;

  const rawCgpa = preferAcademic
    ? (academicProfile?.currentCgpa ?? userProfile?.cgpa ?? (readinessData?.dimensions?.academics?.score != null ? readinessData.dimensions.academics.score / 10 : null))
    : (userProfile?.cgpa ?? academicProfile?.currentCgpa ?? (readinessData?.dimensions?.academics?.score != null ? readinessData.dimensions.academics.score / 10 : null));
  const userCgpaNum = parseNumeric(rawCgpa);

  const rawActiveBacklogs = preferAcademic
    ? (academicProfile?.activeBacklogs ?? userProfile?.activeBacklogs)
    : (userProfile?.activeBacklogs ?? academicProfile?.activeBacklogs);
  const userActiveBacklogs = parseNumeric(rawActiveBacklogs);

  const rawHistoryBacklogs = preferAcademic
    ? (academicProfile?.historyOfBacklogs ?? userProfile?.historyOfBacklogs)
    : (userProfile?.historyOfBacklogs ?? academicProfile?.historyOfBacklogs);
  const userHistoryBacklogs = parseNumeric(rawHistoryBacklogs);

  const raw10th = preferAcademic
    ? (academicProfile?.tenthPercentage ?? userProfile?.tenthPercentage)
    : (userProfile?.tenthPercentage ?? academicProfile?.tenthPercentage);
  const user10th = parseNumeric(raw10th);

  const raw12th = preferAcademic
    ? (academicProfile?.twelfthPercentage ?? userProfile?.twelfthPercentage)
    : (userProfile?.twelfthPercentage ?? academicProfile?.twelfthPercentage);
  const user12th = parseNumeric(raw12th);

  const userDegree = preferAcademic
    ? ((academicProfile?.degree || userProfile?.degree || "").trim() || null)
    : ((userProfile?.degree || academicProfile?.degree || "").trim() || null);

  const userGradYear = preferAcademic
    ? parseNumeric(academicProfile?.graduationYear ?? userProfile?.graduationYear)
    : parseNumeric(userProfile?.graduationYear ?? academicProfile?.graduationYear);

  const userBranch = preferAcademic
    ? ((academicProfile?.branch || userProfile?.branch || "").trim() || null)
    : ((userProfile?.branch || academicProfile?.branch || "").trim() || null);

  // Pass checks
  const cgpaPass = userCgpaNum !== null && userCgpaNum >= benchmark.minCgpa;
  const cgpaDelta = userCgpaNum !== null ? (userCgpaNum - benchmark.minCgpa).toFixed(2) : null;

  const backlogsCount = userActiveBacklogs ?? 0;
  const historyCount = userHistoryBacklogs ?? 0;
  const backlogsPass =
    backlogsCount <= benchmark.maxActiveBacklogs &&
    historyCount <= benchmark.maxHistoryBacklogs;

  const tenthPass = user10th !== null ? user10th >= benchmark.minTenthPct : false;
  const twelfthPass = user12th !== null ? user12th >= benchmark.minTwelfthPct : false;

  // Degree fit check
  let degreePass = true;
  if (userDegree) {
    const degLower = userDegree.toLowerCase();
    degreePass =
      benchmark.allowedDegrees.some((deg) => degLower.includes(deg.toLowerCase())) ||
      degLower.includes("b.tech") ||
      degLower.includes("b.e.") ||
      degLower.includes("cs") ||
      degLower.includes("bca") ||
      degLower.includes("mca") ||
      degLower.includes("m.tech") ||
      degLower.includes("engineering");
  } else {
    degreePass = false;
  }

  // Branch fit check with robust non-CS branch classification
  let branchPass = true;
  if (userBranch) {
    const branchInfo = classifyBranch(userBranch);
    branchPass = evaluateBranchFit(branchInfo, benchmark.allowedBranches);
  } else {
    branchPass = false;
  }

  // Graduation year validation against eligible batch years
  const eligibleBatches = benchmark.eligibleGraduationYears || [2025, 2026, 2027];
  const gradYearPass = userGradYear !== null ? eligibleBatches.includes(userGradYear) : false;

  // Overall eligibility state
  const isFullyEligible =
    userCgpaNum !== null &&
    cgpaPass &&
    backlogsPass &&
    (user10th === null || tenthPass) &&
    (user12th === null || twelfthPass) &&
    degreePass &&
    branchPass &&
    (userGradYear === null || gradYearPass);

  const hasHardBlocker =
    userCgpaNum === null ||
    !cgpaPass ||
    !backlogsPass ||
    !degreePass ||
    !branchPass ||
    (userGradYear !== null && !gradYearPass);

  const eligibilityChecklist = [
    {
      id: "cgpa",
      label: "Cumulative CGPA Cutoff",
      required: `Minimum ${benchmark.minCgpa} CGPA (Preferred: ${benchmark.preferredCgpa})`,
      actual: userCgpaNum !== null ? `${userCgpaNum.toFixed(2)} CGPA` : "Not Set",
      isPassed: userCgpaNum !== null ? cgpaPass : false,
      isBlocker: userCgpaNum === null || !cgpaPass,
      statusText: userCgpaNum === null ? "Blocker 🔴" : cgpaPass ? "Eligible ✓" : "Blocker 🔴",
      detail:
        userCgpaNum === null
          ? "Academic record unassessed or CGPA is missing. Update your profile to evaluate eligibility."
          : cgpaPass
          ? `Your CGPA (${userCgpaNum.toFixed(2)}) satisfies ${benchmark.name}'s ${benchmark.minCgpa} minimum cutoff.`
          : `Your CGPA (${userCgpaNum.toFixed(2)}) is below ${benchmark.name}'s strict ${benchmark.minCgpa} cutoff (-${Math.abs(cgpaDelta)} pts deficit).`,
      fixAction: {
        label: "Calculate Target SGPA",
        url: "/app/academics",
      },
    },
    {
      id: "backlogs",
      label: "Active Standing Backlogs",
      required: `Max ${benchmark.maxActiveBacklogs} active backlogs allowed at drive time`,
      actual: `${backlogsCount} Active Backlog${backlogsCount === 1 ? "" : "s"}`,
      isPassed: backlogsPass,
      isBlocker: !backlogsPass,
      statusText: backlogsPass ? "Eligible ✓" : "Blocker 🔴",
      detail: backlogsPass
        ? `Clear academic standing verified with ${backlogsCount} active backlogs.`
        : `${backlogsCount} active backlog(s) violates ${benchmark.name}'s campus policy. Clear backlogs before applying.`,
      fixAction: {
        label: "View Academic Records",
        url: "/app/academics",
      },
    },
    {
      id: "degree",
      label: "Degree & Discipline Alignment",
      required: `${benchmark.allowedDegrees.slice(0, 3).join(" / ")} in STEM discipline`,
      actual: userDegree && userBranch ? `${userDegree} (${userBranch})` : userDegree || userBranch || "Not Configured",
      isPassed: degreePass && branchPass,
      isBlocker: !degreePass || !branchPass,
      statusText: degreePass && branchPass ? "Eligible ✓" : "Blocker 🔴",
      detail:
        !userDegree && !userBranch
          ? "Degree and branch not set in profile. Update your profile to verify alignment."
          : degreePass && branchPass
          ? `Enrolled in accredited curriculum recognized by ${benchmark.name}.`
          : !degreePass
          ? `Degree (${userDegree || "Not set"}) requires campus recruiter verification for ${benchmark.name}.`
          : `Branch (${userBranch}) is outside the eligible disciplines list (${benchmark.allowedBranches.join(", ")}) for ${benchmark.name}.`,
      fixAction: {
        label: "Update Degree in Profile",
        url: "/app/profile",
      },
    },
    {
      id: "schooling",
      label: "10th & 12th Academic Benchmark",
      required: `Min ${benchmark.minTenthPct}% in 10th & ${benchmark.minTwelfthPct}% in 12th`,
      actual: `10th: ${user10th !== null ? `${user10th}%` : "Not Set"} • 12th: ${user12th !== null ? `${user12th}%` : "Not Set"}`,
      isPassed: user10th !== null && user12th !== null ? tenthPass && twelfthPass : false,
      isBlocker: false,
      statusText:
        user10th !== null && user12th !== null && tenthPass && twelfthPass
          ? "Eligible ✓"
          : user10th === null && user12th === null
          ? "Not Set ⚪"
          : "Review 🟡",
      detail:
        user10th !== null && user12th !== null && tenthPass && twelfthPass
          ? `High school percentage benchmarks cleared.`
          : user10th === null && user12th === null
          ? `Schooling percentages not provided. Enter 10th and 12th scores in profile.`
          : `One or more secondary school scores are below benchmark (10th: ${benchmark.minTenthPct}%, 12th: ${benchmark.minTwelfthPct}%).`,
      fixAction: {
        label: "Edit Profile Info",
        url: "/app/profile",
      },
    },
    {
      id: "grad_year",
      label: "Graduation Batch Eligibility",
      required: `${eligibleBatches.join(", ")} Passout Batches for Campus / Entry Level`,
      actual: userGradYear !== null ? `Class of ${userGradYear}` : "Not Set",
      isPassed: gradYearPass,
      isBlocker: userGradYear !== null && !gradYearPass,
      statusText: userGradYear === null ? "Review 🟡" : gradYearPass ? "Eligible ✓" : "Ineligible 🔴",
      detail:
        userGradYear === null
          ? `Graduation batch not specified. Update profile to confirm cohort eligibility.`
          : gradYearPass
          ? `Your graduation cohort (${userGradYear}) is actively in recruitment scope (${eligibleBatches.join(", ")}).`
          : `Graduation cohort (${userGradYear}) is outside ${benchmark.name}'s active campus hiring window (${eligibleBatches.join(", ")}).`,
      fixAction: {
        label: "Profile Settings",
        url: "/app/profile",
      },
    },
  ];

  // -------------------------------------------------------------
  // 2. TECHNICAL READINESS % (DSA, Core CS, System Design)
  // Strictly grounded: NO ghost scores when data is unassessed
  // -------------------------------------------------------------
  let dsaDimScore = null;
  let dsaAssessed = false;
  if (readinessData?.dimensions?.dsa?.score != null && !isNaN(Number(readinessData.dimensions.dsa.score))) {
    dsaDimScore = Number(readinessData.dimensions.dsa.score);
    dsaAssessed = true;
  } else if (leetcodeProfile?.totalSolved != null && leetcodeProfile.totalSolved > 0) {
    dsaDimScore = Math.min(98, Math.round((leetcodeProfile.totalSolved / 250) * 85) + 15);
    dsaAssessed = true;
  }

  let coreCsDimScore = null;
  let coreCsAssessed = false;
  if (readinessData?.dimensions?.skills?.score != null && !isNaN(Number(readinessData.dimensions.skills.score))) {
    coreCsDimScore = Number(readinessData.dimensions.skills.score);
    coreCsAssessed = true;
  }

  let systemDesignScore = null;
  let systemDesignAssessed = false;
  if (readinessData?.dimensions?.systemDesign?.score != null && !isNaN(Number(readinessData.dimensions.systemDesign.score))) {
    systemDesignScore = Number(readinessData.dimensions.systemDesign.score);
    systemDesignAssessed = true;
  } else if (dsaAssessed && coreCsAssessed) {
    systemDesignScore = Math.round(dsaDimScore * 0.4 + coreCsDimScore * 0.6);
    systemDesignAssessed = true;
  }

  const assessedTechScores = [];
  if (dsaDimScore !== null) assessedTechScores.push({ score: dsaDimScore, weight: 0.5 });
  if (coreCsDimScore !== null) assessedTechScores.push({ score: coreCsDimScore, weight: 0.3 });
  if (systemDesignScore !== null) assessedTechScores.push({ score: systemDesignScore, weight: 0.2 });

  let technicalScore = null;
  let technicalPass = false;
  if (assessedTechScores.length > 0) {
    const totalTechWeight = assessedTechScores.reduce((sum, item) => sum + item.weight, 0);
    technicalScore = Math.round(assessedTechScores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalTechWeight);
    technicalPass = technicalScore >= benchmark.targetDsaScore - 6;
  }

  const technicalChecklist = [
    {
      id: "dsa",
      label: "Data Structures & Algorithmic Patterns",
      targetText: `Target: ${benchmark.targetDsaScore}% (${benchmark.dsaKeyTopics.slice(0, 2).join(", ")})`,
      currentScore: dsaDimScore,
      isPassed: dsaDimScore !== null && dsaDimScore >= benchmark.targetDsaScore,
      gap: dsaDimScore !== null ? Math.max(0, benchmark.targetDsaScore - dsaDimScore) : null,
      fixLink: "/app/dsa",
      fixLabel: "Practice LeetCode / DSA Sheets",
      detail:
        dsaDimScore === null
          ? "No LeetCode or DSA diagnostic completed. Connect profile or solve curated problems."
          : dsaDimScore >= benchmark.targetDsaScore
          ? `Algorithmic mastery meets ${benchmark.name}'s coding bar.`
          : `Deficit in ${benchmark.dsaKeyTopics[0]} and ${benchmark.dsaKeyTopics[1]}. Solve ~15 targeted problems.`,
    },
    {
      id: "core_cs",
      label: "Core CS Fundamentals (OS, DBMS, Networks)",
      targetText: `Target: ${benchmark.targetCoreCsScore}% (Concurrency, SQL, Protocols)`,
      currentScore: coreCsDimScore,
      isPassed: coreCsDimScore !== null && coreCsDimScore >= benchmark.targetCoreCsScore,
      gap: coreCsDimScore !== null ? Math.max(0, benchmark.targetCoreCsScore - coreCsDimScore) : null,
      fixLink: "/app/coding",
      fixLabel: "Review CS Fundamentals",
      detail:
        coreCsDimScore === null
          ? "CS fundamentals unassessed. Complete OS, DBMS, and Network assessments."
          : coreCsDimScore >= benchmark.targetCoreCsScore
          ? `Solid command of operating systems, databases, and network fundamentals.`
          : `Strengthen transaction isolation, multithreading synchronization, and TCP socket lifecycle.`,
    },
    {
      id: "system_design",
      label: "Architecture & Modular System Thinking",
      targetText: `Target: ${benchmark.targetSystemDesignScore}% (LLD & Distributed Caching)`,
      currentScore: systemDesignScore,
      isPassed: systemDesignScore !== null && systemDesignScore >= benchmark.targetSystemDesignScore,
      gap: systemDesignScore !== null ? Math.max(0, benchmark.targetSystemDesignScore - systemDesignScore) : null,
      fixLink: "/app/roadmap",
      fixLabel: "Explore Architecture Roadmap",
      detail:
        systemDesignScore === null
          ? "System design readiness not yet evaluated."
          : systemDesignScore >= benchmark.targetSystemDesignScore
          ? `Modular architecture design and clean code separation demonstrated.`
          : `Practice object-oriented machine coding and distributed rate limiting trade-offs.`,
    },
  ];

  // -------------------------------------------------------------
  // 3. PROFILE READINESS % (Projects, GitHub, Resume ATS)
  // Strictly grounded: NO ghost scores when data is unassessed
  // -------------------------------------------------------------
  let projectScore = null;
  if (githubProfile?.projectScore != null && !isNaN(Number(githubProfile.projectScore))) {
    projectScore = Number(githubProfile.projectScore);
  } else if (readinessData?.dimensions?.projects?.score != null && !isNaN(Number(readinessData.dimensions.projects.score))) {
    projectScore = Number(readinessData.dimensions.projects.score);
  } else if (githubProfile?.originalReposCount != null && githubProfile.originalReposCount > 0) {
    projectScore = Math.min(95, githubProfile.originalReposCount * 18 + 25);
  }

  let resumeAtsScore = null;
  if (userProfile?.resumeScore != null && !isNaN(Number(userProfile.resumeScore))) {
    resumeAtsScore = Number(userProfile.resumeScore);
  } else if (readinessData?.dimensions?.resume?.score != null && !isNaN(Number(readinessData.dimensions.resume.score))) {
    resumeAtsScore = Number(readinessData.dimensions.resume.score);
  }

  // Calculate stack alignment grounded in user skills
  let stackAlignmentScore = null;
  const userSkills = userProfile?.skills || userProfile?.technicalSkills || readinessData?.verifiedSkills || [];
  if (Array.isArray(userSkills) && userSkills.length > 0) {
    const userSkillsLower = userSkills.map((s) => (typeof s === "string" ? s.toLowerCase() : s.name?.toLowerCase() || ""));
    const req = benchmark.requiredSkills || [];
    if (req.length > 0) {
      const matchCount = req.filter((r) =>
        userSkillsLower.some((us) => us.includes(r.toLowerCase()) || r.toLowerCase().includes(us))
      ).length;
      stackAlignmentScore = Math.min(100, Math.max(25, Math.round((matchCount / req.length) * 100)));
    }
  }

  const assessedProfScores = [];
  if (projectScore !== null) assessedProfScores.push({ score: projectScore, weight: 0.45 });
  if (resumeAtsScore !== null) assessedProfScores.push({ score: resumeAtsScore, weight: 0.45 });
  if (stackAlignmentScore !== null) assessedProfScores.push({ score: stackAlignmentScore, weight: 0.1 });

  let profileScore = null;
  let profilePass = false;
  if (assessedProfScores.length > 0) {
    const totalProfWeight = assessedProfScores.reduce((sum, item) => sum + item.weight, 0);
    profileScore = Math.round(assessedProfScores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalProfWeight);
    profilePass = profileScore >= benchmark.targetProjectScore - 5;
  }

  const profileChecklist = [
    {
      id: "resume_ats",
      label: "Resume ATS Score & Google XYZ Metrics",
      targetText: `Target: ${benchmark.targetResumeAtsScore}%+ ATS Score`,
      currentScore: resumeAtsScore,
      isPassed: resumeAtsScore !== null && resumeAtsScore >= benchmark.targetResumeAtsScore,
      gap: resumeAtsScore !== null ? Math.max(0, benchmark.targetResumeAtsScore - resumeAtsScore) : null,
      fixLink: "/app/resume",
      fixLabel: "Tailor Resume with Google XYZ",
      detail:
        resumeAtsScore === null
          ? "Resume ATS score not yet evaluated. Upload your resume for automated screening audit."
          : resumeAtsScore >= benchmark.targetResumeAtsScore
          ? `ATS keyword distribution and quantifiable metric bullet points pass screening.`
          : `Resume ATS score (${resumeAtsScore}%) is below target (${benchmark.targetResumeAtsScore}%). Add action verbs and quantifiable metrics.`,
    },
    {
      id: "projects",
      label: "GitHub Codebases & Production Projects",
      targetText: `Target: ${benchmark.targetProjectScore}% (2+ Full-Stack / Systems Repos)`,
      currentScore: projectScore,
      isPassed: projectScore !== null && projectScore >= benchmark.targetProjectScore,
      gap: projectScore !== null ? Math.max(0, benchmark.targetProjectScore - projectScore) : null,
      fixLink: "/app/development",
      fixLabel: "Connect GitHub / Deploy Projects",
      detail:
        projectScore === null
          ? "GitHub portfolio unlinked or unassessed. Connect your GitHub account to verify repos."
          : projectScore >= benchmark.targetProjectScore
          ? `Verified active repositories with clean commits and production architecture.`
          : `Add live demo URLs, Docker compose configs, and comprehensive README documentation to top repositories.`,
    },
    {
      id: "skills_match",
      label: "Required Technology Stack Match",
      targetText: `Stack: ${benchmark.requiredSkills.slice(0, 4).join(", ")}`,
      currentScore: stackAlignmentScore,
      isPassed: stackAlignmentScore !== null && stackAlignmentScore >= 75,
      gap: stackAlignmentScore !== null ? Math.max(0, 75 - stackAlignmentScore) : null,
      fixLink: "/app/roadmap",
      fixLabel: "Tech Stack Learning Path",
      detail:
        stackAlignmentScore === null
          ? "Technical skills profile empty. Add your core languages and frameworks in profile."
          : stackAlignmentScore >= 75
          ? `Your profile demonstrates foundational alignment with ${benchmark.name}'s primary technologies.`
          : `Add required technologies (${benchmark.requiredSkills.slice(0, 3).join(", ")}) to your profile projects.`,
    },
  ];

  // -------------------------------------------------------------
  // 4. INTERVIEW READINESS % (Communication, HR behavioral, Mock history)
  // Strictly grounded: NO ghost scores when data is unassessed
  // -------------------------------------------------------------
  let communicationScore = null;
  if (readinessData?.dimensions?.communication?.score != null && !isNaN(Number(readinessData.dimensions.communication.score))) {
    communicationScore = Number(readinessData.dimensions.communication.score);
  }

  let behavioralScore = null;
  if (readinessData?.dimensions?.interview?.score != null && !isNaN(Number(readinessData.dimensions.interview.score))) {
    behavioralScore = Number(readinessData.dimensions.interview.score);
  }

  let mockHistoryScore = null;
  if (readinessData?.dimensions?.mockInterview?.score != null && !isNaN(Number(readinessData.dimensions.mockInterview.score))) {
    mockHistoryScore = Number(readinessData.dimensions.mockInterview.score);
  }

  const assessedIntScores = [];
  if (communicationScore !== null) assessedIntScores.push({ score: communicationScore, weight: 0.4 });
  if (behavioralScore !== null) assessedIntScores.push({ score: behavioralScore, weight: 0.4 });
  if (mockHistoryScore !== null) assessedIntScores.push({ score: mockHistoryScore, weight: 0.2 });

  let interviewScore = null;
  let interviewPass = false;
  if (assessedIntScores.length > 0) {
    const totalIntWeight = assessedIntScores.reduce((sum, item) => sum + item.weight, 0);
    interviewScore = Math.round(assessedIntScores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalIntWeight);
    interviewPass = interviewScore >= benchmark.targetBehavioralScore - 6;
  }

  const interviewChecklist = [
    {
      id: "behavioral",
      label: `Company Culture & Values (${benchmark.behavioralPillars[0]})`,
      targetText: `Target: ${benchmark.targetBehavioralScore}% (${benchmark.behavioralPillars.slice(0, 2).join(", ")})`,
      currentScore: behavioralScore,
      isPassed: behavioralScore !== null && behavioralScore >= benchmark.targetBehavioralScore,
      gap: behavioralScore !== null ? Math.max(0, benchmark.targetBehavioralScore - behavioralScore) : null,
      fixLink: `/app/hr-prep?company=${benchmark.slug}`,
      fixLabel: "Open HR & Culture Studio",
      detail:
        behavioralScore === null
          ? "Behavioral readiness unassessed. Practice STAR responses calibrated for company values."
          : behavioralScore >= benchmark.targetBehavioralScore
          ? `Strong STAR-formatted behavioral narratives tailored for ${benchmark.name}.`
          : `Prepare 2 STAR stories demonstrating ${benchmark.behavioralPillars[0]} and ${benchmark.behavioralPillars[1]}.`,
    },
    {
      id: "communication",
      label: "Technical Articulation & Speech Fluency",
      targetText: `Target: ${benchmark.targetCommunicationScore}% Spoken Clarity`,
      currentScore: communicationScore,
      isPassed: communicationScore !== null && communicationScore >= benchmark.targetCommunicationScore,
      gap: communicationScore !== null ? Math.max(0, benchmark.targetCommunicationScore - communicationScore) : null,
      fixLink: "/app/interview",
      fixLabel: "Launch AI Mock Interview",
      detail:
        communicationScore === null
          ? "Speech articulation telemetry not recorded. Complete an AI Mock interview session."
          : communicationScore >= benchmark.targetCommunicationScore
          ? `Speech telemetry demonstrates confident pacing and technical articulation.`
          : `Practice thinking aloud while implementing algorithmic problems to reduce filler pauses.`,
    },
    {
      id: "mock_simulation",
      label: "Full Pipeline Mock Simulation History",
      targetText: `Target: ${benchmark.targetMockInterviewScore}% Overall Simulation Bar`,
      currentScore: mockHistoryScore,
      isPassed: mockHistoryScore !== null && mockHistoryScore >= benchmark.targetMockInterviewScore,
      gap: mockHistoryScore !== null ? Math.max(0, benchmark.targetMockInterviewScore - mockHistoryScore) : null,
      fixLink: "/app/interview",
      fixLabel: "Start Company-Specific Mock",
      detail:
        mockHistoryScore === null
          ? "No full-length mock simulation completed yet."
          : `Complete a full 45-minute technical simulation calibrated specifically for ${benchmark.name}.`,
    },
  ];

  // -------------------------------------------------------------
  // OVERALL COMPOSITE SCORE (Weighted Across Assessed Dimensions)
  // -------------------------------------------------------------
  const overallAssessedScores = [];
  if (technicalScore !== null) overallAssessedScores.push({ score: technicalScore, weight: 0.45 });
  if (profileScore !== null) overallAssessedScores.push({ score: profileScore, weight: 0.30 });
  if (interviewScore !== null) overallAssessedScores.push({ score: interviewScore, weight: 0.25 });

  let compositeReadinessScore = null;
  if (overallAssessedScores.length > 0) {
    const totalAssessedWeight = overallAssessedScores.reduce((sum, item) => sum + item.weight, 0);
    compositeReadinessScore = Math.round(
      overallAssessedScores.reduce((sum, item) => sum + item.score * item.weight, 0) / totalAssessedWeight
    );
  }

  // -------------------------------------------------------------
  // DECISION STATES:
  // - HARD BLOCKER: "APPLICATION BLOCKER 🔴" (e.g. CGPA < cutoff, CGPA missing, standing backlogs)
  // - UNASSESSED / INCOMPLETE: "READINESS UNASSESSED 🟡" / "INCOMPLETE ASSESSMENT 🟡"
  // - READY (75-100%): "CAN APPLY 🟢" (Only when fully eligible and all dimensions thoroughly assessed)
  // - ALMOST READY (60-74%): "CAN APPLY — BUT FIX THESE FIRST 🟡"
  // - NOT READY (<60%): "NOT READY YET 🔴"
  // -------------------------------------------------------------
  let decisionState = "NOT_READY";
  let decisionTitle = "NOT READY YET 🔴";
  let decisionSubtitle = "Build your foundation before applying. Here is your action plan.";
  let decisionColor = "rose";
  let decisionBadgeBg = "bg-rose-500/15 text-rose-400 border-rose-500/40";

  const isUnassessed =
    dsaDimScore === null &&
    coreCsDimScore === null &&
    resumeAtsScore === null &&
    projectScore === null &&
    communicationScore === null &&
    behavioralScore === null;

  const hasUnassessedCriticalDimensions =
    dsaDimScore === null || resumeAtsScore === null || overallAssessedScores.length < 3;

  if (hasHardBlocker) {
    decisionState = "HARD_BLOCKER";
    decisionTitle = "APPLICATION BLOCKER 🔴";
    decisionSubtitle =
      userCgpaNum === null
        ? "CGPA record missing. Update academic profile to evaluate eligibility."
        : `Your CGPA (${userCgpaNum.toFixed(2)}) or academic profile violates ${benchmark.name}'s strict eligibility criteria.`;
    decisionColor = "rose";
    decisionBadgeBg = "bg-rose-500/15 text-rose-400 border-rose-500/40";
  } else if (isUnassessed || compositeReadinessScore === null || overallAssessedScores.length === 0) {
    decisionState = "UNASSESSED";
    decisionTitle = "READINESS UNASSESSED 🟡";
    decisionSubtitle = "Academic cutoff cleared. Complete technical, profile, and mock assessments to evaluate readiness.";
    decisionColor = "amber";
    decisionBadgeBg = "bg-amber-500/15 text-amber-300 border-amber-500/40";
  } else if (hasUnassessedCriticalDimensions) {
    decisionState = "INCOMPLETE_ASSESSMENT";
    decisionTitle = "INCOMPLETE ASSESSMENT 🟡";
    decisionSubtitle = `Academic cutoff cleared, but complete missing DSA, ATS Resume, or Mock Interview assessments before applying to ${benchmark.name}.`;
    decisionColor = "amber";
    decisionBadgeBg = "bg-amber-500/15 text-amber-300 border-amber-500/40";
  } else if (compositeReadinessScore >= 75 && isFullyEligible) {
    decisionState = "READY";
    decisionTitle = "CAN APPLY 🟢";
    decisionSubtitle = `Your profile is in strong shape for ${benchmark.name} (${targetRole}).`;
    decisionColor = "emerald";
    decisionBadgeBg = "bg-[#C7F36B]/15 text-[#C7F36B] border-[#C7F36B]/40";
  } else if (compositeReadinessScore >= 60) {
    decisionState = "ALMOST_READY";
    decisionTitle = "CAN APPLY — BUT FIX THESE FIRST 🟡";
    decisionSubtitle = "You're close. Address key deficits before submitting.";
    decisionColor = "amber";
    decisionBadgeBg = "bg-amber-500/15 text-amber-300 border-amber-500/40";
  } else {
    decisionState = "NOT_READY";
    decisionTitle = "NOT READY YET 🔴";
    decisionSubtitle = "Build your foundation before applying. Here is your action plan.";
    decisionColor = "rose";
    decisionBadgeBg = "bg-rose-500/15 text-rose-400 border-rose-500/40";
  }

  // -------------------------------------------------------------
  // TOP 3 CRITICAL RISKS / GAPS WITH DIRECT ACTION TRIGGERS
  // -------------------------------------------------------------
  const allPotentialGaps = [];

  if (userCgpaNum === null || !cgpaPass) {
    allPotentialGaps.push({
      id: "cgpa_gap",
      pillar: "Eligibility",
      title:
        userCgpaNum !== null
          ? `CGPA Gap: ${userCgpaNum.toFixed(2)} vs ${benchmark.minCgpa} Cutoff`
          : `Missing CGPA Record (Cutoff: ${benchmark.minCgpa})`,
      description:
        userCgpaNum !== null
          ? `Your CGPA is below ${benchmark.name}'s minimum cutoff. Calculate upcoming semester SGPA targets.`
          : `Your academic record is unassessed or CGPA is missing. Update your profile to evaluate eligibility.`,
      actionLabel: "Fix via SGPA Calculator",
      actionUrl: "/app/academics",
      impact: "High / Blocker",
      color: "rose",
    });
  }

  if (dsaDimScore === null) {
    allPotentialGaps.push({
      id: "dsa_unassessed",
      pillar: "Technical Readiness",
      title: "LeetCode & DSA Unassessed",
      description: `${benchmark.name} emphasizes ${benchmark.dsaKeyTopics.slice(0, 2).join(" & ")}. Connect your LeetCode profile to calibrate coding readiness.`,
      actionLabel: "Connect LeetCode Profile",
      actionUrl: "/app/profile",
      impact: "Critical",
      color: "rose",
    });
  } else if (dsaDimScore < benchmark.targetDsaScore) {
    allPotentialGaps.push({
      id: "dsa_gap",
      pillar: "Technical Readiness",
      title: `DSA Pattern Gap: ${benchmark.dsaKeyTopics[0]}`,
      description: `${benchmark.name} emphasizes ${benchmark.dsaKeyTopics.slice(0, 2).join(" & ")}. Current score: ${dsaDimScore}% vs ${benchmark.targetDsaScore}% target.`,
      actionLabel: "Practice in DSA Arena",
      actionUrl: "/app/dsa",
      impact: "Critical",
      color: "rose",
    });
  }

  if (resumeAtsScore === null) {
    allPotentialGaps.push({
      id: "resume_unassessed",
      pillar: "Profile Readiness",
      title: "Resume ATS Score Not Assessed",
      description: `Screening algorithms at ${benchmark.name} evaluate quantified impact. Upload your resume to calculate your ATS match score.`,
      actionLabel: "Score Resume ATS",
      actionUrl: "/app/resume",
      impact: "High",
      color: "amber",
    });
  } else if (resumeAtsScore < benchmark.targetResumeAtsScore) {
    allPotentialGaps.push({
      id: "resume_gap",
      pillar: "Profile Readiness",
      title: `Resume ATS Score (${resumeAtsScore}%) below ${benchmark.targetResumeAtsScore}% benchmark`,
      description: `Recruiter screening algorithms at ${benchmark.name} expect quantified Google XYZ impact bullets.`,
      actionLabel: "Optimize Resume ATS",
      actionUrl: "/app/resume",
      impact: "High",
      color: "amber",
    });
  }

  if (projectScore === null) {
    allPotentialGaps.push({
      id: "project_unassessed",
      pillar: "Profile Readiness",
      title: "GitHub Portfolio Unlinked",
      description: `Connect your GitHub profile to verify your original software codebases and production projects.`,
      actionLabel: "Connect GitHub",
      actionUrl: "/app/profile",
      impact: "Medium",
      color: "amber",
    });
  }

  if (behavioralScore !== null && behavioralScore < benchmark.targetBehavioralScore) {
    allPotentialGaps.push({
      id: "behavioral_gap",
      pillar: "Interview Readiness",
      title: `Behavioral Alignment: ${benchmark.behavioralPillars[0]}`,
      description: `Prepare STAR responses demonstrating ${benchmark.behavioralPillars.slice(0, 2).join(" and ")}.`,
      actionLabel: "Calibrate HR Prep",
      actionUrl: `/app/hr-prep?company=${benchmark.slug}`,
      impact: "Medium",
      color: "amber",
    });
  }

  if (coreCsDimScore !== null && coreCsDimScore < benchmark.targetCoreCsScore) {
    allPotentialGaps.push({
      id: "core_cs_gap",
      pillar: "Technical Readiness",
      title: `CS Core: Concurrency & SQL Transactions`,
      description: `Review transaction isolation levels, indexing mechanics, and thread synchronization.`,
      actionLabel: "Review CS Core Arena",
      actionUrl: "/app/coding",
      impact: "Medium",
      color: "amber",
    });
  }

  if (communicationScore !== null && communicationScore < benchmark.targetCommunicationScore) {
    allPotentialGaps.push({
      id: "comm_gap",
      pillar: "Interview Readiness",
      title: "Technical Mock Interview Articulation",
      description: "Complete an AI mock interview to reduce hesitation pauses during code explanation.",
      actionLabel: "Launch Mock Interview",
      actionUrl: "/app/interview",
      impact: "Medium",
      color: "amber",
    });
  }

  // Ensure top 3 critical risks
  const topCriticalRisks = allPotentialGaps.slice(0, 3);
  if (topCriticalRisks.length === 0) {
    topCriticalRisks.push({
      id: "fine_tune",
      pillar: "Interview Execution",
      title: `Simulate Live ${benchmark.name} Interview`,
      description: `Your profile meets all standard benchmarks. Run a timed 45-minute simulation to polish execution speed.`,
      actionLabel: "Launch Mock Simulation",
      actionUrl: "/app/interview",
      impact: "Polish",
      color: "emerald",
    });
  }

  // -------------------------------------------------------------
  // "WHAT IS ALREADY COVERED?" POSITIVE REINFORCEMENT LIST
  // Only add items that are genuinely verified and assessed
  // -------------------------------------------------------------
  const coveredStrengths = [];

  if (cgpaPass && userCgpaNum !== null) {
    coveredStrengths.push({
      title: `Academic Cutoff Satisfied`,
      detail: `Your ${userCgpaNum.toFixed(2)} CGPA clears ${benchmark.name}'s ${benchmark.minCgpa} cutoff with zero standing backlogs.`,
    });
  }

  if (tenthPass && twelfthPass && user10th !== null && user12th !== null) {
    coveredStrengths.push({
      title: `Secondary Schooling Benchmarks Cleared`,
      detail: `10th (${user10th}%) and 12th (${user12th}%) fulfill eligibility thresholds.`,
    });
  }

  if (degreePass && branchPass && userDegree && userBranch) {
    coveredStrengths.push({
      title: `Accredited Engineering Discipline`,
      detail: `${userDegree} (${userBranch}) is in full compliance with recruiter educational standards.`,
    });
  }

  if (projectScore !== null && projectScore >= 70) {
    coveredStrengths.push({
      title: `Practical GitHub Portfolio & Projects`,
      detail: `Verified repository codebases and full-stack software development experience.`,
    });
  }

  if (resumeAtsScore !== null && resumeAtsScore >= 75) {
    coveredStrengths.push({
      title: `ATS-Optimized Resume Structure`,
      detail: `Parsed format with valid technical keyword density (${resumeAtsScore}% score).`,
    });
  }

  if (dsaDimScore !== null && dsaDimScore >= 70) {
    coveredStrengths.push({
      title: `Algorithmic & Data Structure Foundations`,
      detail: `Competency across core data structures verified (${dsaDimScore}% score).`,
    });
  }

  if (coreCsDimScore !== null && coreCsDimScore >= 70) {
    coveredStrengths.push({
      title: `Core Computer Science Fundamentals`,
      detail: `Object-Oriented Programming, Relational Databases, and Operating Systems principles covered.`,
    });
  }

  return {
    targetCompany: benchmark.name,
    targetRole,
    benchmark,
    decision: {
      state: decisionState,
      title: decisionTitle,
      subtitle: decisionSubtitle,
      color: decisionColor,
      badgeBg: decisionBadgeBg,
      compositeScore: compositeReadinessScore,
      isFullyEligible,
      hasHardBlocker,
    },
    dimensions: {
      eligibility: {
        id: "eligibility",
        title: "Eligibility Screening",
        status: isFullyEligible ? "Eligible ✓" : hasHardBlocker ? "Blocker 🔴" : "Borderline 🟡",
        isPassed: isFullyEligible,
        hasBlocker: hasHardBlocker,
        checklist: eligibilityChecklist,
      },
      technical: {
        id: "technical",
        title: "Technical Readiness",
        score: technicalScore,
        targetScore: benchmark.targetDsaScore,
        status: technicalScore === null ? "Unassessed ⚪" : technicalPass ? "Ready ✓" : "Needs Polish 🟡",
        isPassed: technicalPass,
        checklist: technicalChecklist,
      },
      profile: {
        id: "profile",
        title: "Profile & Resume Readiness",
        score: profileScore,
        targetScore: benchmark.targetProjectScore,
        status: profileScore === null ? "Unassessed ⚪" : profilePass ? "Ready ✓" : "Needs Polish 🟡",
        isPassed: profilePass,
        checklist: profileChecklist,
      },
      interview: {
        id: "interview",
        title: "Interview & Soft Skills",
        score: interviewScore,
        targetScore: benchmark.targetBehavioralScore,
        status: interviewScore === null ? "Unassessed ⚪" : interviewPass ? "Ready ✓" : "Needs Polish 🟡",
        isPassed: interviewPass,
        checklist: interviewChecklist,
      },
    },
    topCriticalRisks,
    coveredStrengths,
  };
}
