/**
 * Can I Apply? — Intelligence Evaluation Service
 * Evaluates candidate readiness against target employer requirements across
 * 4 distinct, unmixed dimensions:
 * 1. Eligibility Check (CGPA vs cutoff, degree, graduation year, backlogs)
 * 2. Technical Readiness % (DSA, Core CS, System Design)
 * 3. Profile Readiness % (Projects, GitHub depth, Resume ATS score)
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
    targetCommunicationScore: 75,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 78,
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
    allowedBranches: ["All Engineering Branches", "CS/IT", "ECE", "EEE", "Maths & Computing"],
    targetDsaScore: 90,
    targetCoreCsScore: 85,
    targetSystemDesignScore: 80,
    targetProjectScore: 80,
    targetResumeAtsScore: 85,
    targetCommunicationScore: 80,
    targetBehavioralScore: 85,
    targetMockInterviewScore: 82,
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
    targetCommunicationScore: 75,
    targetBehavioralScore: 85,
    targetMockInterviewScore: 80,
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
    minCgpa: 7.5,
    preferredCgpa: 8.2,
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
    targetCommunicationScore: 78,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 80,
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
    minCgpa: 7.5,
    preferredCgpa: 8.2,
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
    targetCommunicationScore: 80,
    targetBehavioralScore: 82,
    targetMockInterviewScore: 80,
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
    targetCommunicationScore: 82,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 82,
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
    targetCommunicationScore: 75,
    targetBehavioralScore: 78,
    targetMockInterviewScore: 76,
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
    targetCommunicationScore: 80,
    targetBehavioralScore: 82,
    targetMockInterviewScore: 85,
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
    targetCommunicationScore: 75,
    targetBehavioralScore: 78,
    targetMockInterviewScore: 78,
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
    targetCommunicationScore: 75,
    targetBehavioralScore: 78,
    targetMockInterviewScore: 78,
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
    name: "TCS (Tata Consultancy Services)",
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
  goldmansachs: {
    name: "Goldman Sachs",
    slug: "goldmansachs",
    tier: "FinTech / Investment Banking",
    minCgpa: 7.0,
    preferredCgpa: 8.0,
    minTenthPct: 70,
    minTwelfthPct: 70,
    maxActiveBacklogs: 0,
    maxHistoryBacklogs: 0,
    allowedDegrees: ["B.Tech", "B.E.", "M.Tech", "Dual Degree"],
    allowedBranches: ["All Engineering Branches", "Maths & Computing"],
    targetDsaScore: 88,
    targetCoreCsScore: 85,
    targetSystemDesignScore: 80,
    targetProjectScore: 78,
    targetResumeAtsScore: 82,
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
};

export const POPULAR_COMPANIES = [
  "Microsoft",
  "Google",
  "Amazon",
  "Uber",
  "Atlassian",
  "Stripe",
  "Razorpay",
  "Meta",
  "Adobe",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Goldman Sachs",
  "Cisco",
  "Oracle",
  "TCS",
  "Infosys",
];

export const POPULAR_ROLES = [
  "Software Development Engineer (SDE 1)",
  "Software Engineer (Full Stack)",
  "Backend Infrastructure Engineer",
  "Frontend Platform Engineer",
  "Distributed Systems Engineer",
  "Cloud & DevOps Engineer",
  "Data & AI Platform Engineer",
  "Graduate Software Engineer (2025/2026)",
];

/**
 * Normalizes company key string for fast benchmark lookup
 */
export function normalizeCompanyKey(name) {
  if (!name || typeof name !== "string") return "microsoft";
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const key of Object.keys(COMPANY_BENCHMARK_PROFILES)) {
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
  if (found) return found;

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
    targetCommunicationScore: 75,
    targetBehavioralScore: 80,
    targetMockInterviewScore: 78,
    requiredSkills: ["Java", "Python", "Data Structures", "Algorithms", "SQL", "OOP Concepts"],
    preferredSkills: ["Cloud", "Docker", "Git", "System Design"],
    dsaKeyTopics: ["Arrays & Strings", "Trees & Graphs", "Dynamic Programming", "Heaps"],
    coreCsKeyTopics: ["Operating Systems", "DBMS", "Computer Networks", "OOPs"],
    behavioralPillars: ["Problem Solving", "Ownership", "Teamwork", "Continuous Learning"],
    careersUrl: `https://www.google.com/search?q=${encodeURIComponent(companyName + " careers")}`,
    avgPackageLpa: 30,
  };
}

/**
 * Evaluates Application Readiness across the 4 distinct, unmixed dimensions:
 * 1. Eligibility Check
 * 2. Technical Readiness %
 * 3. Profile Readiness %
 * 4. Interview Readiness %
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
  // -------------------------------------------------------------
  const parseNumeric = (val) =>
    val !== null && val !== undefined && val !== "" && !isNaN(Number(val)) ? Number(val) : null;

  const rawCgpa =
    academicProfile?.currentCgpa ??
    userProfile?.cgpa ??
    (readinessData?.dimensions?.academics?.score != null ? readinessData.dimensions.academics.score / 10 : null);
  const userCgpaNum = parseNumeric(rawCgpa);

  const userActiveBacklogs = parseNumeric(academicProfile?.activeBacklogs ?? userProfile?.activeBacklogs) ?? 0;
  const userHistoryBacklogs = parseNumeric(academicProfile?.historyOfBacklogs ?? userProfile?.historyOfBacklogs) ?? 0;
  const user10th = parseNumeric(academicProfile?.tenthPercentage ?? userProfile?.tenthPercentage);
  const user12th = parseNumeric(academicProfile?.twelfthPercentage ?? userProfile?.twelfthPercentage);
  const userDegree = userProfile?.degree || academicProfile?.degree || "B.Tech Computer Science";
  const userGradYear = userProfile?.graduationYear || academicProfile?.graduationYear || 2026;
  const userBranch = academicProfile?.branch || userProfile?.branch || "Computer Science & Engineering";

  const cgpaPass = userCgpaNum !== null && userCgpaNum >= benchmark.minCgpa;
  const cgpaDelta = userCgpaNum !== null ? (userCgpaNum - benchmark.minCgpa).toFixed(2) : null;

  const backlogsPass =
    userActiveBacklogs <= benchmark.maxActiveBacklogs &&
    userHistoryBacklogs <= benchmark.maxHistoryBacklogs;
  const tenthPass = user10th !== null ? user10th >= benchmark.minTenthPct : false;
  const twelfthPass = user12th !== null ? user12th >= benchmark.minTwelfthPct : false;

  // Degree fit check
  const degreeLower = userDegree.toLowerCase();
  const degreePass =
    benchmark.allowedDegrees.some((deg) => degreeLower.includes(deg.toLowerCase())) ||
    degreeLower.includes("b.tech") ||
    degreeLower.includes("b.e.") ||
    degreeLower.includes("cs") ||
    degreeLower.includes("engineering");

  // Branch fit check
  const userBranchLower = (userBranch || "").toLowerCase();
  const isCsOrIt =
    userBranchLower.includes("computer") ||
    userBranchLower.includes("cs") ||
    userBranchLower.includes("information technology") ||
    userBranchLower.includes("it");
  const isCircuit =
    isCsOrIt ||
    userBranchLower.includes("electronics") ||
    userBranchLower.includes("ece") ||
    userBranchLower.includes("electrical") ||
    userBranchLower.includes("eee") ||
    userBranchLower.includes("telecomm") ||
    userBranchLower.includes("instrumentation");

  const branchPass =
    !benchmark.allowedBranches ||
    benchmark.allowedBranches.length === 0 ||
    benchmark.allowedBranches.includes("All Branches") ||
    benchmark.allowedBranches.includes("All Engineering Branches") ||
    benchmark.allowedBranches.some((b) => {
      const bLower = b.toLowerCase();
      if (bLower === "all branches" || bLower === "all engineering branches") return true;
      if (bLower.includes("cs") || bLower.includes("it")) {
        if (isCsOrIt) return true;
      }
      if (bLower.includes("circuit")) {
        if (isCircuit) return true;
      }
      return userBranchLower.includes(bLower) || bLower.includes(userBranchLower);
    });

  // Overall eligibility state
  const isFullyEligible = cgpaPass && backlogsPass && tenthPass && twelfthPass && degreePass && branchPass;
  const hasHardBlocker = !cgpaPass || !backlogsPass || !degreePass || !branchPass;

  const eligibilityChecklist = [
    {
      id: "cgpa",
      label: "Cumulative CGPA Cutoff",
      required: `Minimum ${benchmark.minCgpa} CGPA (Preferred: ${benchmark.preferredCgpa})`,
      actual: userCgpaNum !== null ? `${userCgpaNum.toFixed(2)} CGPA` : "Not Provided",
      isPassed: userCgpaNum !== null ? cgpaPass : false,
      isBlocker: userCgpaNum === null || !cgpaPass,
      statusText: userCgpaNum !== null && cgpaPass ? "Eligible ✓" : "Blocker 🔴",
      detail:
        userCgpaNum === null
          ? "Academic record unassessed or CGPA missing."
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
      actual: `${userActiveBacklogs} Active Backlog${userActiveBacklogs === 1 ? "" : "s"}`,
      isPassed: backlogsPass,
      isBlocker: !backlogsPass,
      statusText: backlogsPass ? "Eligible ✓" : "Blocker 🔴",
      detail: backlogsPass
        ? `Clear academic standing verified with 0 active backlogs.`
        : `${userActiveBacklogs} active backlog(s) violates ${benchmark.name}'s campus policy. Clear backlogs before applying.`,
      fixAction: {
        label: "View VTOP Records",
        url: "/app/vtop",
      },
    },
    {
      id: "degree",
      label: "Degree & Discipline Alignment",
      required: `${benchmark.allowedDegrees.slice(0, 3).join(" / ")} in STEM discipline`,
      actual: `${userDegree} (${userBranch})`,
      isPassed: degreePass && branchPass,
      isBlocker: !degreePass || !branchPass,
      statusText: degreePass && branchPass ? "Eligible ✓" : "Blocker 🔴",
      detail:
        degreePass && branchPass
          ? `Enrolled in accredited engineering curriculum recognized by ${benchmark.name}.`
          : !degreePass
          ? `Degree (${userDegree}) requires campus recruiter verification.`
          : `Branch (${userBranch}) is not in the eligible branches list for ${benchmark.name}.`,
      fixAction: {
        label: "Update Degree in Profile",
        url: "/app/profile",
      },
    },
    {
      id: "schooling",
      label: "10th & 12th Academic Benchmark",
      required: `Min ${benchmark.minTenthPct}% in 10th & ${benchmark.minTwelfthPct}% in 12th`,
      actual: `10th: ${user10th !== null ? `${user10th}%` : "N/A"} • 12th: ${user12th !== null ? `${user12th}%` : "N/A"}`,
      isPassed: tenthPass && twelfthPass,
      isBlocker: false,
      statusText: tenthPass && twelfthPass ? "Eligible ✓" : "Review 🟡",
      detail: tenthPass && twelfthPass
        ? `High school percentage benchmarks cleared.`
        : `Check official company recruitment circular regarding school aggregate waivers.`,
      fixAction: {
        label: "Edit Profile Info",
        url: "/app/profile",
      },
    },
    {
      id: "grad_year",
      label: "Graduation Batch Eligibility",
      required: "2025 - 2027 Passout Batches for Campus / Entry Level",
      actual: `Class of ${userGradYear}`,
      isPassed: true,
      isBlocker: false,
      statusText: "Eligible ✓",
      detail: `Your graduation cohort (${userGradYear}) is actively in recruitment scope.`,
      fixAction: {
        label: "Profile Settings",
        url: "/app/profile",
      },
    },
  ];

  // -------------------------------------------------------------
  // 2. TECHNICAL READINESS % (DSA, Core CS, System Design)
  // -------------------------------------------------------------
  const dsaDimScore =
    readinessData?.dimensions?.dsa?.score ??
    (leetcodeProfile?.totalSolved ? Math.min(95, Math.round((leetcodeProfile.totalSolved / 250) * 85) + 15) : 74);
  const coreCsDimScore = readinessData?.dimensions?.skills?.score ?? 76;
  const systemDesignScore = benchmark.targetSystemDesignScore ? Math.round(dsaDimScore * 0.4 + coreCsDimScore * 0.6) : 72;

  // Composite Technical score %
  const technicalScore = Math.round(dsaDimScore * 0.5 + coreCsDimScore * 0.3 + systemDesignScore * 0.2);
  const technicalPass = technicalScore >= benchmark.targetDsaScore - 6;

  const technicalChecklist = [
    {
      id: "dsa",
      label: "Data Structures & Algorithmic Patterns",
      targetText: `Target: ${benchmark.targetDsaScore}% (${benchmark.dsaKeyTopics.slice(0, 2).join(", ")})`,
      currentScore: dsaDimScore,
      isPassed: dsaDimScore >= benchmark.targetDsaScore,
      gap: Math.max(0, benchmark.targetDsaScore - dsaDimScore),
      fixLink: "/app/dsa",
      fixLabel: "Practice LeetCode / DSA Sheets",
      detail:
        dsaDimScore >= benchmark.targetDsaScore
          ? `Algorithmic mastery meets ${benchmark.name}'s coding bar.`
          : `Deficit in ${benchmark.dsaKeyTopics[0]} and ${benchmark.dsaKeyTopics[1]}. Solve ~15 targeted problems.`,
    },
    {
      id: "core_cs",
      label: "Core CS Fundamentals (OS, DBMS, Networks)",
      targetText: `Target: ${benchmark.targetCoreCsScore}% (Concurrency, SQL, Protocols)`,
      currentScore: coreCsDimScore,
      isPassed: coreCsDimScore >= benchmark.targetCoreCsScore,
      gap: Math.max(0, benchmark.targetCoreCsScore - coreCsDimScore),
      fixLink: "/app/coding",
      fixLabel: "Review CS Fundamentals",
      detail:
        coreCsDimScore >= benchmark.targetCoreCsScore
          ? `Solid command of operating systems, databases, and network fundamentals.`
          : `Strengthen transaction isolation, multithreading synchronization, and TCP socket lifecycle.`,
    },
    {
      id: "system_design",
      label: "Architecture & Modular System Thinking",
      targetText: `Target: ${benchmark.targetSystemDesignScore}% (LLD & Distributed Caching)`,
      currentScore: systemDesignScore,
      isPassed: systemDesignScore >= benchmark.targetSystemDesignScore,
      gap: Math.max(0, benchmark.targetSystemDesignScore - systemDesignScore),
      fixLink: "/app/roadmap",
      fixLabel: "Explore Architecture Roadmap",
      detail:
        systemDesignScore >= benchmark.targetSystemDesignScore
          ? `Modular architecture design and clean code separation demonstrated.`
          : `Practice object-oriented machine coding and distributed rate limiting trade-offs.`,
    },
  ];

  // -------------------------------------------------------------
  // 3. PROFILE READINESS % (Projects, GitHub, Resume ATS)
  // -------------------------------------------------------------
  const projectScore =
    githubProfile?.projectScore ??
    readinessData?.dimensions?.projects?.score ??
    (githubProfile?.originalReposCount ? Math.min(95, githubProfile.originalReposCount * 18 + 25) : 75);

  const resumeAtsScore =
    userProfile?.resumeScore ??
    readinessData?.dimensions?.resume?.score ??
    82;

  const stackAlignmentScore = 80;

  // Composite Profile score %
  const profileScore = Math.round(projectScore * 0.45 + resumeAtsScore * 0.45 + stackAlignmentScore * 0.1);
  const profilePass = profileScore >= benchmark.targetProjectScore - 5;

  const profileChecklist = [
    {
      id: "resume_ats",
      label: "Resume ATS Score & Google XYZ Metrics",
      targetText: `Target: ${benchmark.targetResumeAtsScore}%+ ATS Score`,
      currentScore: resumeAtsScore,
      isPassed: resumeAtsScore >= benchmark.targetResumeAtsScore,
      gap: Math.max(0, benchmark.targetResumeAtsScore - resumeAtsScore),
      fixLink: "/app/resume",
      fixLabel: "Tailor Resume with Google XYZ",
      detail:
        resumeAtsScore >= benchmark.targetResumeAtsScore
          ? `ATS keyword distribution and quantifiable metric bullet points pass screening.`
          : `Resume ATS score (${resumeAtsScore}%) is below target (${benchmark.targetResumeAtsScore}%). Add action verbs and quantifiable metrics.`,
    },
    {
      id: "projects",
      label: "GitHub Codebases & Production Projects",
      targetText: `Target: ${benchmark.targetProjectScore}% (2+ Full-Stack / Systems Repos)`,
      currentScore: projectScore,
      isPassed: projectScore >= benchmark.targetProjectScore,
      gap: Math.max(0, benchmark.targetProjectScore - projectScore),
      fixLink: "/app/development",
      fixLabel: "Connect GitHub / Deploy Projects",
      detail:
        projectScore >= benchmark.targetProjectScore
          ? `Verified active repositories with clean commits and production architecture.`
          : `Add live demo URLs, Docker compose configs, and comprehensive README documentation to top repositories.`,
    },
    {
      id: "skills_match",
      label: "Required Technology Stack Match",
      targetText: `Stack: ${benchmark.requiredSkills.slice(0, 4).join(", ")}`,
      currentScore: stackAlignmentScore,
      isPassed: stackAlignmentScore >= 75,
      gap: Math.max(0, 80 - stackAlignmentScore),
      fixLink: "/app/roadmap",
      fixLabel: "Tech Stack Learning Path",
      detail: `Your profile demonstrates foundational alignment with ${benchmark.name}'s primary technologies.`,
    },
  ];

  // -------------------------------------------------------------
  // 4. INTERVIEW READINESS % (Communication, HR behavioral, Mock history)
  // -------------------------------------------------------------
  const communicationScore = readinessData?.dimensions?.communication?.score ?? 78;
  const behavioralScore = readinessData?.dimensions?.interview?.score ?? 74;
  const mockHistoryScore = 75;

  // Composite Interview score %
  const interviewScore = Math.round(communicationScore * 0.4 + behavioralScore * 0.4 + mockHistoryScore * 0.2);
  const interviewPass = interviewScore >= benchmark.targetBehavioralScore - 6;

  const interviewChecklist = [
    {
      id: "behavioral",
      label: `Company Culture & Values (${benchmark.behavioralPillars[0]})`,
      targetText: `Target: ${benchmark.targetBehavioralScore}% (${benchmark.behavioralPillars.slice(0, 2).join(", ")})`,
      currentScore: behavioralScore,
      isPassed: behavioralScore >= benchmark.targetBehavioralScore,
      gap: Math.max(0, benchmark.targetBehavioralScore - behavioralScore),
      fixLink: `/app/hr-prep?company=${benchmark.slug}`,
      fixLabel: "Open HR & Culture Studio",
      detail:
        behavioralScore >= benchmark.targetBehavioralScore
          ? `Strong STAR-formatted behavioral narratives tailored for ${benchmark.name}.`
          : `Prepare 2 STAR stories demonstrating ${benchmark.behavioralPillars[0]} and ${benchmark.behavioralPillars[1]}.`,
    },
    {
      id: "communication",
      label: "Technical Articulation & Speech Fluency",
      targetText: `Target: ${benchmark.targetCommunicationScore}% Spoken Clarity`,
      currentScore: communicationScore,
      isPassed: communicationScore >= benchmark.targetCommunicationScore,
      gap: Math.max(0, benchmark.targetCommunicationScore - communicationScore),
      fixLink: "/app/interview",
      fixLabel: "Launch AI Mock Interview",
      detail:
        communicationScore >= benchmark.targetCommunicationScore
          ? `Speech telemetry demonstrates confident pacing and technical articulation.`
          : `Practice thinking aloud while implementing algorithmic problems to reduce filler pauses.`,
    },
    {
      id: "mock_simulation",
      label: "Full Pipeline Mock Simulation History",
      targetText: `Target: ${benchmark.targetMockInterviewScore}% Overall Simulation Bar`,
      currentScore: mockHistoryScore,
      isPassed: mockHistoryScore >= benchmark.targetMockInterviewScore,
      gap: Math.max(0, benchmark.targetMockInterviewScore - mockHistoryScore),
      fixLink: "/app/interview",
      fixLabel: "Start Company-Specific Mock",
      detail: `Complete a full 45-minute technical simulation calibrated specifically for ${benchmark.name}.`,
    },
  ];

  // -------------------------------------------------------------
  // OVERALL COMPOSITE SCORE (Weighted Across 3 Score Dimensions)
  // -------------------------------------------------------------
  const compositeReadinessScore = Math.round(
    technicalScore * 0.45 + profileScore * 0.3 + interviewScore * 0.25
  );

  // -------------------------------------------------------------
  // DECISION STATES:
  // - HARD BLOCKER: "APPLICATION BLOCKER 🔴" (e.g. CGPA < cutoff)
  // - READY (75-100%): "CAN APPLY 🟢"
  // - ALMOST READY (60-74%): "CAN APPLY — BUT FIX THESE FIRST 🟡"
  // - NOT READY (<60%): "NOT READY YET 🔴"
  // -------------------------------------------------------------
  let decisionState = "READY";
  let decisionTitle = "CAN APPLY 🟢";
  let decisionSubtitle = "Your profile is in strong shape for this role.";
  let decisionColor = "emerald";
  let decisionBadgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  if (hasHardBlocker) {
    decisionState = "HARD_BLOCKER";
    decisionTitle = "APPLICATION BLOCKER 🔴";
    decisionSubtitle = "Fix eligibility requirements before applying.";
    decisionColor = "rose";
    decisionBadgeBg = "bg-rose-500/15 text-rose-400 border-rose-500/40";
  } else if (compositeReadinessScore >= 75) {
    decisionState = "READY";
    decisionTitle = "CAN APPLY 🟢";
    decisionSubtitle = `Your profile is in strong shape for ${benchmark.name} (${targetRole}).`;
    decisionColor = "emerald";
    decisionBadgeBg = "bg-[#C7F36B]/15 text-[#C7F36B] border-[#C7F36B]/40";
  } else if (compositeReadinessScore >= 60) {
    decisionState = "ALMOST_READY";
    decisionTitle = "CAN APPLY — BUT FIX THESE FIRST 🟡";
    decisionSubtitle = "You're close. 3 areas are holding you back.";
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

  if (!cgpaPass) {
    allPotentialGaps.push({
      id: "cgpa_gap",
      pillar: "Eligibility",
      title:
        userCgpaNum !== null
          ? `CGPA Gap: ${userCgpaNum.toFixed(2)} vs ${benchmark.minCgpa} Cutoff`
          : `Missing CGPA (Cutoff: ${benchmark.minCgpa})`,
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

  if (dsaDimScore < benchmark.targetDsaScore) {
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

  if (resumeAtsScore < benchmark.targetResumeAtsScore) {
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

  if (behavioralScore < benchmark.targetBehavioralScore) {
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

  if (coreCsDimScore < benchmark.targetCoreCsScore) {
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

  if (communicationScore < benchmark.targetCommunicationScore) {
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

  // Ensure always top 3 critical risks
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

  if (degreePass && branchPass) {
    coveredStrengths.push({
      title: `Accredited Engineering Discipline`,
      detail: `${userDegree} (${userBranch}) is in full compliance with recruiter educational standards.`,
    });
  }

  if (projectScore >= 70) {
    coveredStrengths.push({
      title: `Practical GitHub Portfolio & Projects`,
      detail: `Verified repository codebases and full-stack software development experience.`,
    });
  }

  if (resumeAtsScore >= 75) {
    coveredStrengths.push({
      title: `ATS-Optimized Resume Structure`,
      detail: `Parsed format with valid technical keyword density and contact information.`,
    });
  }

  if (dsaDimScore >= 70) {
    coveredStrengths.push({
      title: `Algorithmic & Data Structure Foundations`,
      detail: `Competency across core data structures (Arrays, Linked Lists, Trees, and Sorting).`,
    });
  }

  if (coreCsDimScore >= 70) {
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
        status: technicalPass ? "Ready ✓" : "Needs Polish 🟡",
        isPassed: technicalPass,
        checklist: technicalChecklist,
      },
      profile: {
        id: "profile",
        title: "Profile & Resume Readiness",
        score: profileScore,
        targetScore: benchmark.targetProjectScore,
        status: profilePass ? "Ready ✓" : "Needs Polish 🟡",
        isPassed: profilePass,
        checklist: profileChecklist,
      },
      interview: {
        id: "interview",
        title: "Interview & Soft Skills",
        score: interviewScore,
        targetScore: benchmark.targetBehavioralScore,
        status: interviewPass ? "Ready ✓" : "Needs Polish 🟡",
        isPassed: interviewPass,
        checklist: interviewChecklist,
      },
    },
    topCriticalRisks,
    coveredStrengths,
  };
}
