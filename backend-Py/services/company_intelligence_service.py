import json
import logging
from typing import Dict, Any, List, Optional
from services.gemini_client import query_gemini, extract_json

logger = logging.getLogger("company_intelligence_service")

# High-fidelity built-in database for the 20 Curated Premier Tech Companies
COMPANY_KNOWLEDGE_BASE: Dict[str, Dict[str, Any]] = {
    "google": {
        "name": "Google",
        "fullName": "Google (Alphabet)",
        "slug": "google",
        "domain": "google.com",
        "logo_url": "https://cdn.simpleicons.org/google",
        "industry": "Big Tech / Cloud / Search / AI",
        "headquarters": "Mountain View, California",
        "founded": "1998",
        "tier": "Tier-1 / FAANG / Big Tech",
        "avg_package_lpa": 45,
        "avgPackageLpa": 45,
        "ctc_range": "₹35L - ₹58L / yr",
        "min_cgpa": 8.0,
        "minCgpa": 8.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["All Branches", "CS/IT", "ECE", "EEE", "Mechanical", "Civil"],
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
    "microsoft": {
        "name": "Microsoft",
        "fullName": "Microsoft Corporation",
        "slug": "microsoft",
        "domain": "microsoft.com",
        "logo_url": "https://cdn.simpleicons.org/microsoft",
        "industry": "Enterprise Software / Cloud / OS / AI",
        "headquarters": "Redmond, Washington",
        "founded": "1975",
        "tier": "Tier-1 / Big Tech / Cloud Giant",
        "avg_package_lpa": 44,
        "avgPackageLpa": 44,
        "ctc_range": "₹32L - ₹52L / yr",
        "min_cgpa": 7.5,
        "minCgpa": 7.5,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "Circuit Branches", "ECE", "EEE", "Maths & Computing"],
        "culture_summary": "Growth Mindset driven: Learn-it-all rather than know-it-all. Emphasis on customer empathy, diverse perspectives, and One Microsoft synergy.",
        "core_values": [
            "Growth Mindset: Embrace challenges, learn from criticism, find lessons in failure.",
            "Customer Empathy: Listen deeply to enterprise and consumer needs.",
            "One Microsoft: Collaborate seamlessly across divisional boundaries."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Fluent UI", "Electron"],
            "backend": ["C# / .NET Core", "C++", "Java", "Python", "Go"],
            "databases": ["Azure Cosmos DB", "Azure SQL", "PostgreSQL", "Redis"],
            "cloud_infra": ["Microsoft Azure", "Azure DevOps", "Kubernetes (AKS)", "GitHub Actions"],
            "ai_ml": ["Azure OpenAI Service", "Copilot Framework", "PyTorch", "ONNX Runtime"]
        },
        "recent_highlights": [
            "Pioneering Generative AI integrations via Copilot ecosystem across Windows, Office, and GitHub.",
            "Expanding Azure hyperscale AI cloud infrastructure for global enterprise workloads.",
            "Accelerating open-source contributions across TypeScript, VS Code, and Playwright."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Online Assessment (OA)",
                "duration": "70-90 mins",
                "format": "Codility / Mettl",
                "focus": "2-3 coding problems on arrays, strings, trees, and linked lists.",
                "passing_criteria": "High code quality, clean modular helper methods, and full test suite pass."
            },
            {
                "round": 2,
                "title": "Technical Round 1: DSA & Problem Solving",
                "duration": "45-60 mins",
                "format": "Live Code Sandbox",
                "focus": "Binary Trees, BST, Linked Lists, Two Pointers, Recursion.",
                "passing_criteria": "Demonstrating clear edge case identification and solid OOP modularity."
            },
            {
                "round": 3,
                "title": "Technical Round 2: Low Level Design & Core CS",
                "duration": "45-60 mins",
                "format": "Live Coding & Design",
                "focus": "OOP Design Patterns (SOLID), Concurrency, Memory Management, OS/DBMS concepts.",
                "passing_criteria": "Extensible class structure, interface separation, and thread safety."
            },
            {
                "round": 4,
                "title": "AA Round / Director Interview (Culture & Systems)",
                "duration": "45-60 mins",
                "format": "Virtual 1-on-1 with Partner/Principal",
                "focus": "High Level System Design + Growth Mindset behavioral questions.",
                "passing_criteria": "Strong product sense, architectural trade-off articulation, and empathy."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Trees & Binary Search Trees", "frequency": "Very High", "sample_problems": ["Serialize and Deserialize Binary Tree", "Lowest Common Ancestor", "Construct Tree from Preorder/Inorder"]},
            {"pattern": "Linked Lists & Pointers", "frequency": "High", "sample_problems": ["LRU Cache", "Merge K Sorted Lists", "Reverse Nodes in k-Group"]},
            {"pattern": "Dynamic Programming & Strings", "frequency": "High", "sample_problems": ["Word Break", "Longest Palindromic Substring"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you failed or made a mistake on a project. What did you learn and how did you adapt?",
                "strategy": "Demonstrate authentic Growth Mindset: take total accountability, explain the remediation, and show permanent systemic improvements."
            }
        ],
        "preparation_roadmap": [
            "Solve top Microsoft-tagged LeetCode problems (emphasis on Trees, Lists, and DP).",
            "Review Low Level Design principles (Factory, Singleton, Observer, Strategy patterns).",
            "Prepare STAR stories illustrating cross-team collaboration and customer empathy."
        ]
    },
    "amazon": {
        "name": "Amazon",
        "fullName": "Amazon (AWS)",
        "slug": "amazon",
        "domain": "amazon.com",
        "logo_url": "https://cdn.simpleicons.org/amazon",
        "industry": "E-Commerce / Cloud Computing / AI / Logistics",
        "headquarters": "Seattle, Washington",
        "founded": "1994",
        "tier": "Tier-1 / FAANG / Cloud Giant",
        "avg_package_lpa": 38,
        "avgPackageLpa": 38,
        "ctc_range": "₹30L - ₹48L / yr",
        "min_cgpa": 7.0,
        "minCgpa": 7.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["All Engineering Branches"],
        "culture_summary": "Deeply governed by the 16 Leadership Principles (LPs). High operational excellence, bias for action, frugal engineering, customer obsession.",
        "core_values": [
            "Customer Obsession: Leaders start with the customer and work backwards.",
            "Ownership & Bias for Action: Leaders think long term and value calculated risk-taking.",
            "Dive Deep & Have Backbone: Leaders operate at all levels and respectfully challenge decisions.",
            "Deliver Results: Focus on key inputs and deliver with high quality despite setbacks."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Micro-frontends", "CloudFront"],
            "backend": ["Java", "Kotlin", "C++", "Python", "Coral Framework"],
            "databases": ["DynamoDB", "Aurora", "OpenSearch", "ElastiCache (Redis)"],
            "cloud_infra": ["Amazon Web Services (AWS)", "ECS / EKS", "Lambda", "SQS / SNS / Kinesis"],
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
                "title": "Technical Round 1: DSA & Problem Solving",
                "duration": "60 mins",
                "format": "Live Coding (Amazon Chime)",
                "focus": "20 mins LP behavioral questions + 40 mins algorithmic problem solving.",
                "passing_criteria": "Strong STAR method behavioral answers + clean O(N) or O(N log N) code."
            },
            {
                "round": 3,
                "title": "Technical Round 2: Data Structures & LLD",
                "duration": "60 mins",
                "format": "Live Coding & Object Modeling",
                "focus": "20 mins LPs + Object-Oriented Design (e.g. Parking Lot, File System, Locker System).",
                "passing_criteria": "Clean OOP separation, SOLID principles, and concurrency handling."
            },
            {
                "round": 4,
                "title": "Bar Raiser Interview",
                "duration": "60 mins",
                "format": "1-on-1 with independent Bar Raiser",
                "focus": "Deep dive into 2-3 complex LPs (Dive Deep, Disagree and Commit, Customer Obsession).",
                "passing_criteria": "Quantified results in STAR stories, proving candidate raises the team median."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Binary Trees & BST", "frequency": "Very High", "sample_problems": ["Lowest Common Ancestor", "Binary Tree Zigzag Level Order", "Validate BST"]},
            {"pattern": "Heaps & Top-K Elements", "frequency": "High", "sample_problems": ["Top K Frequent Elements", "Kth Largest in Stream", "Find Median from Data Stream"]},
            {"pattern": "BFS / DFS & Grid Traversal", "frequency": "High", "sample_problems": ["Number of Islands", "Rotting Oranges", "Word Ladder"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you used customer feedback to guide a technical decision.",
                "strategy": "Structure with STAR: Situation (customer pain point) -> Task -> Action (working backwards) -> Result (measurable metric)."
            }
        ],
        "preparation_roadmap": [
            "Prepare 2 distinct STAR stories for EACH of the top 10 Amazon Leadership Principles.",
            "Solve Top 100 Amazon LeetCode questions with emphasis on Trees, Heaps, and Graphs.",
            "Practice Object-Oriented Low Level Design with clean Java/C++ classes."
        ]
    },
    "meta": {
        "name": "Meta",
        "fullName": "Meta Platforms",
        "slug": "meta",
        "domain": "meta.com",
        "logo_url": "https://cdn.simpleicons.org/meta",
        "industry": "Social Media / VR / AI / Web Tech",
        "headquarters": "Menlo Park, California",
        "founded": "2004",
        "tier": "Tier-1 / FAANG / Social & AI",
        "avg_package_lpa": 48,
        "avgPackageLpa": 48,
        "ctc_range": "₹38L - ₹62L / yr",
        "min_cgpa": 8.0,
        "minCgpa": 8.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE", "Circuit Branches"],
        "culture_summary": "Move Fast, Focus on Long-Term Impact, Build Awesome Things, Live in the Future. High engineering ownership and peer-driven culture.",
        "core_values": [
            "Move Fast: Accelerate feedback loops, unblock yourself, deploy continuously.",
            "Focus on Long-Term Impact: Don't settle for incremental progress.",
            "Be Direct & Respectful: Give honest, constructive feedback."
        ],
        "tech_stack": {
            "frontend": ["React", "React Native", "Relay (GraphQL)", "Flow / TypeScript"],
            "backend": ["C++", "Hack / PHP", "Python", "Rust"],
            "databases": ["TAO (Distributed Graph Data Store)", "RocksDB", "MySQL Sharded"],
            "cloud_infra": ["Custom Hyperscale Data Centers", "Tupperware Container Orchestration"],
            "ai_ml": ["PyTorch", "Llama 3.x", "Fairseq", "GPU Cluster Orchestration"]
        },
        "recent_highlights": [
            "Open-source AI leadership with Llama 3 / 3.1 model weights and PyTorch 2.x ecosystem.",
            "End-to-end modernization of recommendation engines for Reels and Instagram using deep learning.",
            "High performance infrastructure optimizations for next-gen spatial compute."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Technical Screen (Coding)",
                "duration": "45 mins",
                "format": "CoderPad",
                "focus": "2 medium/hard algorithmic problems solved with working code in 45 minutes.",
                "passing_criteria": "Speed and precision: Write bug-free code quickly with optimal Big-O complexity."
            },
            {
                "round": 2,
                "title": "Coding Round 1 (Algorithms)",
                "duration": "45 mins",
                "format": "CoderPad",
                "focus": "2 algorithmic questions (Binary Search, Two Pointers, Dynamic Programming).",
                "passing_criteria": "Complete both questions with verified test cases within time limit."
            },
            {
                "round": 3,
                "title": "Coding Round 2 (Data Structures)",
                "duration": "45 mins",
                "format": "CoderPad",
                "focus": "2 algorithmic questions (Graphs, Trees, Interval Scheduling).",
                "passing_criteria": "Clean variable names, clear communication, proactive complexity analysis."
            },
            {
                "round": 4,
                "title": "System Design (Product / Systems Architecture)",
                "duration": "45 mins",
                "format": "Virtual Whiteboard",
                "focus": "Design News Feed, Messenger, Live Video Streaming, or Distributed Rate Limiter.",
                "passing_criteria": "Scale estimation, database schema & caching, API contracts, bottleneck handling."
            },
            {
                "round": 5,
                "title": "Behavioral & Cultural Fit",
                "duration": "45 mins",
                "format": "1-on-1 with Engineering Leader",
                "focus": "Impact orientation, handling conflict, cross-functional collaboration, ownership.",
                "passing_criteria": "Strong evidence of driving measurable technical impact."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Binary Search & Sliding Window", "frequency": "Very High", "sample_problems": ["Minimum Window Substring", "Find First and Last Position", "Koko Eating Bananas"]},
            {"pattern": "Graph Algorithms & BFS", "frequency": "High", "sample_problems": ["Accounts Merge", "Clone Graph", "Shortest Path in Binary Matrix"]},
            {"pattern": "Tree Traversal & Recursion", "frequency": "High", "sample_problems": ["Lowest Common Ancestor III", "Range Sum of BST", "Vertical Order Traversal"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about your most technically challenging project and the tangible impact it delivered.",
                "strategy": "Highlight concrete impact metrics (users served, latency slashed, revenue generated) and personal technical ownership."
            }
        ],
        "preparation_roadmap": [
            "Practice solving 2 LeetCode Mediums in under 40 minutes on CoderPad.",
            "Master Meta-tagged top 75 LeetCode problems.",
            "Study modern high-scale system design architectures (Graph databases, Caching, Push notification services)."
        ]
    },
    "apple": {
        "name": "Apple",
        "fullName": "Apple Inc.",
        "slug": "apple",
        "domain": "apple.com",
        "logo_url": "https://cdn.simpleicons.org/apple",
        "industry": "Consumer Electronics / Hardware / OS / Cloud",
        "headquarters": "Cupertino, California",
        "founded": "1976",
        "tier": "Tier-1 / FAANG / Ecosystem",
        "avg_package_lpa": 46,
        "avgPackageLpa": 46,
        "ctc_range": "₹36L - ₹60L / yr",
        "min_cgpa": 8.0,
        "minCgpa": 8.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE", "EE"],
        "culture_summary": "Uncompromising obsession with craftsmanship, user privacy, pixel perfection, and vertical hardware-software integration.",
        "core_values": [
            "Craftsmanship: Sweat every single detail of performance, UX, and memory footprint.",
            "User Privacy: Privacy is a fundamental human right built directly into architecture.",
            "Deep Collaboration: Work across silicon, firmware, kernel, and UI boundaries."
        ],
        "tech_stack": {
            "frontend": ["SwiftUI", "UIKit", "React", "WebKit"],
            "backend": ["Swift", "C++", "Objective-C", "Java", "Python"],
            "databases": ["FoundationDB (Distributed ACID Key-Value)", "Cassandra", "CoreData", "PostgreSQL"],
            "cloud_infra": ["iCloud CloudKit", "Kubernetes", "Custom CDN"],
            "ai_ml": ["CoreML", "Apple Intelligence", "Metal Performance Shaders (MPS)"]
        },
        "recent_highlights": [
            "Apple Intelligence on-device private cloud compute architecture.",
            "Swift 6 data race safety and concurrency modernization.",
            "FoundationDB open-source distributed database scaling."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Recruiter & Technical Screen",
                "duration": "45 mins",
                "format": "Phone / Live Code",
                "focus": "C++ / Swift fundamentals, memory management, and 1 DSA question."
            },
            {
                "round": 2,
                "title": "Technical Deep Dive (Algorithms & Memory)",
                "duration": "60 mins",
                "format": "Live Sandbox",
                "focus": "Pointers, memory layout, cache locality, and algorithmic problem solving."
            },
            {
                "round": 3,
                "title": "Systems / Architecture Round",
                "duration": "60 mins",
                "format": "Whiteboard",
                "focus": "Low-level system architecture, threading, locks, and latency optimization."
            },
            {
                "round": 4,
                "title": "Team Fit & Craftsmanship",
                "duration": "45 mins",
                "format": "Manager 1-on-1",
                "focus": "Attention to detail, passion for user experience, and past project code quality."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Pointers & Memory Arrays", "frequency": "Very High", "sample_problems": ["LRU Cache", "Trapping Rain Water", "Sliding Window Maximum"]},
            {"pattern": "Trees & Recursion", "frequency": "High", "sample_problems": ["Binary Tree Maximum Path Sum", "Diameter of Binary Tree"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you went the extra mile to polish a technical detail that nobody asked for.",
                "strategy": "Showcase pride in craftsmanship, deep care for the user, and high personal standards."
            }
        ],
        "preparation_roadmap": [
            "Review low-level OS internals: virtual memory, cache lines, multithreading.",
            "Practice writing clean, high-performance C++/Swift algorithms.",
            "Prepare detailed technical defenses of your proudest engineering projects."
        ]
    },
    "netflix": {
        "name": "Netflix",
        "fullName": "Netflix, Inc.",
        "slug": "netflix",
        "domain": "netflix.com",
        "logo_url": "https://cdn.simpleicons.org/netflix",
        "industry": "Streaming Media / Entertainment / Cloud",
        "headquarters": "Los Gatos, California",
        "founded": "1997",
        "tier": "Tier-1 / FAANG / High Autonomy",
        "avg_package_lpa": 52,
        "avgPackageLpa": 52,
        "ctc_range": "₹42L - ₹70L / yr",
        "min_cgpa": 8.0,
        "minCgpa": 8.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE"],
        "culture_summary": "Famous Culture Memo: Freedom and Responsibility. Context not Control. Highly compensated senior talent with extraordinary autonomy.",
        "core_values": [
            "Freedom & Responsibility: High autonomy for high-performing, self-disciplined engineers.",
            "Context Not Control: Provide transparent objectives rather than micromanaging.",
            "Radical Candor: Direct, compassionate peer feedback."
        ],
        "tech_stack": {
            "frontend": ["React", "Node.js", "GraphQL", "WebTV Engine"],
            "backend": ["Java / Spring Boot", "Node.js", "Python", "Go", "gRPC"],
            "databases": ["Cassandra", "EVCache (Memcached)", "CockroachDB", "PostgreSQL"],
            "cloud_infra": ["AWS Hyperscale", "Spinnaker (CI/CD)", "Titus (Container Platform)", "Chaos Monkey"],
            "ai_ml": ["Metaflow", "PyTorch", "Personalized Recommendation Engine"]
        },
        "recent_highlights": [
            "Pioneering cloud resilience with automated Chaos Engineering and Spinnaker pipelines.",
            "Advancing global low-latency CDN (Open Connect) and adaptive bitrate streaming algorithms.",
            "Metaflow framework open-source leadership for machine learning workflows."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Technical & Culture Screen",
                "duration": "45 mins",
                "format": "Live Sandbox",
                "focus": "1 complex system/algorithmic problem + in-depth discussion on Netflix Culture memo."
            },
            {
                "round": 2,
                "title": "Distributed System Design",
                "duration": "60 mins",
                "format": "Architecture Whiteboard",
                "focus": "Design Video Ingestion pipeline, Global Session Service, or Live Stream Archiver."
            },
            {
                "round": 3,
                "title": "Algorithmic & Concurrency Deep Dive",
                "duration": "60 mins",
                "format": "Live Coding",
                "focus": "High concurrency data structures, rate limiting, and asynchronous event processing."
            },
            {
                "round": 4,
                "title": "Executive Culture & Leadership",
                "duration": "45 mins",
                "format": "1-on-1 with Director",
                "focus": "Freedom & Responsibility scenarios, radical candor, and ownership."
            }
        ],
        "dsa_patterns": [
            {"pattern": "High Concurrency & Caching", "frequency": "Very High", "sample_problems": ["LRU Cache", "LFU Cache", "Design Rate Limiter"]},
            {"pattern": "Intervals & Stream Processing", "frequency": "High", "sample_problems": ["Merge Intervals", "Non-overlapping Intervals", "Find Median in Data Stream"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you took a calculated, high-stakes risk without asking for supervisor approval.",
                "strategy": "Showcase context gathering, risk containment, contingency planning, and ownership."
            }
        ],
        "preparation_roadmap": [
            "Read and deeply reflect upon the official Netflix Culture document.",
            "Master Distributed Systems principles (CAP theorem, Cassandra partition keys, caching).",
            "Solve LeetCode Hard concurrency, caching, and stream processing challenges."
        ]
    },
    "uber": {
        "name": "Uber",
        "fullName": "Uber Technologies",
        "slug": "uber",
        "domain": "uber.com",
        "logo_url": "https://cdn.simpleicons.org/uber",
        "industry": "Mobility / Logistics / Distributed Tech",
        "headquarters": "San Francisco, California",
        "founded": "2009",
        "tier": "Tier-1 / High Scale Distributed",
        "avg_package_lpa": 48,
        "avgPackageLpa": 48,
        "ctc_range": "₹38L - ₹60L / yr",
        "min_cgpa": 8.0,
        "minCgpa": 8.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "Circuit Branches"],
        "culture_summary": "Trip Obsessed, Go Get It, Build with Heart, See the Forest and the Trees. High engineering standards for low-latency real-time spatial marketplace.",
        "core_values": [
            "Trip Obsessed: Relentlessly safeguard the rider, driver, and eater experience.",
            "Go Get It: Bring passion, grit, and high ownership to ambitious engineering challenges.",
            "Blameless Post-Mortems: Treat outages as learning opportunities."
        ],
        "tech_stack": {
            "frontend": ["React", "React Native", "Base Web Design System"],
            "backend": ["Go", "Java", "Python", "gRPC", "Protobuf"],
            "databases": ["Docstore (M3DB / Cassandra wrapper)", "MySQL", "Redis", "H3 Spatial Index"],
            "cloud_infra": ["Kafka (Trillions of events/day)", "Kubernetes (Peloton)", "Cadence/Temporal Workflows"],
            "ai_ml": ["Michelangelo ML Platform", "PyTorch", "Real-Time Surge Pricing Engine"]
        },
        "recent_highlights": [
            "Migration of core microservices to Go and high-throughput gRPC.",
            "Real-time event streaming scaling with Apache Kafka and Flink.",
            "Spatial indexing innovations via H3 hierarchical hexagonal system."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Online Assessment (OA)",
                "duration": "70-90 mins",
                "format": "CodeSignal",
                "focus": "4 algorithmic questions testing speed, matrices, maps, and dynamic programming."
            },
            {
                "round": 2,
                "title": "Technical Round 1: DSA & Graph Algorithms",
                "duration": "60 mins",
                "format": "Live Sandbox",
                "focus": "Graph Shortest Paths (Dijkstra, A*), Geospatial algorithms, Trees."
            },
            {
                "round": 3,
                "title": "Technical Round 2: Machine Coding / LLD",
                "duration": "60 mins",
                "format": "Live Coding (Clean Architecture)",
                "focus": "Design Ride Matching Engine, Rate Limiter, or Trip Dispatcher with concurrency."
            },
            {
                "round": 4,
                "title": "System Design & Uber Values",
                "duration": "60 mins",
                "format": "Architecture & Values",
                "focus": "Real-time location ingestion, Kafka streaming, and Uber culture alignment."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Graph Shortest Path & BFS", "frequency": "Very High", "sample_problems": ["Network Delay Time", "Cheapest Flights Within K Stops", "Word Ladder II"]},
            {"pattern": "2D Matrices & Geospatial", "frequency": "High", "sample_problems": ["Surrounded Regions", "Number of Islands", "Shortest Path in a Grid with Obstacles"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a production incident you caused or investigated. What was the root cause and resolution?",
                "strategy": "Showcase blameless analysis, deep metric auditing, and architectural fixes to prevent recurrence."
            }
        ],
        "preparation_roadmap": [
            "Master Graph algorithms (Dijkstra, Bellman-Ford, Topological Sort) and Matrix traversals.",
            "Study Low Level Design with multi-threading (Producer-Consumer, ReadWriteLock in Go/Java).",
            "Understand Real-Time Event Architecture (Kafka, WebSocket, Geospatial indexing)."
        ]
    },
    "atlassian": {
        "name": "Atlassian",
        "fullName": "Atlassian Corporation",
        "slug": "atlassian",
        "domain": "atlassian.com",
        "logo_url": "https://cdn.simpleicons.org/atlassian",
        "industry": "Enterprise SaaS / Collaboration",
        "headquarters": "Sydney, Australia",
        "founded": "2002",
        "tier": "Tier-1 / Enterprise SaaS Giant",
        "avg_package_lpa": 45,
        "avgPackageLpa": 45,
        "ctc_range": "₹35L - ₹58L / yr",
        "min_cgpa": 8.0,
        "minCgpa": 8.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE"],
        "culture_summary": "Open Company No Bullshit, Play as a Team, Build with Heart and Balance, Don't #@!% the Customer. Outstanding culture and global developer tooling leader.",
        "core_values": [
            "Open Company, No Bullshit: Open communication, transparent metrics, intellectual honesty.",
            "Play, as a Team: Shared accountability, mutual support, ego-free engineering.",
            "Build with Heart & Balance: Long-term sustainability and user empathy."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Atlaskit Design System", "GraphQL"],
            "backend": ["Java / Spring Boot", "Kotlin", "Go", "Python"],
            "databases": ["PostgreSQL", "Amazon DynamoDB", "Redis", "Elasticsearch"],
            "cloud_infra": ["AWS", "Docker", "Kubernetes", "Micros Internal Platform"],
            "ai_ml": ["Atlassian Intelligence", "LLM RAG Orchestration"]
        },
        "recent_highlights": [
            "Atlassian Intelligence virtual team agent capabilities across Jira Service Management.",
            "Full cloud transformation migration for enterprise Jira & Confluence installations.",
            "Modern microservices architecture scaling on AWS with multi-region replication."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Online Assessment (OA)",
                "duration": "90 mins",
                "format": "HackerRank",
                "focus": "2-3 coding problems testing Arrays, Trees, HashMaps, and algorithmic edge cases."
            },
            {
                "round": 2,
                "title": "Coding / Data Structures (DS/Algo)",
                "duration": "60 mins",
                "format": "Live Sandbox",
                "focus": "Algorithmic problem solving with high emphasis on clean, readable, modular code."
            },
            {
                "round": 3,
                "title": "Craftsmanship / Code Design (OOP)",
                "duration": "60 mins",
                "format": "Live Machine Coding",
                "focus": "Design an extensible software module (e.g. Rate Limiter, In-Memory File System, Tagging System)."
            },
            {
                "round": 4,
                "title": "System Architecture / Design",
                "duration": "60 mins",
                "format": "Whiteboard",
                "focus": "High Level Architecture: Collaborative editing (OT/CRDT), notification delivery, search indexing."
            },
            {
                "round": 5,
                "title": "Values & Cultural Interview",
                "duration": "45 mins",
                "format": "Values Screen",
                "focus": "Atlassian 5 Core Values: Teamwork, constructive debate, customer integrity."
            }
        ],
        "dsa_patterns": [
            {"pattern": "HashMaps & Sliding Window", "frequency": "Very High", "sample_problems": ["Subarray Sum Equals K", "Longest Substring Without Repeating Characters"]},
            {"pattern": "Trees & Graph Connected Components", "frequency": "High", "sample_problems": ["Number of Provinces", "Course Schedule", "Lowest Common Ancestor"]}
        ],
        "behavioral_questions": [
            {
                "question": "Tell me about a time you gave difficult, candid feedback to a teammate. How was it received?",
                "strategy": "Demonstrate Open Company, No Bullshit: respectful delivery, focus on outcomes, and ongoing support."
            }
        ],
        "preparation_roadmap": [
            "Practice writing clean, production-ready code with OOP modularity.",
            "Study Atlassian 5 core values and map personal stories to each value.",
            "Review real-time collaborative architectures (CRDT, WebSocket, Message Queues)."
        ]
    },
    "stripe": {
        "name": "Stripe",
        "fullName": "Stripe, Inc.",
        "slug": "stripe",
        "domain": "stripe.com",
        "logo_url": "https://cdn.simpleicons.org/stripe",
        "industry": "FinTech / Payments Infrastructure",
        "headquarters": "South San Francisco, California",
        "founded": "2010",
        "tier": "Tier-1 / Global FinTech Giant",
        "avg_package_lpa": 48,
        "avgPackageLpa": 48,
        "ctc_range": "₹38L - ₹64L / yr",
        "min_cgpa": 8.0,
        "minCgpa": 8.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "Circuit Branches"],
        "culture_summary": "Users First, Think Rigorously, Move with Urgency, Macro-Optimism. Famous for the world's most elegant developer APIs and extreme engineering rigor.",
        "core_values": [
            "Users First: Understand and advocate for the developer and end consumer.",
            "Think Rigorously: Deep analytical clarity, verified assumptions, precise writing.",
            "Move with Urgency: Speed of execution combined with zero financial bugs."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Sorbet (Ruby Typechecker)"],
            "backend": ["Ruby / Sorbet", "Java", "Go", "Python"],
            "databases": ["PostgreSQL (Distributed)", "MongoDB", "Redis", "Trino"],
            "cloud_infra": ["AWS Hyperscale", "Kubernetes", "Puppet", "Terraform"],
            "ai_ml": ["Radar Fraud Detection Engine", "PyTorch", "LLM Assistant Integration"]
        },
        "recent_highlights": [
            "Stripe Radar ML models processing billions of transactions to block fraudulent attempts.",
            "Global payments orchestration supporting 135+ currencies with 99.999% uptime SLA.",
            "Pioneering typed Ruby ecosystem (Sorbet) open-source development."
        ],
        "interview_rounds": [
            {
                "round": 1,
                "title": "Take-Home / Screen Machine Coding",
                "duration": "60 mins",
                "format": "Your Own IDE / Pair Programming",
                "focus": "Practical engineering: parse JSON, implement an HTTP client, or process ledger transactions."
            },
            {
                "round": 2,
                "title": "Integration / Debugging Round",
                "duration": "60 mins",
                "format": "Real Codebase Debugging",
                "focus": "Navigate a real multi-file codebase, locate bugs, write tests, and implement a missing feature."
            },
            {
                "round": 3,
                "title": "System Architecture (Payments API)",
                "duration": "60 mins",
                "format": "Architecture Whiteboard",
                "focus": "Idempotent payment processing, distributed locks, ledger consistency, webhook delivery."
            },
            {
                "round": 4,
                "title": "Culture & Communication",
                "duration": "45 mins",
                "format": "1-on-1 Discussion",
                "focus": "Written clarity, intellectual rigor, handling ambiguity, user-first mindset."
            }
        ],
        "dsa_patterns": [
            {"pattern": "Parsing, Strings & State Machines", "frequency": "Very High", "sample_problems": ["Basic Calculator II", "Text Justification", "Design In-Memory File System"]},
            {"pattern": "HashMaps & Transaction Logs", "frequency": "High", "sample_problems": ["Design Underground System", "Snapshot Array", "Time Based Key-Value Store"]}
        ],
        "behavioral_questions": [
            {
                "question": "Describe a scenario where you caught an edge case in code or architecture that others overlooked.",
                "strategy": "Showcase technical rigor, exhaustive test suite creation, and user empathy."
            }
        ],
        "preparation_roadmap": [
            "Practice writing real code in your local IDE with unit tests (Stripe allows your own dev environment).",
            "Learn Payment and Ledger fundamentals: Idempotency keys, Two-Phase Commit, Webhook retries with exponential backoff.",
            "Solve practical string and data structure manipulation problems."
        ]
    },
    "adobe": {
        "name": "Adobe",
        "fullName": "Adobe Systems",
        "slug": "adobe",
        "domain": "adobe.com",
        "logo_url": "https://cdn.simpleicons.org/adobe",
        "industry": "Creative Tech / Cloud / Digital Media",
        "headquarters": "San Jose, California",
        "founded": "1982",
        "tier": "Tier-1 / Creative Tech & Cloud",
        "avg_package_lpa": 42,
        "avgPackageLpa": 42,
        "ctc_range": "₹34L - ₹54L / yr",
        "min_cgpa": 7.8,
        "minCgpa": 7.8,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE", "Maths & Computing"],
        "culture_summary": "Creativity, exceptional engineering rigor, genuine care for people, and transformative AI innovation (Firefly).",
        "core_values": [
            "Genuine: Sincere, trustworthy, and reliable.",
            "Exceptional: Committed to creating world-class experiences.",
            "Innovative: Highly creative and focused on forward-thinking breakthroughs."
        ],
        "tech_stack": {
            "frontend": ["React", "WebAssembly (Wasm)", "Spectrum Design", "TypeScript"],
            "backend": ["C++", "Java", "Python", "Node.js"],
            "databases": ["MongoDB", "PostgreSQL", "Cosmos DB", "Redis"],
            "cloud_infra": ["AWS", "Microsoft Azure", "Docker", "Kubernetes"],
            "ai_ml": ["Adobe Firefly", "Sensei ML Platform", "PyTorch"]
        },
        "recent_highlights": [
            "Adobe Firefly generative AI multimodal model integration across Photoshop and Illustrator.",
            "WebAssembly engineering bringing Photoshop and Acrobat directly to browser environments.",
            "Experience Platform real-time customer data orchestration."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerEarth", "focus": "3 algorithmic questions + CS fundamentals."},
            {"round": 2, "title": "Technical Round 1: DSA", "duration": "60 mins", "format": "Live Coding", "focus": "Trees, Dynamic Programming, and Graph Traversals."},
            {"round": 3, "title": "Technical Round 2: LLD & Core CS", "duration": "60 mins", "format": "Live Coding", "focus": "C++ OOP, memory pointers, design patterns, and OS memory."},
            {"round": 4, "title": "Managerial & Culture Fit", "duration": "45 mins", "format": "1-on-1", "focus": "Creativity, problem-solving passion, and Adobe core values."}
        ],
        "dsa_patterns": [
            {"pattern": "2D Dynamic Programming & Arrays", "frequency": "Very High", "sample_problems": ["Edit Distance", "Maximal Rectangle", "Word Break II"]},
            {"pattern": "Binary Trees & Trie", "frequency": "High", "sample_problems": ["Serialize/Deserialize Tree", "Implement Trie", "Word Search II"]}
        ],
        "behavioral_questions": [
            {"question": "Tell me about a creative solution you developed when standard tools or libraries were insufficient.", "strategy": "Highlight problem exploration, algorithm selection, and tangible performance improvements."}
        ],
        "preparation_roadmap": [
            "Master C++ / Java fundamentals and OOP design patterns.",
            "Solve Adobe-tagged DP, Trees, and Graph challenges.",
            "Review WebAssembly and performance optimization fundamentals."
        ]
    },
    "goldman-sachs": {
        "name": "Goldman Sachs",
        "fullName": "The Goldman Sachs Group",
        "slug": "goldman-sachs",
        "domain": "goldmansachs.com",
        "logo_url": "https://cdn.simpleicons.org/goldmansachs",
        "industry": "Global Investment Banking / FinTech",
        "headquarters": "New York, New York",
        "founded": "1869",
        "tier": "Tier-1 / Global Investment Banking",
        "avg_package_lpa": 36,
        "avgPackageLpa": 36,
        "ctc_range": "₹28L - ₹45L / yr",
        "min_cgpa": 7.5,
        "minCgpa": 7.5,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE", "EEE", "Maths & Computing", "Mechanical"],
        "culture_summary": "High analytical rigor, mathematical excellence, integrity, teamwork, and high-concurrency low-latency financial systems.",
        "core_values": [
            "Client Service: Exceptional performance and commitment to clients.",
            "Excellence: High analytical rigor, precision, and zero-defect execution.",
            "Integrity: Utmost ethical standards in managing financial data."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Angular"],
            "backend": ["Java / Spring Boot", "C++", "Python", "Slang / SecDB"],
            "databases": ["PostgreSQL", "Sybase", "Apache Cassandra", "MongoDB"],
            "cloud_infra": ["AWS", "Private Cloud", "Kafka", "Kubernetes"],
            "ai_ml": ["Quantitative Risk Models", "Time Series Forecasting", "NLP Analytics"]
        },
        "recent_highlights": [
            "Expanding Developer Financial Cloud with AWS for institutional quantitative asset analytics.",
            "High-frequency low-latency algorithmic trading platform modernization.",
            "Enterprise event-driven microservices architecture using Apache Kafka."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Aptitude & Technical OA", "duration": "90 mins", "format": "HackerRank", "focus": "Quant Aptitude + 2 DSA coding problems + Math puzzles."},
            {"round": 2, "title": "Technical Round 1: DSA & Math", "duration": "60 mins", "format": "Live Sandbox", "focus": "Arrays, Dynamic Programming, Matrix Mathematics, HashMaps."},
            {"round": 3, "title": "Technical Round 2: Core CS & Java", "duration": "60 mins", "format": "Live Interview", "focus": "Java Multi-threading, JVM memory model, DBMS ACID, OS Scheduling."},
            {"round": 4, "title": "Leadership & Behavioral", "duration": "45 mins", "format": "Partner 1-on-1", "focus": "High stakes risk management, ethics, teamwork under pressure."}
        ],
        "dsa_patterns": [
            {"pattern": "Dynamic Programming & Math Puzzles", "frequency": "Very High", "sample_problems": ["Coin Change", "Knight Probability in Chessboard", "Fraction to Recurring Decimal"]},
            {"pattern": "Strings & Two Pointers", "frequency": "High", "sample_problems": ["Longest Substring with At Most K Distinct Characters", "Trapping Rain Water"]}
        ],
        "behavioral_questions": [
            {"question": "Describe a scenario where you faced strict ethical or quality trade-offs under high deadline pressure.", "strategy": "Emphasize integrity, risk calculation, transparent escalation, and zero compromise on accuracy."}
        ],
        "preparation_roadmap": [
            "Practice probability, quantitative aptitude puzzles, and LeetCode DP problems.",
            "Deep dive into Java Multithreading (Locks, Semaphores, ExecutorService, ConcurrentHashMap).",
            "Review Database transaction isolation levels and indexing."
        ]
    },
    "salesforce": {
        "name": "Salesforce",
        "fullName": "Salesforce, Inc.",
        "slug": "salesforce",
        "domain": "salesforce.com",
        "logo_url": "https://cdn.simpleicons.org/salesforce",
        "industry": "Enterprise Cloud CRM / SaaS",
        "headquarters": "San Francisco, California",
        "founded": "1999",
        "tier": "Tier-1 / Enterprise Cloud CRM",
        "avg_package_lpa": 38,
        "avgPackageLpa": 38,
        "ctc_range": "₹30L - ₹48L / yr",
        "min_cgpa": 7.5,
        "minCgpa": 7.5,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "Circuit Branches"],
        "culture_summary": "Ohana Culture: Trust, Customer Success, Innovation, Equality. Pioneer of multi-tenant enterprise cloud applications.",
        "core_values": [
            "Trust: The #1 value — protecting customer data security.",
            "Customer Success: Building solutions that empower enterprise growth.",
            "Innovation: Pioneer continuous cloud releases and autonomous AI agents."
        ],
        "tech_stack": {
            "frontend": ["Lightning Web Components (LWC)", "React", "TypeScript"],
            "backend": ["Java", "Apex", "Python", "Go"],
            "databases": ["Apache HBase", "PostgreSQL", "Oracle Sharded", "Redis"],
            "cloud_infra": ["Hyperforce (Multi-cloud on AWS/GCP/Azure)", "Kubernetes"],
            "ai_ml": ["Einstein AI", "Agentforce Autonomous Platform"]
        },
        "recent_highlights": [
            "Launch of Agentforce autonomous enterprise agent platform.",
            "Hyperforce infrastructure migration to hyperscale public cloud providers.",
            "Data Cloud real-time data engine integration."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerRank", "focus": "2 Coding problems + Core CS MCQs."},
            {"round": 2, "title": "Technical Round 1: DSA", "duration": "60 mins", "format": "Live Sandbox", "focus": "Trees, Graphs, Linked Lists, Dynamic Programming."},
            {"round": 3, "title": "Technical Round 2: LLD & Architecture", "duration": "60 mins", "format": "Live Coding", "focus": "OOP Design Patterns, Multi-tenant Architecture, REST API Design."},
            {"round": 4, "title": "Hiring Manager & Ohana Values", "duration": "45 mins", "format": "1-on-1", "focus": "Trust, teamwork, equality, and customer obsession."}
        ],
        "dsa_patterns": [
            {"pattern": "Trees & Graph Traversals", "frequency": "Very High", "sample_problems": ["Lowest Common Ancestor", "Word Ladder", "Course Schedule"]},
            {"pattern": "LRU Caches & HashMaps", "frequency": "High", "sample_problems": ["LRU Cache", "Design Twitter", "Group Anagrams"]}
        ],
        "behavioral_questions": [
            {"question": "How do you ensure customer trust and security when building an enterprise feature?", "strategy": "Explain authorization, data validation, test coverage, and security-first development."}
        ],
        "preparation_roadmap": [
            "Master Java OOP concepts and design patterns (Factory, Strategy, Observer).",
            "Solve Salesforce-tagged LeetCode DSA problems.",
            "Review Multi-tenant cloud architecture and REST design principles."
        ]
    },
    "nvidia": {
        "name": "NVIDIA",
        "fullName": "NVIDIA Corporation",
        "slug": "nvidia",
        "domain": "nvidia.com",
        "logo_url": "https://cdn.simpleicons.org/nvidia",
        "industry": "AI / Accelerated Computing / GPUs / Systems",
        "headquarters": "Santa Clara, California",
        "founded": "1993",
        "tier": "Tier-1 / AI & Accelerated Computing",
        "avg_package_lpa": 46,
        "avgPackageLpa": 46,
        "ctc_range": "₹36L - ₹60L / yr",
        "min_cgpa": 8.0,
        "minCgpa": 8.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE", "EEE"],
        "culture_summary": "First Principles thinking, intellectual honesty, speed of light execution, craftsmanship, and extreme passion for computing science.",
        "core_values": [
            "First Principles: Question assumptions and ground solutions in fundamental physics/math.",
            "Speed of Light: Move with rapid agility and urgency.",
            "Intellectual Honesty: Be direct about what is working and what is broken."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Three.js / WebGL"],
            "backend": ["C++", "C", "CUDA", "Python"],
            "databases": ["PostgreSQL", "Redis", "Distributed Object Stores"],
            "cloud_infra": ["DGX Cloud", "Kubernetes", "Slurm GPU Orchestration"],
            "ai_ml": ["TensorRT", "NeMo", "PyTorch", "Megatron-LM", "CUDA-X"]
        },
        "recent_highlights": [
            "Blackwell architecture GPUs powering global AI supercomputing clusters.",
            "TensorRT-LLM inference engine speeding up large language model serving.",
            "NVIDIA Omniverse real-time digital twins and simulation robotics."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerRank", "focus": "C++ pointers, Bit Manipulation, and 2 algorithmic questions."},
            {"round": 2, "title": "Technical Round 1: C++ & DSA", "duration": "60 mins", "format": "Live Sandbox", "focus": "Bitwise operations, memory allocation, multi-threading, Trees."},
            {"round": 3, "title": "Technical Round 2: Computer Architecture & Systems", "duration": "60 mins", "format": "Whiteboard", "focus": "CPU/GPU cache hierarchy, parallel processing, SIMD, and kernel mechanics."},
            {"round": 4, "title": "Director / Culture Interview", "duration": "45 mins", "format": "1-on-1", "focus": "First Principles problem solving and passion for computing breakthroughs."}
        ],
        "dsa_patterns": [
            {"pattern": "Bit Manipulation & Memory Arrays", "frequency": "Very High", "sample_problems": ["Single Number II", "Counting Bits", "Bitwise AND of Numbers Range"]},
            {"pattern": "Divide and Conquer & Trees", "frequency": "High", "sample_problems": ["Merge k Sorted Lists", "Construct Binary Tree from Inorder/Postorder"]}
        ],
        "behavioral_questions": [
            {"question": "Describe a complex technical problem where you had to derive a solution from first principles.", "strategy": "Break down fundamental constraints, challenge legacy assumptions, and show systematic deduction."}
        ],
        "preparation_roadmap": [
            "Master modern C++ (C++17/20), pointer arithmetic, dynamic memory, and multithreading.",
            "Study Computer Architecture (Cache lines, branch prediction, virtual memory, SIMD).",
            "Solve Bit Manipulation and Array partition problems."
        ]
    },
    "oracle": {
        "name": "Oracle",
        "fullName": "Oracle Corporation",
        "slug": "oracle",
        "domain": "oracle.com",
        "logo_url": "https://cdn.simpleicons.org/oracle",
        "industry": "Enterprise Cloud / Database / Middleware",
        "headquarters": "Austin, Texas",
        "founded": "1977",
        "tier": "Tier-1 / Enterprise Cloud & Database",
        "avg_package_lpa": 34,
        "avgPackageLpa": 34,
        "ctc_range": "₹26L - ₹42L / yr",
        "min_cgpa": 7.0,
        "minCgpa": 7.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["All Engineering Branches"],
        "culture_summary": "Engineering rigor, enterprise reliability, stewardship of Java and relational database internals.",
        "core_values": [
            "Integrity: Reliable database consistency and enterprise governance.",
            "Customer Obsession: High enterprise SLA uptime and compliance.",
            "Innovation: Next-gen autonomous cloud architecture (OCI)."
        ],
        "tech_stack": {
            "frontend": ["Oracle JET", "React", "TypeScript"],
            "backend": ["Java", "C++", "C", "Python", "Go"],
            "databases": ["Oracle Database (RAC)", "MySQL", "Autonomous DB", "Berkeley DB"],
            "cloud_infra": ["Oracle Cloud Infrastructure (OCI)", "Terraform", "Kubernetes (OKE)"],
            "ai_ml": ["OCI Generative AI", "HeatWave AutoML"]
        },
        "recent_highlights": [
            "OCI hyperscale AI cloud infrastructure partnerships.",
            "Oracle Autonomous Database self-driving, self-securing enhancements.",
            "Java 21/22 LTS virtual threads and performance advancements."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerRank", "focus": "2 Coding problems + Core CS (DBMS/OS/Networks)."},
            {"round": 2, "title": "Technical Round 1: DSA", "duration": "60 mins", "format": "Live Sandbox", "focus": "Binary Trees, Graphs, Dynamic Programming, HashMaps."},
            {"round": 3, "title": "Technical Round 2: Database Internals & Core CS", "duration": "60 mins", "format": "Live Interview", "focus": "B+ Trees, Indexing, ACID Transactions, Concurrency, Java JVM."},
            {"round": 4, "title": "Managerial Round", "duration": "45 mins", "format": "1-on-1", "focus": "Project defense, architectural choices, and team collaboration."}
        ],
        "dsa_patterns": [
            {"pattern": "Trees, Graphs & Indexing Structures", "frequency": "Very High", "sample_problems": ["Validate BST", "Binary Tree Level Order Traversal", "Graph Valid Tree"]},
            {"pattern": "String Manipulation & Dynamic Programming", "frequency": "High", "sample_problems": ["Longest Palindromic Substring", "Coin Change"]}
        ],
        "behavioral_questions": [
            {"question": "Tell me about how you debugged a difficult database query or performance bottleneck.", "strategy": "Explain query execution plans, index tuning, transaction locks, and measurable speedup."}
        ],
        "preparation_roadmap": [
            "Review Database Management Systems (B-Trees, WAL logs, MVCC, Indexing, Normalization).",
            "Master Java Core concepts (Garbage Collection, Collections framework, Multi-threading).",
            "Solve Oracle-tagged LeetCode DSA questions."
        ]
    },
    "cisco": {
        "name": "Cisco",
        "fullName": "Cisco Systems",
        "slug": "cisco",
        "domain": "cisco.com",
        "logo_url": "https://cdn.simpleicons.org/cisco",
        "industry": "Networking / Cybersecurity / Enterprise",
        "headquarters": "San Jose, California",
        "founded": "1984",
        "tier": "Tier-1 / Networking & Security",
        "avg_package_lpa": 32,
        "avgPackageLpa": 32,
        "ctc_range": "₹24L - ₹40L / yr",
        "min_cgpa": 7.5,
        "minCgpa": 7.5,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE", "EEE", "Telecom"],
        "culture_summary": "Connecting everything, security first, high reliability, conscious culture, and deep computer networking excellence.",
        "core_values": [
            "Connect Everything: Bridge people and ideas with secure technology.",
            "Innovate Everywhere: Continuous learning and platform evolution.",
            "Benefit Everyone: Diverse, inclusive conscious culture."
        ],
        "tech_stack": {
            "frontend": ["React", "Angular", "TypeScript"],
            "backend": ["Python", "C", "C++", "Go", "Java"],
            "databases": ["PostgreSQL", "Redis", "Cassandra", "InfluxDB"],
            "cloud_infra": ["Docker", "Kubernetes", "AWS", "Linux Kernel Networking", "eBPF"],
            "ai_ml": ["Network Telemetry AI", "Splunk Security Analytics"]
        },
        "recent_highlights": [
            "Integration of Splunk security data observability platform.",
            "AI-native networking architectures for ultra-low latency data centers.",
            "Zero Trust cybersecurity platform extensions."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerRank", "focus": "2 Coding problems + Computer Networking/OS MCQs."},
            {"round": 2, "title": "Technical Round 1: DSA & Networking", "duration": "60 mins", "format": "Live Sandbox", "focus": "Data structures + TCP/IP, OSI model, subnetting, routing."},
            {"round": 3, "title": "Technical Round 2: Systems & Python/C++", "duration": "60 mins", "format": "Live Interview", "focus": "Socket programming, multithreading, Linux commands, data structures."},
            {"round": 4, "title": "Managerial & HR Round", "duration": "45 mins", "format": "1-on-1", "focus": "Collaboration, problem solving adaptability, and Cisco culture fit."}
        ],
        "dsa_patterns": [
            {"pattern": "Graph Algorithms & Shortest Path", "frequency": "Very High", "sample_problems": ["Network Delay Time", "Course Schedule", "Cheapest Flights"]},
            {"pattern": "Bitwise Operations & Arrays", "frequency": "High", "sample_problems": ["IP to CIDR", "Subarray Sum Equals K"]}
        ],
        "behavioral_questions": [
            {"question": "Describe a project where network latency or reliability was a primary design constraint.", "strategy": "Explain TCP vs UDP trade-offs, packet loss mitigation, caching, and benchmarks."}
        ],
        "preparation_roadmap": [
            "Master Computer Networks fundamentals: TCP 3-way handshake, Subnetting, DNS, HTTP/2, BGP.",
            "Practice Linux networking commands and socket programming.",
            "Solve Cisco-tagged Graph and Array problems on LeetCode."
        ]
    },
    "flipkart": {
        "name": "Flipkart",
        "fullName": "Flipkart (Walmart Group)",
        "slug": "flipkart",
        "domain": "flipkart.com",
        "logo_url": "https://cdn.simpleicons.org/flipkart",
        "industry": "E-Commerce / Supply Chain / FinTech",
        "headquarters": "Bengaluru, Karnataka, India",
        "founded": "2007",
        "tier": "Tier-1 / E-Commerce Giant",
        "avg_package_lpa": 32,
        "avgPackageLpa": 32,
        "ctc_range": "₹26L - ₹42L / yr",
        "min_cgpa": 7.5,
        "minCgpa": 7.5,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "Circuit Branches"],
        "culture_summary": "Audacity, Customer First, Bias for Action, Integrity. High-scale distributed systems handling massive Big Billion Days flash sales.",
        "core_values": [
            "Audacity: Dream big and take bold calculated risks.",
            "Customer First: Everything starts and ends with Indian consumer satisfaction.",
            "Ownership: Drive initiatives from inception to delivery."
        ],
        "tech_stack": {
            "frontend": ["React", "React Native", "TypeScript", "Web Performance"],
            "backend": ["Java / Spring Boot", "Dropwizard", "Go", "Python"],
            "databases": ["HBase", "MySQL Sharded", "Aerospike", "Redis", "Elasticsearch"],
            "cloud_infra": ["Private Cloud Platform", "Kubernetes", "Kafka (Billions of daily messages)"],
            "ai_ml": ["Flippr Recommendation Engine", "Computer Vision Visual Search"]
        },
        "recent_highlights": [
            "Scaling Big Billion Days traffic to handle millions of simultaneous checkout transactions.",
            "Same-day delivery supply chain automated sorting robotics.",
            "Generative AI conversational assistant for Indian regional languages."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerEarth", "focus": "3 algorithmic problems testing DP, Graphs, and HashMaps."},
            {"round": 2, "title": "Machine Coding Round (LLD)", "duration": "90-120 mins", "format": "Live Clean Architecture Coding", "focus": "Build a complete in-memory system with SOLID principles (e.g. Ride Sharing, Splitwise, Flipkart Grocery)."},
            {"round": 3, "title": "DSA & Problem Solving", "duration": "60 mins", "format": "Live Sandbox", "focus": "Dynamic Programming, Trees, Heaps, Graph Shortest Path."},
            {"round": 4, "title": "Hiring Manager Round", "duration": "45 mins", "format": "1-on-1", "focus": "Audacity, problem solving, past projects, and culture fit."}
        ],
        "dsa_patterns": [
            {"pattern": "Machine Coding & Object Oriented Design", "frequency": "Very High", "sample_problems": ["Design In-Memory File System", "Design Splitwise", "Design Movie Ticket Booking"]},
            {"pattern": "2D Dynamic Programming & Graphs", "frequency": "High", "sample_problems": ["Coin Change", "Word Ladder", "Alien Dictionary"]}
        ],
        "behavioral_questions": [
            {"question": "Tell me about a time you had to deliver a system under tight constraints before a major launch event.", "strategy": "Highlight prioritization, modular design, automated testing, and zero-defect execution."}
        ],
        "preparation_roadmap": [
            "Practice live Machine Coding: Write working OOP code with interfaces, services, and unit tests in 90 mins.",
            "Solve Flipkart-tagged LeetCode Medium/Hard DP and Graph questions.",
            "Review low-level design patterns (Factory, Strategy, Observer, Repository)."
        ]
    },
    "swiggy": {
        "name": "Swiggy",
        "fullName": "Swiggy Limited",
        "slug": "swiggy",
        "domain": "swiggy.com",
        "logo_url": "https://cdn.simpleicons.org/swiggy",
        "industry": "On-Demand Delivery / Quick Commerce",
        "headquarters": "Bengaluru, Karnataka, India",
        "founded": "2014",
        "tier": "Tier-1 / On-Demand Consumer Tech",
        "avg_package_lpa": 34,
        "avgPackageLpa": 34,
        "ctc_range": "₹26L - ₹44L / yr",
        "min_cgpa": 7.0,
        "minCgpa": 7.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "Circuit Branches", "All Branches"],
        "culture_summary": "Consumer Comes First, Display Honest Metric-Driven Rigor, Strive to be a Standout Team, Move Fast with High Ownership.",
        "core_values": [
            "Consumer Comes First: Ensure seamless, accurate, 10-minute quick commerce deliveries.",
            "Move Fast with Quality: Deploy rapidly with high reliability.",
            "Standout Team: Collaborative, humble, and ambitious."
        ],
        "tech_stack": {
            "frontend": ["React", "React Native", "TypeScript"],
            "backend": ["Go", "Java / Spring Boot", "Node.js", "Python"],
            "databases": ["PostgreSQL", "Amazon DynamoDB", "Redis", "Kafka"],
            "cloud_infra": ["AWS", "Kubernetes", "Temporal Orchestration"],
            "ai_ml": ["Delivery Dispatch ML Engine", "Smart Cart Upsell AI"]
        },
        "recent_highlights": [
            "Instamart 10-minute quick commerce logistics and dark store inventory optimization.",
            "Real-time delivery partner batching and routing algorithm improvements.",
            "Swiggy Dineout and bolt ultra-fast delivery platform rollout."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerEarth", "focus": "3 coding questions on DP, Trees, and Array manipulation."},
            {"round": 2, "title": "Machine Coding / LLD", "duration": "90 mins", "format": "Live Clean Architecture", "focus": "Design an Order Management, Flash Sale, or Cart Billing system."},
            {"round": 3, "title": "DSA & Problem Solving", "duration": "60 mins", "format": "Live Sandbox", "focus": "Trees, Graphs, Interval Scheduling, Matrix algorithms."},
            {"round": 4, "title": "Hiring Manager & Culture", "duration": "45 mins", "format": "1-on-1", "focus": "Customer empathy, delivery logistics sense, and technical grit."}
        ],
        "dsa_patterns": [
            {"pattern": "Machine Coding (Clean Architecture)", "frequency": "Very High", "sample_problems": ["Design Food Delivery System", "Design Flash Sale System"]},
            {"pattern": "Graphs & Real-Time Caching", "frequency": "High", "sample_problems": ["Network Delay Time", "LRU Cache", "Cheapest Flights"]}
        ],
        "behavioral_questions": [
            {"question": "Tell me about a time you solved an unexpected high-concurrency issue in your project.", "strategy": "Explain metrics telemetry, bottleneck isolation (DB lock / thread starvation), and resolution."}
        ],
        "preparation_roadmap": [
            "Practice Machine Coding rounds in Go or Java within 90-minute timeboxes.",
            "Solve Swiggy and Uber tagged LeetCode algorithms.",
            "Understand Real-Time Geo-Location Tracking and Message Queue workflows."
        ]
    },
    "zomato": {
        "name": "Zomato",
        "fullName": "Zomato / Blinkit",
        "slug": "zomato",
        "domain": "zomato.com",
        "logo_url": "https://cdn.simpleicons.org/zomato",
        "industry": "Food Tech / Quick Commerce / Logistics",
        "headquarters": "Gurugram, Haryana, India",
        "founded": "2008",
        "tier": "Tier-1 / Consumer Tech Unicorn",
        "avg_package_lpa": 32,
        "avgPackageLpa": 32,
        "ctc_range": "₹25L - ₹42L / yr",
        "min_cgpa": 7.0,
        "minCgpa": 7.0,
        "max_active_backlogs": 0,
        "allowed_branches": ["All Engineering Branches"],
        "culture_summary": "Extreme ownership, speed of execution, data-led experimentation, frugality, and relentless user focus.",
        "core_values": [
            "Extreme Ownership: Own the outcome from end to end.",
            "Speed & Frugality: Optimize costs and ship features rapidly.",
            "Continuous Improvement: Refine UI and supply chain latency daily."
        ],
        "tech_stack": {
            "frontend": ["React", "React Native", "Next.js", "TypeScript"],
            "backend": ["Node.js", "Go", "PHP", "Python", "Java"],
            "databases": ["PostgreSQL", "DynamoDB", "Redis", "Elasticsearch"],
            "cloud_infra": ["AWS", "Docker", "Kubernetes", "Kafka"],
            "ai_ml": ["Delivery ETA Prediction ML", "Visual Dish Recognition"]
        },
        "recent_highlights": [
            "Blinkit 10-minute grocery delivery scale and micro-fulfillment automation.",
            "Hyperpure B2B farm-to-fork supply chain intelligence.",
            "Event ticketing and Zomato District live entertainment platform expansion."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerEarth", "focus": "2-3 coding problems on DP, Strings, and Graphs."},
            {"round": 2, "title": "Machine Coding / UI-Backend Integration", "duration": "90 mins", "format": "Live Sandbox", "focus": "Build a live working feature (e.g. Cart, Search Filter, Rating System)."},
            {"round": 3, "title": "DSA & Problem Solving", "duration": "60 mins", "format": "Live Coding", "focus": "Algorithmic problems testing optimization and clean code."},
            {"round": 4, "title": "Leadership & Product Sense", "duration": "45 mins", "format": "1-on-1", "focus": "Product sense, speed vs quality trade-offs, and ownership."}
        ],
        "dsa_patterns": [
            {"pattern": "Machine Coding & Live Feature Prototyping", "frequency": "Very High", "sample_problems": ["Design Search Autocomplete", "Design In-Memory Cache"]},
            {"pattern": "Dynamic Programming & Trees", "frequency": "High", "sample_problems": ["Longest Increasing Subsequence", "Binary Tree Right Side View"]}
        ],
        "behavioral_questions": [
            {"question": "Describe a project where you balanced shipping fast against technical perfection.", "strategy": "Explain deliberate trade-offs, telemetry monitoring, and subsequent refactoring iterations."}
        ],
        "preparation_roadmap": [
            "Practice rapid feature development in React + Node.js or Go.",
            "Solve Zomato / Swiggy LeetCode problem sets.",
            "Study Quick Commerce and Live Location logistics architecture."
        ]
    },
    "razorpay": {
        "name": "Razorpay",
        "fullName": "Razorpay Software",
        "slug": "razorpay",
        "domain": "razorpay.com",
        "logo_url": "https://cdn.simpleicons.org/razorpay",
        "industry": "FinTech / Payments / Neo-Banking",
        "headquarters": "Bengaluru, Karnataka, India",
        "founded": "2014",
        "tier": "Tier-1 / FinTech Unicorn",
        "avg_package_lpa": 34,
        "avgPackageLpa": 34,
        "ctc_range": "₹26L - ₹44L / yr",
        "min_cgpa": 7.5,
        "minCgpa": 7.5,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "Circuit Branches"],
        "culture_summary": "Transparency, Merchant First, Think Big, Fail Fast & Learn Faster. High engineering standards for zero-downtime payments.",
        "core_values": [
            "Merchant First: Solve real payment and cashflow challenges for businesses.",
            "Transparency: Open communication and high integrity.",
            "Engineering Excellence: Build resilient, fault-tolerant financial pipelines."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Blade Design System", "Next.js"],
            "backend": ["Go", "PHP", "Node.js", "Python", "Java"],
            "databases": ["MySQL (Aurora)", "PostgreSQL", "Redis", "Elasticsearch"],
            "cloud_infra": ["AWS Hyperscale", "Kubernetes", "Kafka", "Temporal"],
            "ai_ml": ["Thirdwatch AI Fraud Detection", "Payment Route Optimization Engine"]
        },
        "recent_highlights": [
            "Magic Checkout AI one-click checkout across thousands of e-commerce brands.",
            "RazorpayX corporate banking and automated tax compliance workflows.",
            "Omnichannel payments integration with offline POS point-of-sale systems."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerEarth", "focus": "2-3 coding problems on Arrays, DP, and Trees."},
            {"round": 2, "title": "Machine Coding / Clean Architecture", "duration": "90 mins", "format": "Live Sandbox", "focus": "Design an extensible system (e.g. Payment Gateway Router, Split Payments, Ledger Engine)."},
            {"round": 3, "title": "DSA & Problem Solving", "duration": "60 mins", "format": "Live Coding", "focus": "Graph Algorithms, Dynamic Programming, and Concurrency."},
            {"round": 4, "title": "System Design & Values", "duration": "60 mins", "format": "Architecture & Values", "focus": "Idempotent payment systems, webhook retries, and Razorpay culture fit."}
        ],
        "dsa_patterns": [
            {"pattern": "Machine Coding (Clean Architecture & SOLID)", "frequency": "Very High", "sample_problems": ["Design Payment Gateway", "Design Wallet Transaction Ledger"]},
            {"pattern": "HashMaps, Intervals & DP", "frequency": "High", "sample_problems": ["Insert Delete GetRandom O(1)", "Merge Intervals", "Coin Change"]}
        ],
        "behavioral_questions": [
            {"question": "How do you ensure zero financial discrepancies in transactional distributed systems?", "strategy": "Explain Idempotency keys, Two-Phase Commit, reconciliation jobs, and database constraints."}
        ],
        "preparation_roadmap": [
            "Practice Machine Coding: Focus on clean code, modular classes, and unit tests in Go or Java.",
            "Learn Financial Backend Fundamentals (Idempotency, Distributed Locks, Webhooks, Reconciliation).",
            "Solve Razorpay and Stripe tagged LeetCode problems."
        ]
    },
    "intuit": {
        "name": "Intuit",
        "fullName": "Intuit Inc.",
        "slug": "intuit",
        "domain": "intuit.com",
        "logo_url": "https://cdn.simpleicons.org/intuit",
        "industry": "Financial Software / AI / Small Business",
        "headquarters": "Mountain View, California",
        "founded": "1983",
        "tier": "Tier-1 / Financial Software Giant",
        "avg_package_lpa": 36,
        "avgPackageLpa": 36,
        "ctc_range": "₹28L - ₹46L / yr",
        "min_cgpa": 7.5,
        "minCgpa": 7.5,
        "max_active_backlogs": 0,
        "allowed_branches": ["CS/IT", "ECE"],
        "culture_summary": "Design for Delight (D4D), Customer Driven Innovation (CDI), Integrity Without Compromise. Deep engineering empathy for small businesses and consumers.",
        "core_values": [
            "Integrity Without Compromise: Absolute ethical standard in financial data management.",
            "Customer Obsession: Design for Delight through deep customer observation.",
            "Stronger Together: Exceptional inclusive teamwork."
        ],
        "tech_stack": {
            "frontend": ["React", "TypeScript", "Micro-frontends", "Node.js"],
            "backend": ["Java / Spring Boot", "Kotlin", "Python", "Go"],
            "databases": ["Amazon Aurora", "DynamoDB", "Cassandra", "Redis"],
            "cloud_infra": ["AWS", "Kubernetes (Argo CD)", "Kafka", "GraphQL"],
            "ai_ml": ["Intuit GenOS", "Tax Knowledge Graph", "Financial LLM Agents"]
        },
        "recent_highlights": [
            "Intuit GenOS generative AI platform powering TurboTax and QuickBooks AI assistants.",
            "Open source leadership with Argo CD Kubernetes continuous delivery ecosystem.",
            "High-throughput real-time financial transaction categorization engines."
        ],
        "interview_rounds": [
            {"round": 1, "title": "Online Assessment (OA)", "duration": "90 mins", "format": "HackerRank", "focus": "2 Coding problems + CS fundamentals."},
            {"round": 2, "title": "Assessor Round 1: DSA", "duration": "60 mins", "format": "Live Sandbox", "focus": "Trees, Graphs, Dynamic Programming, HashMaps."},
            {"round": 3, "title": "Assessor Round 2: Craftsmanship & Architecture", "duration": "60 mins", "format": "Live Coding & Design", "focus": "OOP Design Patterns, REST API Architecture, Clean Code."},
            {"round": 4, "title": "Managerial & D4D Values", "duration": "45 mins", "format": "1-on-1", "focus": "Design for Delight, customer empathy, teamwork, and ethics."}
        ],
        "dsa_patterns": [
            {"pattern": "Trees & Graph Traversals", "frequency": "Very High", "sample_problems": ["Lowest Common Ancestor", "Binary Tree Zigzag", "Word Ladder"]},
            {"pattern": "Dynamic Programming & HashMaps", "frequency": "High", "sample_problems": ["Subarray Sum Equals K", "Coin Change", "Longest Consecutive Sequence"]}
        ],
        "behavioral_questions": [
            {"question": "Tell me about a time you applied customer empathy to solve a subtle usability or technical flaw.", "strategy": "Explain customer observation, hypothesis formulation, prototype creation, and user satisfaction metrics."}
        ],
        "preparation_roadmap": [
            "Master Java / C++ OOP Design and Clean Code principles.",
            "Solve Intuit-tagged LeetCode Medium algorithms.",
            "Understand Intuit's D4D (Design for Delight) and CDI (Customer Driven Innovation) frameworks."
        ]
    }
}

# Aliases dictionary
COMPANY_NAME_ALIASES: Dict[str, str] = {
    "goog": "google",
    "alphabet": "google",
    "google inc": "google",
    "google alphabet": "google",
    "msft": "microsoft",
    "microsoft corp": "microsoft",
    "microsoft corporation": "microsoft",
    "amzn": "amazon",
    "aws": "amazon",
    "amazon aws": "amazon",
    "fb": "meta",
    "facebook": "meta",
    "meta platforms": "meta",
    "aapl": "apple",
    "apple inc": "apple",
    "nflx": "netflix",
    "netflix inc": "netflix",
    "ubr": "uber",
    "uber technologies": "uber",
    "adbe": "adobe",
    "adobe systems": "adobe",
    "atlass": "atlassian",
    "atlassian corp": "atlassian",
    "jira": "atlassian",
    "stripe inc": "stripe",
    "gs": "goldman-sachs",
    "goldman": "goldman-sachs",
    "goldman sachs": "goldman-sachs",
    "sfdc": "salesforce",
    "salesforce inc": "salesforce",
    "nvda": "nvidia",
    "nvidia corp": "nvidia",
    "orcl": "oracle",
    "oracle corp": "oracle",
    "csco": "cisco",
    "cisco systems": "cisco",
    "flip": "flipkart",
    "swig": "swiggy",
    "zom": "zomato",
    "blinkit": "zomato",
    "rzp": "razorpay",
    "intt": "intuit",
    "intuit inc": "intuit",
}

def resolve_company_key(company_query: str) -> Optional[str]:
    """Resolves a user search string to one of the 20 curated company keys."""
    if not company_query:
        return None
    clean = company_query.strip().lower()
    
    if clean in COMPANY_KNOWLEDGE_BASE:
        return clean
    if clean in COMPANY_NAME_ALIASES:
        return COMPANY_NAME_ALIASES[clean]
        
    # Check if alias or slug is a substring
    for alias, key in COMPANY_NAME_ALIASES.items():
        if alias in clean or clean in alias:
            return key
            
    for key, p in COMPANY_KNOWLEDGE_BASE.items():
        if key in clean or clean in key or p["name"].lower() in clean or clean in p["name"].lower():
            return key
            
    return None

def get_company_intelligence(company_name: str) -> Dict[str, Any]:
    """
    Retrieves deep company intelligence profile strictly for the 20 Curated Companies.
    If the requested company is not in the whitelist, raises an informative error.
    """
    resolved_key = resolve_company_key(company_name)
    if resolved_key and resolved_key in COMPANY_KNOWLEDGE_BASE:
        return COMPANY_KNOWLEDGE_BASE[resolved_key]

    supported_list = ", ".join([p["name"] for p in COMPANY_KNOWLEDGE_BASE.values()])
    raise ValueError(
        f"Company '{company_name}' is outside the supported getPlaced curated whitelist. "
        f"getPlaced currently maintains calibrated intelligence exclusively for: {supported_list}."
    )

def list_featured_companies() -> List[Dict[str, Any]]:
    """Returns list of the 20 curated premier tech companies with logos and summaries."""
    return [
        {
            "name": p["name"],
            "fullName": p.get("fullName", p["name"]),
            "slug": p["slug"],
            "domain": p.get("domain", ""),
            "logo_url": p.get("logo_url", ""),
            "industry": p["industry"],
            "tier": p["tier"],
            "avg_package_lpa": p["avg_package_lpa"],
            "ctc_range": p["ctc_range"],
            "min_cgpa": p["min_cgpa"],
            "culture_highlight": p["core_values"][0] if p.get("core_values") else "",
            "top_stack": p["tech_stack"]["backend"][:3] if p.get("tech_stack") else []
        }
        for p in COMPANY_KNOWLEDGE_BASE.values()
    ]
