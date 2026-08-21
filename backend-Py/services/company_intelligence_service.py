import json
import logging
from typing import Dict, Any, List, Optional
from services.gemini_client import query_gemini, extract_json

logger = logging.getLogger("company_intelligence_service")

# High-fidelity built-in database for top tier tech companies
COMPANY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "google": {
        "name": "Google (Alphabet)",
        "slug": "google",
        "industry": "Big Tech / Cloud / Search / AI",
        "headquarters": "Mountain View, California",
        "founded": "1998",
        "tier": "Tier-1 / FAANG / Big Tech",
        "culture_summary": "Data-driven, high engineering bar, emphasis on 'Googliness' (intellectual humility, collaboration, doing the right thing, navigating ambiguity).",
        "core_values": [
            "Googliness: Collaborative, transparent, thrive in ambiguity, respect others.",
            "10x Thinking: Focus on radical, scalable solutions rather than incremental tweaks.",
            "Data-Driven Decisions: Rely on metrics, rigorous benchmarking, and user feedback."
        ],
        "tech_stack": {
            "frontend": ["Angular", "Flutter", "Lit / Web Components", "TypeScript"],
            "backend": ["C++", "Java", "Go", "Python", "gRPC / Protobuf"],
            "databases": ["Spanner (Distributed SQL)", "Bigtable", "Firestore", "Memcache"],
            "cloud_infra": ["Google Cloud Platform (GCP)", "Borg (Kubernetes precursor)", "Bazel"],
            "ai_ml": ["TensorFlow", "JAX", "Gemini", "TPU Infrastructure"]
        },
        "recent_highlights": [
            "Heavy enterprise expansion with Gemini 1.5/2.5 integrations across Google Cloud and Workspace.",
            "Migration of core developer tooling towards AI-assisted code generation & Bazel continuous build automation.",
            "Strict focus on latency optimization for search, YouTube streaming, and real-time ads pipelines."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Online Assessment (OA) / Recruiter Screen",
                "duration": "45-60 mins",
                "format": "HackerRank / Google Coding Sandbox",
                "focus": "2 algorithmic problems (medium/hard) testing edge case handling and speed.",
                "passing_criteria": "100% test cases passing with optimal Big-O bounds and clean variable naming."
            },
            {
                "round": 2,
                "title": "Technical Round 1: Data Structures & Algorithms",
                "duration": "45 mins",
                "format": "Google Docs / Live Coding",
                "focus": "Graphs (BFS/DFS, Dijkstra), Dynamic Programming, Advanced Trees.",
                "passing_criteria": "Strong communication: Talk through thought process, proactively analyze Time/Space complexity, dry run with test inputs."
            },
            {
                "round": 3,
                "title": "Technical Round 2: Algorithmic Depth & Concurrency",
                "duration": "45 mins",
                "format": "Live Coding",
                "focus": "Complex Data Structures (Trie, Heap, Monotonic Stack, Interval problems, Concurrency/Threading).",
                "passing_criteria": "Write modular, idiomatic production-ready code with zero syntax errors."
            },
            {
                "round": 4,
                "title": "System Design (L4+) / CS Fundamentals",
                "duration": "45 mins",
                "format": "Virtual Whiteboard",
                "focus": "Distributed Cache, Rate Limiter, Web Crawler, YouTube Video Upload, Global Consistency.",
                "passing_criteria": "Requirements clarification, back-of-the-envelope calculations, fault tolerance, bottleneck identification."
            },
            {
                "round": 5,
                "title": "Googliness & Leadership (Behavioral)",
                "duration": "45 mins",
                "format": "1-on-1 with Engineering Manager",
                "focus": "Navigating ambiguity, constructive feedback, team conflict, diversity & inclusion, overcoming project failure.",
                "passing_criteria": "Authentic STAR stories demonstrating humility, ownership, and user empathy."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Graph Algorithms (Topological Sort, Dijkstra, BFS/DFS)", "frequency": "Very High", "sample_problems": ["Alien Dictionary", "Course Schedule II", "Word Ladder"]},
            {"pattern": "Dynamic Programming (2D DP, State Compression)", "frequency": "High", "sample_problems": ["Longest Increasing Subsequence", "Edit Distance", "Trapping Rain Water"]},
            {"pattern": "Trie & String Manipulation", "frequency": "High", "sample_problems": ["Implement Trie", "Word Search II", "Longest Substring Without Repeating Characters"]},
            {"pattern": "Binary Search & Monotonic Queue", "frequency": "Medium-High", "sample_problems": ["Median of Two Sorted Arrays", "Sliding Window Maximum"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you had to make a technical decision with incomplete information or ambiguous requirements.",
                "strategy": "Emphasize how you formulated hypotheses, validated assumptions through prototypes/telemetry, and remained adaptable."
            },
            {
                "question": "Describe a scenario where you disagreed with a teammate on an architectural direction. How did you resolve it?",
                "strategy": "Showcase objective data evaluation, respectful debate, seeking neutral mentor input, and committing fully to the consensus."
            }
        ],
        "preparation_roadmap": [
            "Master Graph algorithms and 2D DP problems on LeetCode Medium/Hard.",
            "Practice writing code directly without an IDE auto-complete (Google uses text editor interface).",
            "Prepare 4-5 STAR stories focused on Googliness, leadership without authority, and overcoming failure.",
            "Review Distributed Systems basics (CAP theorem, consistent hashing, caching layers)."
        ]
    },
    "amazon": {
        "name": "Amazon (AWS)",
        "slug": "amazon",
        "industry": "E-Commerce / Cloud Computing / AI / Logistics",
        "headquarters": "Seattle, Washington",
        "founded": "1994",
        "tier": "Tier-1 / FAANG / Cloud Giant",
        "culture_summary": "Deeply governed by the 16 Leadership Principles (LPs). High operational excellence, bias for action, frugal engineering, customer obsession.",
        "core_values": [
            "Customer Obsession: Leaders start with the customer and work backwards.",
            "Ownership & Bias for Action: Leaders think long term and value calculated risk-taking.",
            "Dive Deep & Have Backbone: Leaders operate at all levels, stay connected to details, and respectfully challenge decisions.",
            "Deliver Results: Focus on key inputs and deliver with high quality despite setbacks."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Micro-frontends", "CloudFront"],
            "backend": ["Java", "Kotlin", "C++", "Python", "Coral Service Framework"],
            "databases": ["DynamoDB (NoSQL)", "Amazon Aurora", "OpenSearch", "ElastiCache (Redis)"],
            "cloud_infra": ["Amazon Web Services (AWS)", "EC2 / ECS / EKS", "Lambda Serverless", "SQS / SNS / Kinesis"],
            "ai_ml": ["Amazon Bedrock", "SageMaker", "Inferentia"]
        },
        "recent_highlights": [
            "Massive scaling of AWS Bedrock generative AI infrastructure and custom Trainium2 chips.",
            "Zero-ETL data integrations across Amazon Redshift and DynamoDB.",
            "Serverless architecture modernization reducing operational footprint and cold-start latencies."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Online Assessment (OA 1 & 2)",
                "duration": "90 mins",
                "format": "Hackerearth / Mettl",
                "focus": "2 Coding problems + Amazon Work Style Assessment (LP questionnaire).",
                "passing_criteria": "All test cases + strong alignment with LP personality questions."
            },
            {
                "round": 2,
                "title": "Technical Round 1: Coding & LP Deep Dive",
                "duration": "60 mins",
                "format": "Amazon Chime / Live Code",
                "focus": "20 mins Amazon Leadership Principles (STAR) + 40 mins DSA (Trees, BFS, Sliding Window).",
                "passing_criteria": "Clear STAR metrics (numbers, % scale) + clean OOP code structure."
            },
            {
                "round": 3,
                "title": "Technical Round 2: Data Structures & Algorithms",
                "duration": "60 mins",
                "format": "Live Coding",
                "focus": "20 mins LP (Customer Obsession & Ownership) + 40 mins DSA (Heaps, Graphs, DP).",
                "passing_criteria": "Modular code with robust edge cases (null inputs, overflows)."
            },
            {
                "round": 4,
                "title": "System Design & Object-Oriented Design",
                "duration": "60 mins",
                "format": "Whiteboard Tool",
                "focus": "Design Amazon Locker, Flash Sale Booking System, Distributed Rate Limiter, TinyURL.",
                "passing_criteria": "Deep dive on high availability, database partitioning, async queues (SQS/Kafka), caching."
            },
            {
                "round": 5,
                "title": "Bar Raiser Interview (Crucial Round)",
                "duration": "60 mins",
                "format": "Senior Leader / Independent Evaluator",
                "focus": "Relentless behavioral deep dive on multiple LPs + unexpected technical scenario.",
                "passing_criteria": "Candidate must raise the existing team average competency bar across behavioral & technical maturity."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Trees & Binary Search Trees (LCA, Path Sum, Level Order)", "frequency": "Very High", "sample_problems": ["Lowest Common Ancestor", "Binary Tree Zigzag Level Order Traversal", "Serialize and Deserialize Binary Tree"]},
            {"pattern": "Priority Queue / Min-Heap & Top-K", "frequency": "Very High", "sample_problems": ["Top K Frequent Elements", "Kth Largest Element in an Array", "Merge k Sorted Lists"]},
            {"pattern": "BFS / DFS & Connected Components", "frequency": "High", "sample_problems": ["Number of Islands", "Rotting Oranges", "Word Search"]},
            {"pattern": "Sliding Window & Hash Maps", "frequency": "High", "sample_problems": ["Longest Substring with At Most K Distinct Characters", "Subarray Sum Equals K"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you showed Ownership and took on a task that was outside your direct responsibility.",
                "strategy": "Demonstrate proactiveness, identifying a critical risk to customers or team velocity, and seeing it through to quantifiable completion."
            },
            {
                "question": "Give an example of a tough deadline where you had to compromise or make a trade-off (Bias for Action & Deliver Results).",
                "strategy": "Explain the decision framework, minimal viable architecture, tech debt documentation, and follow-up stabilization."
            }
        ],
        "preparation_roadmap": [
            "Memorize the 16 Leadership Principles and prepare at least 2 distinct STAR stories for EACH LP.",
            "Always include hard metrics in STAR stories ($ saved, % latency reduced, # customer issues prevented).",
            "Practice Tree traversals, Heaps, and Graph BFS/DFS thoroughly.",
            "Understand AWS building blocks: DynamoDB, SQS, S3, API Gateway, Redis."
        ]
    },
    "microsoft": {
        "name": "Microsoft",
        "slug": "microsoft",
        "industry": "Enterprise Software / Cloud / Gaming / AI",
        "headquarters": "Redmond, Washington",
        "founded": "1975",
        "tier": "Tier-1 / Big Tech / Cloud Giant",
        "culture_summary": "Growth Mindset championed by Satya Nadella. Emphasis on empathy, collaborative engineering, enterprise reliability, continuous learning.",
        "core_values": [
            "Growth Mindset: Embrace curiosity, learn from failure, and continuously evolve.",
            "Customer Empathy: Listen deeply to enterprise and consumer customer pain points.",
            "One Microsoft: Break silos, collaborate across business units, celebrate shared success."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Fluent UI", "Electron"],
            "backend": ["C# / .NET Core", "Java", "C++", "Python", "TypeScript / Node"],
            "databases": ["Azure Cosmos DB", "Azure SQL Database", "PostgreSQL", "Redis"],
            "cloud_infra": ["Microsoft Azure", "Azure DevOps", "GitHub Actions", "Kubernetes (AKS)"],
            "ai_ml": ["Azure OpenAI Service", "Copilot Platform", "ONNX Runtime"]
        },
        "recent_highlights": [
            "Pioneering Copilot AI integration across Windows, Office 365, GitHub, and Azure cloud services.",
            "Massive scaling of high-performance AI supercomputing clusters in Azure for OpenAI workloads.",
            "Enterprise-grade zero-trust security architecture modernization."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Online Screening (Codility)",
                "duration": "75 mins",
                "format": "Codility Assessment",
                "focus": "3 coding tasks ranging from string parsing to arrays and greedy algorithms.",
                "passing_criteria": "High code readability, edge case coverage, and algorithmic time complexity."
            },
            {
                "round": 2,
                "title": "Technical Round 1: DSA & Problem Solving",
                "duration": "45-60 mins",
                "format": "Teams / Live Coding",
                "focus": "Linked Lists, Strings, Arrays, Stack/Queue, Recursion.",
                "passing_criteria": "Clear algorithmic explanation, writing clean modular code, handling null checks."
            },
            {
                "round": 3,
                "title": "Technical Round 2: Data Structures & System Thinking",
                "duration": "45-60 mins",
                "format": "Teams / Live Coding",
                "focus": "Trees, BST, Dynamic Programming, Graph Traversal.",
                "passing_criteria": "Ability to dry-run logic with diverse test inputs and identify optimizations."
            },
            {
                "round": 4,
                "title": "System Design / Object Oriented Architecture",
                "duration": "60 mins",
                "format": "Whiteboarding",
                "focus": "Design OneDrive File Sync, Collaborative Word Editor, Global Notification Service.",
                "passing_criteria": "Enterprise scale considerations: Data partitioning, concurrency, conflict resolution."
            },
            {
                "round": 5,
                "title": "As-Appropriate (AA) / Partner Director Round",
                "duration": "45-60 mins",
                "format": "1-on-1 with Partner Engineering Manager",
                "focus": "Growth mindset stories, architectural vision, career aspirations, behavioral alignment.",
                "passing_criteria": "Demonstrate passion for learning, team alignment, and ability to handle technical feedback."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Linked Lists (Reversal, Cycle Detection, Flattening)", "frequency": "Very High", "sample_problems": ["Reverse Linked List", "LRU Cache", "Copy List with Random Pointer"]},
            {"pattern": "Binary Trees & BST Validation", "frequency": "Very High", "sample_problems": ["Validate Binary Search Tree", "Populating Next Right Pointers", "Lowest Common Ancestor of a BST"]},
            {"pattern": "Strings & Two Pointers", "frequency": "High", "sample_problems": ["Valid Palindrome", "String to Integer (atoi)", "Longest Palindromic Substring"]},
            {"pattern": "Dynamic Programming & Memoization", "frequency": "Medium-High", "sample_problems": ["Coin Change", "Climbing Stairs", "Maximum Subarray"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a project where you failed or made a significant mistake. How did you learn from it?",
                "strategy": "Showcase the Growth Mindset: Take full accountability, explain root cause analysis, and demonstrate lasting preventative improvements."
            },
            {
                "question": "How do you handle working with a difficult stakeholder or non-technical business partner?",
                "strategy": "Highlight customer empathy, translating technical trade-offs into business value, and active listening."
            }
        ],
        "preparation_roadmap": [
            "Focus heavily on clean code quality, variable naming, and OOP principles.",
            "Practice classic Linked List, Tree, and String problems on LeetCode.",
            "Understand Azure cloud primitives (Cosmos DB, Service Bus, Azure Functions).",
            "Prepare STAR examples reflecting Growth Mindset and collaborative achievements."
        ]
    },
    "meta": {
        "name": "Meta (Facebook)",
        "slug": "meta",
        "industry": "Social Media / Metaverse / AI / Advertising",
        "headquarters": "Menlo Park, California",
        "founded": "2004",
        "tier": "Tier-1 / FAANG / Social & AI Giant",
        "culture_summary": "Move Fast, Focus on Long-Term Impact, Build Awesome Things, Live in the Future. Extremely fast-paced, high speed of execution.",
        "core_values": [
            "Move Fast: Act with urgency, build quickly, don't fear calculated risks.",
            "Focus on Long-Term Impact: Prioritize work that drives massive step-function results.",
            "Build Awesome Things: Ship world-class consumer and developer experiences.",
            "Be Direct and Respectful: Radical transparency and rapid peer feedback."
        ],
        "tech_stack": {
            "frontend": ["React", "React Native", "Relay", "Flow / TypeScript"],
            "backend": ["Hack / PHP", "C++", "Python", "Rust", "Thrift RPC"],
            "databases": ["TAO (Distributed Graph Data Store)", "RocksDB", "Cassandra", "MySQL Sharded"],
            "cloud_infra": ["Custom Private Data Centers", "Tupperware Container Engine", "Bonsai"],
            "ai_ml": ["PyTorch", "Llama 3 / Llama 4", "FAISS Vector Search"]
        },
        "recent_highlights": [
            "Open-source AI leadership with Llama 3 models and open weights ecosystem.",
            "Next-generation PyTorch 2.x compiler optimizations for massive GPU clusters.",
            "Scaling real-time recommendation engines for billions of Instagram Reels and Feed users."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Technical Screen (CoderPad)",
                "duration": "45 mins",
                "format": "CoderPad Live Session",
                "focus": "2 LeetCode Medium problems in 45 mins. Speed and accuracy are strictly evaluated.",
                "passing_criteria": "Solve both problems with bug-free code and optimal time/space complexity within the time limit."
            },
            {
                "round": 2,
                "title": "Technical Onsite 1: Fast Algorithmic Coding",
                "duration": "45 mins",
                "format": "Live Coding",
                "focus": "2 LeetCode Medium/Hard problems (Binary Search, Trees, Graphs, Strings).",
                "passing_criteria": "Fast syntax, instant problem pattern recognition, clean bug-free implementation."
            },
            {
                "round": 3,
                "title": "Technical Onsite 2: Algorithmic Problem Solving",
                "duration": "45 mins",
                "format": "Live Coding",
                "focus": "2 algorithmic problems testing intervals, recursion, dynamic programming.",
                "passing_criteria": "Zero hesitation on data structure choices; rapid test verification."
            },
            {
                "round": 4,
                "title": "System Design / Product Architecture",
                "duration": "45 mins",
                "format": "Whiteboarding",
                "focus": "Design Instagram Feed, Facebook Messenger Live Chat, Newsfeed Ranking, Nearby Friends.",
                "passing_criteria": "High scalability (billions of DAU), graph databases (TAO), fan-out architectures, caching."
            },
            {
                "round": 5,
                "title": "Behavioral / Culture Fit (Jedi Round)",
                "duration": "45 mins",
                "format": "1-on-1 with Engineering Leader",
                "focus": "Resolving conflict, driving impact, handling high pressure, prioritizing fast execution.",
                "passing_criteria": "Demonstrating high agency, bias for action, and driving substantial measurable impact."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Binary Search (Variations & Rotated Arrays)", "frequency": "Very High", "sample_problems": ["Find First and Last Position of Element in Sorted Array", "Search in Rotated Sorted Array", "Koko Eating Bananas"]},
            {"pattern": "Tree & Graph Traversals (LCA, BFS, DFS)", "frequency": "Very High", "sample_problems": ["Lowest Common Ancestor of a Binary Tree", "Clone Graph", "Binary Tree Right Side View"]},
            {"pattern": "Subarray & Interval Merging", "frequency": "High", "sample_problems": ["Merge Intervals", "Minimum Remove to Make Valid Parentheses", "Continuous Subarray Sum"]},
            {"pattern": "Topological Sort & Dependencies", "frequency": "High", "sample_problems": ["Course Schedule", "Alien Dictionary"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time when you had to ship a feature under extremely tight deadlines. What trade-offs did you make?",
                "strategy": "Showcase 'Move Fast': Explain how you prioritized core MVP value, guarded against critical bugs with telemetry, and iterated rapidly post-launch."
            },
            {
                "question": "Describe a situation where a project you led did not achieve the desired impact. What did you do next?",
                "strategy": "Focus on rapid pivoting, extracting lessons through metric diagnostics, and redirecting effort to high-ROI priorities."
            }
        ],
        "preparation_roadmap": [
            "Practice solving LeetCode Medium problems in under 15-18 minutes per question.",
            "Master Meta top-tagged questions (they stick heavily to standard problem pools).",
            "Deeply understand TAO architecture and Feed generation system design principles.",
            "Emphasize personal impact, high velocity, and engineering ownership in behavioral stories."
        ]
    },
    "netflix": {
        "name": "Netflix",
        "slug": "netflix",
        "industry": "Streaming Media / Entertainment / Cloud Architecture",
        "headquarters": "Los Gatos, California",
        "founded": "1997",
        "tier": "Tier-1 / FAANG / High Autonomy",
        "culture_summary": "Famed 'Freedom and Responsibility' culture memo. High density of senior talent, stunning colleagues, open compensation, context not control.",
        "core_values": [
            "Freedom and Responsibility: Autonomous decision making with extreme accountability.",
            "Context Not Control: Leaders set the strategic context rather than micromanaging.",
            "Stunning Colleagues: Only retain top-tier performers (The Keeper Test)."
        ],
        "tech_stack": {
            "frontend": ["React", "Node.js", "GraphQL", "Web Workers"],
            "backend": ["Java (Spring Boot)", "Node.js", "Python", "Go", "gRPC"],
            "databases": ["Cassandra", "CockroachDB", "EVCache (Memcached)", "Elasticsearch"],
            "cloud_infra": ["AWS 100%", "Titus Container Management", "Spinnaker CI/CD", "Chaos Monkey"],
            "ai_ml": ["Personalized Recommendation Engine", "Video Encoding Optimization AI"]
        },
        "recent_highlights": [
            "Global expansion of ad-supported streaming tiers and interactive gaming catalog.",
            "Resilience testing with chaos engineering and automated region-failover routing.",
            "Microservices consolidation into Federated GraphQL Gateway architecture."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Recruiter & Technical Screen",
                "duration": "45 mins",
                "format": "Video Call + Code Sandbox",
                "focus": "Core domain architecture, concurrency, system design principles, and culture discussion."
            },
            {
                "round": 2,
                "title": "Technical Deep Dive 1: Advanced Concurrency & Systems",
                "duration": "60 mins",
                "format": "Live Coding & Architecture",
                "focus": "Multithreading, asynchronous execution, memory management, and distributed caching."
            },
            {
                "round": 3,
                "title": "System Design & Resilience Engineering",
                "duration": "60 mins",
                "format": "Whiteboarding",
                "focus": "Design Global Video Transcoder, Live Streaming Architecture, Personalized Recommendation Feed."
            },
            {
                "round": 4,
                "title": "Culture & Leadership: Freedom and Responsibility",
                "duration": "60 mins",
                "format": "1-on-1 with Engineering Director",
                "focus": "Keeper test scenarios, giving tough feedback, independent decision making under high ambiguity."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Concurrency & Multithreading", "frequency": "Very High", "sample_problems": ["Design Bounded Blocking Queue", "Print in Order", "Dining Philosophers"]},
            {"pattern": "Caching & LRU/LFU Systems", "frequency": "High", "sample_problems": ["LRU Cache", "LFU Cache", "Design In-Memory File System"]},
            {"pattern": "Dynamic Programming & Rate Limiting", "frequency": "High", "sample_problems": ["Sliding Window Rate Limiter", "Decode Ways"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you gave candid, critical feedback to a senior colleague or manager. How was it received?",
                "strategy": "Demonstrate the Netflix culture of selfless honesty: Focus on the company's best interest, deliver feedback constructively and privately."
            }
        ],
        "preparation_roadmap": [
            "Read the entire Netflix Culture Memo ('Freedom and Responsibility') multiple times.",
            "Master Chaos Engineering concepts, circuit breakers (Resilience4j), and AWS multi-region failover.",
            "Be prepared to explain deep architectural trade-offs with senior-level maturity."
        ]
    },
    "uber": {
        "name": "Uber",
        "slug": "uber",
        "industry": "Ridesharing / Delivery / Freight / Real-time Logistics",
        "headquarters": "San Francisco, California",
        "founded": "2009",
        "tier": "Tier-1 / Ride-Tech / Distributed Systems",
        "culture_summary": "Go get it, trip obsessed, build with heart, celebrate differences. High emphasis on real-time distributed systems, geospatial indexing, and low-latency dispatch.",
        "core_values": [
            "Trip Obsessed: Relentless focus on driver and rider safety and real-time reliability.",
            "Go Get It: Move proactively, challenge constraints, execute with tenacity.",
            "Build With Heart: Build accessible products for millions of global users."
        ],
        "tech_stack": {
            "frontend": ["React", "Base Web Design System", "TypeScript", "React Native"],
            "backend": ["Go (Golang)", "Java", "Python", "gRPC"],
            "databases": ["Docstore (MySQL sharded)", "Schemaless", "Cassandra", "Redis", "Pinot"],
            "cloud_infra": ["Hybrid Cloud (GCP / AWS / Private)", "Mesos & Kubernetes", "Kafka Pipelines"],
            "geospatial": ["H3 (Hexagonal Hierarchical Spatial Index)"]
        },
        "recent_highlights": [
            "Scaling H3 spatial indexing for dynamic surge pricing and hyper-local driver dispatch.",
            "Migration of event-driven infrastructure onto multi-million message/sec Apache Kafka clusters.",
            "Advertising network expansion across Uber Eats and Mobility platforms."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Online Assessment (CodeSignal)",
                "duration": "70 mins",
                "format": "CodeSignal General Coding Assessment",
                "focus": "4 algorithmic challenges testing speed, edge case coverage, and 2D matrix manipulation."
            },
            {
                "round": 2,
                "title": "Technical Round 1: Algorithms & Data Structures",
                "duration": "60 mins",
                "format": "Live Coding",
                "focus": "Graphs (Dijkstra, Topological Sort), 2D Grid BFS/DFS, Trie, Heaps."
            },
            {
                "round": 3,
                "title": "Technical Round 2: Machine Coding / OOP Design",
                "duration": "60 mins",
                "format": "Live Coding / IDE",
                "focus": "Implement Ride Matching Engine, Multi-threaded Parking Lot, Rate Limiter in real code."
            },
            {
                "round": 4,
                "title": "System Design: Geospatial & Real-time Dispatch",
                "duration": "60 mins",
                "format": "Virtual Whiteboard",
                "focus": "Design Uber Dispatch Service, Real-time Driver Tracking, Surge Pricing Calculation."
            },
            {
                "round": 5,
                "title": "Hiring Manager / Cultural Alignment",
                "duration": "45 mins",
                "format": "1-on-1",
                "focus": "Operational resilience, incidents management, customer obsession, cross-team collaboration."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Geospatial & 2D Grid Algorithms", "frequency": "Very High", "sample_problems": ["Shortest Path in a Grid with Obstacles Elimination", "Bus Routes", "Cheapest Flights Within K Stops"]},
            {"pattern": "Heap & Priority Queues (Real-time dispatching)", "frequency": "Very High", "sample_problems": ["Find Median from Data Stream", "Meeting Rooms II", "Task Scheduler"]},
            {"pattern": "Trie & Prefix Matching", "frequency": "High", "sample_problems": ["Design Search Autocomplete System", "Replace Words"]}
        ],
        "behavioral_questions": [
            {
                "question": "Describe a major production outage you caused or debugged. How did you stabilize it and prevent recurrence?",
                "strategy": "Demonstrate calm under pressure, systematic metric debugging, rollback strategy, and thorough blameless post-mortem."
            }
        ],
        "preparation_roadmap": [
            "Study Uber's H3 spatial indexing library and quadtree/geohash concepts for system design.",
            "Practice Graph shortest path algorithms (Dijkstra, Bellman-Ford, A*) and Grid BFS.",
            "Be prepared to write full working OOP code for a mini-system during machine coding rounds."
        ]
    }
}

def get_company_intelligence(company_name: str) -> Dict[str, Any]:
    """
    Retrieves deep company intelligence profile.
    Checks pre-compiled knowledge base first, falls back to dynamic AI extraction with Gemini.
    """
    normalized_name = company_name.strip().lower()
    
    # Direct match in knowledge base
    for key, profile in COMPANY_KNOWLEDGE_BASE.items():
        if key in normalized_name or normalized_name in key:
            return profile

    # Dynamic Gemini AI generation for any custom company
    return generate_dynamic_company_intelligence(company_name)

def generate_dynamic_company_intelligence(company_name: str) -> Dict[str, Any]:
    """
    Dynamically generates comprehensive interview and technical profile for any tech company.
    """
    prompt = f"""
You are an authoritative engineering director and tech industry analyst.
Generate an exhaustive technical intelligence report and interview preparation breakdown for '{company_name}'.

Respond strictly in valid JSON matching this schema:
{{
  "name": "{company_name}",
  "slug": "{company_name.lower().replace(' ', '-')}",
  "industry": "<e.g. Fintech / E-Commerce / SaaS / AI>",
  "headquarters": "<location>",
  "founded": "<year>",
  "tier": "<e.g. Tier-1 / Unicorn / High-Growth Startup / Enterprise>",
  "culture_summary": "<summary of engineering culture, values, and operating philosophy>",
  "core_values": [
    "<Core value 1 with explanation>",
    "<Core value 2 with explanation>",
    "<Core value 3 with explanation>"
  ],
  "tech_stack": {{
    "frontend": ["<Framework 1>", "<Framework 2>"],
    "backend": ["<Language 1>", "<Language 2>", "<Framework>"],
    "databases": ["<DB 1>", "<DB 2>"],
    "cloud_infra": ["<Cloud provider>", "<Container tool>", "<CI/CD>"],
    "ai_ml": ["<AI tool/focus>"]
  }},
  "recent_highlights": [
    "<recent engineering initiative, tech stack migration, or company news 1>",
    "<recent engineering initiative 2>"
  ],
  "interview_rounds": [
    {{
      "round": 1,
      "title": "<Round Title, e.g. Online Assessment>",
      "duration": "<e.g. 60 mins>",
      "format": "<Platform / Format>",
      "focus": "<Topics tested>",
      "passing_criteria": "<What evaluators look for>"
    }},
    {{
      "round": 2,
      "title": "<Round Title, e.g. Technical DSA Round 1>",
      "duration": "<e.g. 45-60 mins>",
      "format": "<Format>",
      "focus": "<Data structures & algorithms focus>",
      "passing_criteria": "<Evaluation criteria>"
    }},
    {{
      "round": 3,
      "title": "<Round Title, e.g. Technical Depth / System Design>",
      "duration": "<e.g. 60 mins>",
      "format": "<Format>",
      "focus": "<System architecture & problem solving>",
      "passing_criteria": "<Evaluation criteria>"
    }},
    {{
      "round": 4,
      "title": "<Round Title, e.g. Hiring Manager & Cultural Fit>",
      "duration": "<e.g. 45 mins>",
      "format": "<Format>",
      "focus": "<Behavioral, values, leadership>",
      "passing_criteria": "<Evaluation criteria>"
    }}
  ],
  "dsa_patterns": [
    {{"pattern": "<Pattern name, e.g. Graph Traversal / Dynamic Programming>", "frequency": "<Very High | High | Medium>", "sample_problems": ["<Problem 1>", "<Problem 2>"]}},
    {{"pattern": "<Pattern name 2>", "frequency": "<High | Medium>", "sample_problems": ["<Problem 3>", "<Problem 4>"]}}
  ],
  "behavioral_questions": [
    {{
      "question": "<Specific behavioral question commonly asked at {company_name}>",
      "strategy": "<Strategic guidance on how to answer effectively>"
    }}
  ],
  "preparation_roadmap": [
    "<Actionable prep step 1>",
    "<Actionable prep step 2>",
    "<Actionable prep step 3>"
  ]
}}
"""
    try:
        raw = query_gemini(prompt, json_mode=True)
        res = extract_json(raw)
        if isinstance(res, dict) and "name" in res:
            return res
    except Exception as e:
        logger.warning(f"Dynamic company generation fallback used for '{company_name}': {e}")

    # Fallback generic tech company profile
    return {
        "name": company_name.title(),
        "slug": company_name.lower().replace(" ", "-"),
        "industry": "Software Engineering & Technology",
        "headquarters": "Global / Remote",
        "founded": "N/A",
        "tier": "Competitive Tech",
        "culture_summary": "Fast-paced, engineering ownership, collaborative problem solving, customer focus.",
        "core_values": [
            "Ownership: Drive projects from concept to production with high quality.",
            "Technical Excellence: Strive for clean architecture, low latency, and modular design.",
            "Customer Empathy: Build solutions that directly resolve end-user pain points."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Next.js", "Tailwind CSS"],
            "backend": ["Node.js", "Python / FastAPI", "Java", "Go", "REST / GraphQL"],
            "databases": ["PostgreSQL", "MongoDB", "Redis"],
            "cloud_infra": ["AWS", "Docker", "Kubernetes", "GitHub Actions"],
            "ai_ml": ["OpenAI / Gemini APIs", "Vector Search"]
        },
        "recent_highlights": [
            "Modernizing microservices to event-driven architectures with high test coverage.",
            "Integrating LLM-powered automation into core business workflows."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Online Coding Screen",
                "duration": "60 mins",
                "format": "HackerRank / CodeSignal",
                "focus": "Data Structures & Algorithms (Arrays, Strings, Hash Maps, Recursion).",
                "passing_criteria": "Optimal time & space complexity, all test cases passing."
            },
            {
                "round": 2,
                "title": "Technical Interview: DSA & Live Coding",
                "duration": "45-60 mins",
                "format": "Live Coding with Senior Engineer",
                "focus": "Trees, Graphs, Sliding Window, Dynamic Programming.",
                "passing_criteria": "Active communication, clean modular code, edge case testing."
            },
            {
                "round": 3,
                "title": "System Architecture / Engineering Depth",
                "duration": "45-60 mins",
                "format": "Whiteboarding / Technical Discussion",
                "focus": "REST API design, database modeling, caching, scalability bottlenecks.",
                "passing_criteria": "Structured thought process, understanding CAP theorem and trade-offs."
            },
            {
                "round": 4,
                "title": "Managerial & Culture Fit",
                "duration": "45 mins",
                "format": "1-on-1 with Engineering Manager",
                "focus": "Behavioral STAR questions, past projects, conflict resolution, career goals.",
                "passing_criteria": "High alignment with company values, ownership mindset."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Arrays, Two Pointers & Sliding Window", "frequency": "Very High", "sample_problems": ["Two Sum", "3Sum", "Minimum Window Substring"]},
            {"pattern": "Trees & Graph BFS/DFS", "frequency": "High", "sample_problems": ["Number of Islands", "Binary Tree Level Order Traversal", "Clone Graph"]},
            {"pattern": "Dynamic Programming & Memoization", "frequency": "Medium-High", "sample_problems": ["Coin Change", "Longest Common Subsequence"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a complex project you engineered and the major technical trade-offs you made.",
                "strategy": "Use the STAR method, highlighting the business context, technical choices, and quantifiable outcomes."
            }
        ],
        "preparation_roadmap": [
            "Practice medium-difficulty LeetCode problems focusing on arrays, trees, and graphs.",
            "Review system design basics: caching (Redis), indexing, sharding, and message queues.",
            "Prepare 3-4 structured STAR stories covering leadership, technical conflicts, and problem-solving."
        ]
    }

def list_featured_companies() -> List[Dict[str, Any]]:
    """Returns list of curated top-tier companies with summaries."""
    return [
        {
            "name": p["name"],
            "slug": p["slug"],
            "industry": p["industry"],
            "tier": p["tier"],
            "culture_highlight": p["core_values"][0] if p.get("core_values") else "",
            "top_stack": p["tech_stack"]["backend"][:3] if p.get("tech_stack") else []
        }
        for p in COMPANY_KNOWLEDGE_BASE.values()
    ]
