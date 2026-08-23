/**
 * "Which Role Fits Me?" — Role Discovery & Recommendation Intelligence Service
 *
 * Implements a multi-evidence alignment engine evaluating candidate readiness
 * against 9 canonical tech engineering benchmarks:
 * 1. Full Stack Developer
 * 2. Backend Developer
 * 3. Software Development Engineer (SDE / Core Engineering)
 * 4. Frontend Developer
 * 5. DevOps & Cloud Platform Engineer
 * 6. Data Engineer & Analytics
 * 7. AI/ML Engineering
 * 8. Mobile Application Developer (iOS/Android/React Native)
 * 9. Cyber Security & Systems Engineer
 *
 * Evidence Sources:
 * - GitHub Repositories (tech stack frequency, deployed apps, complexity)
 * - LeetCode DSA Profile (problem count, difficulty breakdown, algorithmic bar)
 * - Self-assessed & verified skills inventory
 * - Resume ATS keyword density & quantified project bullets
 * - Academic coursework, branch & domain specialization
 */

import axios from "axios";
import { NODE_API_URL } from "@/config/api";

export const CANONICAL_ROLES_BENCHMARK = [
  {
    id: "full-stack-developer",
    title: "Full Stack Developer",
    shortTitle: "Full Stack",
    category: "Web & Distributed Systems",
    summary:
      "End-to-end web software development bridging modern client interfaces with resilient backend services, relational/NoSQL datastores, and cloud deployments.",
    badge: "🔥 Very High Demand",
    colorTheme: {
      accent: "#C7F36B",
      bgSubtle: "rgba(199, 243, 107, 0.08)",
      border: "rgba(199, 243, 107, 0.25)",
      textAccent: "#C7F36B",
    },
    keyResponsibilities: [
      "Architect and ship end-to-end responsive web applications across client and server tiers.",
      "Design and maintain RESTful and GraphQL API contracts with authentication & rate-limiting.",
      "Model relational (PostgreSQL/MySQL) and document (MongoDB) databases with indexing.",
      "Set up CI/CD pipelines and deploy micro-services / SPAs to modern cloud infrastructure.",
      "Ensure web performance, responsive UI layout, and cross-browser reliability.",
    ],
    industryDemand: {
      level: "Very High",
      sharePercentage: 24,
      statusLabel: "Top Campus & Off-Campus Hiring Category",
      trend: "Rising demand for TypeScript + Next.js + Node.js/Go full-stack talent.",
    },
    avgCompensation: {
      inrRange: "₹14 - ₹36 LPA",
      entryLevel: "₹8 - ₹18 LPA",
      seniorLevel: "₹28 - ₹55+ LPA",
      usdRange: "$115k - $175k",
      medianLpa: 22,
    },
    topHiringCompanies: [
      "Razorpay",
      "Swiggy",
      "Zomato",
      "Atlassian",
      "Stripe",
      "Flipkart",
      "Amazon",
      "Microsoft",
      "Adobe",
    ],
    hiringBars: [
      "1 DSA & Problem Solving Round (Medium Level - Arrays, Two Pointers, Trees)",
      "1 Machine Coding / Live Full Stack Feature Implementation (React + Node.js)",
      "1 Low Level & High Level System Architecture Round",
      "1 Culture Fit & Leadership Principles Round",
    ],
    coreRequiredSkills: [
      { name: "JavaScript", category: "Language", weight: 1.0 },
      { name: "TypeScript", category: "Language", weight: 0.9 },
      { name: "React", category: "Frontend", weight: 1.0 },
      { name: "Node.js", category: "Backend", weight: 1.0 },
      { name: "Express", category: "Backend", weight: 0.8 },
      { name: "SQL", category: "Database", weight: 0.9 },
      { name: "MongoDB", category: "Database", weight: 0.8 },
      { name: "REST APIs", category: "Architecture", weight: 0.9 },
      { name: "Git", category: "Tooling", weight: 0.8 },
    ],
    preferredSkills: [
      { name: "Next.js", category: "Frontend" },
      { name: "PostgreSQL", category: "Database" },
      { name: "Docker", category: "DevOps" },
      { name: "Redis", category: "Database" },
      { name: "Tailwind CSS", category: "Frontend" },
      { name: "GraphQL", category: "Architecture" },
      { name: "AWS", category: "Cloud" },
      { name: "CI/CD", category: "DevOps" },
    ],
    targetDsaSolvedCount: 80,
    targetDimensions: {
      dsa: 72,
      projects: 85,
      skills: 85,
      resume: 80,
      academics: 70,
    },
    idealCoursework: [
      "Web Technologies / Internet Programming",
      "Database Management Systems (DBMS)",
      "Software Engineering & Agile Methodologies",
      "Operating Systems & Network Basics",
    ],
    idealProjectSignatures: [
      "react",
      "next",
      "fullstack",
      "node",
      "express",
      "mern",
      "mongodb",
      "postgres",
      "api",
      "crud",
      "auth",
      "ecommerce",
      "dashboard",
    ],
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    shortTitle: "Backend",
    category: "Scalable Systems & APIs",
    summary:
      "Core server-side engineering specializing in high-throughput API architecture, database transaction isolation, distributed caching, messaging queues, and microservices.",
    badge: "⚡ High Scale & Systems",
    colorTheme: {
      accent: "#60A5FA",
      bgSubtle: "rgba(96, 165, 250, 0.08)",
      border: "rgba(96, 165, 250, 0.25)",
      textAccent: "#60A5FA",
    },
    keyResponsibilities: [
      "Build high-concurrency, low-latency REST and gRPC services in Node.js, Go, or Java.",
      "Design relational schemas, optimize slow queries with indexes, and maintain ACID transactions.",
      "Integrate asynchronous message brokers (Kafka, RabbitMQ) and distributed caching (Redis).",
      "Implement robust authentication, token lifecycles, and role-based access control (RBAC).",
      "Implement unit and integration testing pipelines to guarantee system uptime and fault tolerance.",
    ],
    industryDemand: {
      level: "Very High",
      sharePercentage: 20,
      statusLabel: "Critical Backbone for All Tech Products",
      trend: "Rising demand for Go, Java/Spring Boot, and Kafka event-driven architectures.",
    },
    avgCompensation: {
      inrRange: "₹14 - ₹42 LPA",
      entryLevel: "₹9 - ₹20 LPA",
      seniorLevel: "₹32 - ₹60+ LPA",
      usdRange: "$120k - $185k",
      medianLpa: 25,
    },
    topHiringCompanies: [
      "Uber",
      "Amazon",
      "Razorpay",
      "Microsoft",
      "Oracle",
      "Goldman Sachs",
      "Swiggy",
      "Netflix",
      "Flipkart",
    ],
    hiringBars: [
      "1 DSA & Algorithmic Problem Solving (Heaps, Graphs, Trees, Dynamic Programming)",
      "1 Backend Machine Coding / Clean Architecture API Design (OOP & DB)",
      "1 Distributed System Design (Caching, Sharding, Load Balancing, CAP Theorem)",
      "1 Behavioral & Engineering Standards Round",
    ],
    coreRequiredSkills: [
      { name: "Java", category: "Language", weight: 0.9 },
      { name: "Node.js", category: "Backend", weight: 0.9 },
      { name: "Python", category: "Language", weight: 0.8 },
      { name: "Go", category: "Language", weight: 0.8 },
      { name: "SQL", category: "Database", weight: 1.0 },
      { name: "PostgreSQL", category: "Database", weight: 0.9 },
      { name: "REST APIs", category: "Architecture", weight: 0.9 },
      { name: "System Design", category: "Architecture", weight: 0.9 },
      { name: "Git", category: "Tooling", weight: 0.8 },
    ],
    preferredSkills: [
      { name: "Spring Boot", category: "Backend" },
      { name: "Redis", category: "Database" },
      { name: "Kafka", category: "Messaging" },
      { name: "Docker", category: "DevOps" },
      { name: "Microservices", category: "Architecture" },
      { name: "gRPC", category: "Architecture" },
      { name: "Kubernetes", category: "DevOps" },
      { name: "AWS", category: "Cloud" },
    ],
    targetDsaSolvedCount: 130,
    targetDimensions: {
      dsa: 80,
      projects: 80,
      skills: 85,
      resume: 80,
      academics: 75,
    },
    idealCoursework: [
      "Database Management Systems (DBMS) & Query Optimization",
      "Operating Systems (Processes, Threads, Concurrency)",
      "Computer Networks (TCP/IP, HTTP/2, Sockets)",
      "Distributed Systems & Cloud Computing",
    ],
    idealProjectSignatures: [
      "backend",
      "api",
      "server",
      "microservice",
      "express",
      "spring",
      "fastapi",
      "postgres",
      "redis",
      "kafka",
      "grpc",
      "auth",
      "rate-limiter",
    ],
  },
  {
    id: "sde-core",
    title: "Software Development Engineer (SDE / Core Engineering)",
    shortTitle: "SDE Core",
    category: "Algorithms & Core Engineering",
    summary:
      "Tier-1 product engineering focused on algorithmic rigor, deep data structures, low-level design patterns, memory efficiency, and rock-solid computer science fundamentals.",
    badge: "🏆 Big Tech Standard",
    colorTheme: {
      accent: "#A78BFA",
      bgSubtle: "rgba(167, 139, 250, 0.08)",
      border: "rgba(167, 139, 250, 0.25)",
      textAccent: "#A78BFA",
    },
    keyResponsibilities: [
      "Solve complex algorithmic engineering challenges with optimal time and space complexity.",
      "Design and implement object-oriented, highly maintainable low-level software modules.",
      "Develop low-latency software components with rigorous memory management and concurrency controls.",
      "Write comprehensive unit, integration, and load test suites with high code coverage.",
      "Participate in high-stakes architecture reviews and system scalability evaluations.",
    ],
    industryDemand: {
      level: "Highest Prestige",
      sharePercentage: 16,
      statusLabel: "Primary Profile for FAANG / Tier-1 Campus Hiring",
      trend: "Stringent evaluation on DSA + Low Level Design (LLD) + Core CS.",
    },
    avgCompensation: {
      inrRange: "₹18 - ₹52 LPA",
      entryLevel: "₹14 - ₹24 LPA",
      seniorLevel: "₹45 - ₹85+ LPA",
      usdRange: "$140k - $220k",
      medianLpa: 30,
    },
    topHiringCompanies: [
      "Google",
      "Microsoft",
      "Amazon",
      "Meta",
      "Adobe",
      "Uber",
      "Cisco",
      "Goldman Sachs",
      "Apple",
    ],
    hiringBars: [
      "2-3 Algorithmic Coding Rounds (Hard Graphs, DP, Trees, Trie, Heaps)",
      "1 Low Level Design (LLD / Machine Coding) Round (Design Patterns, SOLID, Concurrency)",
      "1 Core CS Fundamentals Round (OS Virtual Memory, DBMS Transactions, Computer Networks)",
      "1 Hiring Manager / Behavioral Leadership Round",
    ],
    coreRequiredSkills: [
      { name: "C++", category: "Language", weight: 1.0 },
      { name: "Java", category: "Language", weight: 1.0 },
      { name: "Data Structures", category: "DSA", weight: 1.0 },
      { name: "Algorithms", category: "DSA", weight: 1.0 },
      { name: "OOP Principles", category: "Architecture", weight: 0.9 },
      { name: "System Design", category: "Architecture", weight: 0.9 },
      { name: "Operating Systems", category: "Core CS", weight: 0.9 },
      { name: "DBMS", category: "Core CS", weight: 0.9 },
      { name: "Computer Networks", category: "Core CS", weight: 0.8 },
    ],
    preferredSkills: [
      { name: "Python", category: "Language" },
      { name: "Design Patterns", category: "Architecture" },
      { name: "Multithreading", category: "Core CS" },
      { name: "SQL", category: "Database" },
      { name: "Linux", category: "Tooling" },
      { name: "Git", category: "Tooling" },
    ],
    targetDsaSolvedCount: 160,
    targetDimensions: {
      dsa: 88,
      projects: 75,
      skills: 85,
      resume: 82,
      academics: 80,
    },
    idealCoursework: [
      "Data Structures and Algorithms (Advanced)",
      "Operating Systems & Concurrency Mechanics",
      "Database Management Systems & Index Internals",
      "Computer Architecture & Organization",
      "Theory of Computation & Compiler Design",
    ],
    idealProjectSignatures: [
      "algorithm",
      "data-structures",
      "lld",
      "system-design",
      "cplusplus",
      "java",
      "design-patterns",
      "multithreading",
      "simulator",
      "compiler",
    ],
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    shortTitle: "Frontend",
    category: "User Experience & Web Performance",
    summary:
      "Crafting pixel-perfect, accessible, and ultra-fast user interfaces with modern JavaScript/TypeScript, React/Next.js, state management, design tokens, and Core Web Vitals optimization.",
    badge: "🎨 Product & UI/UX",
    colorTheme: {
      accent: "#38BDF8",
      bgSubtle: "rgba(56, 189, 248, 0.08)",
      border: "rgba(56, 189, 248, 0.25)",
      textAccent: "#38BDF8",
    },
    keyResponsibilities: [
      "Build fluid, responsive, and cross-browser web interfaces adhering to high design standards.",
      "Architect client state management (Redux, Zustand, React Query) and optimistic UI flows.",
      "Optimize web application performance (LCP, INP, CLS Core Web Vitals, code-splitting).",
      "Develop reusable component libraries and design systems with Tailwind CSS / CSS Modules.",
      "Implement robust automated component and unit testing using Vitest, Jest, and Playwright.",
    ],
    industryDemand: {
      level: "High",
      sharePercentage: 14,
      statusLabel: "Essential for Product-Led SaaS & Consumer Tech",
      trend: "Surge in demand for TypeScript, Next.js App Router, and motion/micro-interactions.",
    },
    avgCompensation: {
      inrRange: "₹10 - ₹32 LPA",
      entryLevel: "₹7 - ₹16 LPA",
      seniorLevel: "₹24 - ₹48+ LPA",
      usdRange: "$105k - $165k",
      medianLpa: 19,
    },
    topHiringCompanies: [
      "Atlassian",
      "Meta",
      "Google",
      "Adobe",
      "Zomato",
      "Swiggy",
      "Stripe",
      "Microsoft",
      "Intuit",
    ],
    hiringBars: [
      "1 JavaScript / TypeScript Deep Dive (Closures, Event Loop, Prototypes, Async)",
      "1 Live UI Machine Coding Round (Building Complex Widgets / State Management)",
      "1 Web Performance, Accessibility (a11y), and Frontend Architecture Round",
      "1 Product Sense & Team Collaboration Round",
    ],
    coreRequiredSkills: [
      { name: "JavaScript", category: "Language", weight: 1.0 },
      { name: "TypeScript", category: "Language", weight: 0.9 },
      { name: "React", category: "Frontend", weight: 1.0 },
      { name: "HTML5", category: "Frontend", weight: 0.9 },
      { name: "CSS3 / Tailwind", category: "Frontend", weight: 0.9 },
      { name: "State Management", category: "Frontend", weight: 0.8 },
      { name: "Web Performance", category: "Frontend", weight: 0.8 },
      { name: "Git", category: "Tooling", weight: 0.8 },
    ],
    preferredSkills: [
      { name: "Next.js", category: "Frontend" },
      { name: "Tailwind CSS", category: "Frontend" },
      { name: "Redux / Zustand", category: "Frontend" },
      { name: "GraphQL", category: "Frontend" },
      { name: "Framer Motion", category: "Frontend" },
      { name: "Testing (Jest/Playwright)", category: "Testing" },
      { name: "Webpack / Vite", category: "Tooling" },
    ],
    targetDsaSolvedCount: 60,
    targetDimensions: {
      dsa: 65,
      projects: 90,
      skills: 90,
      resume: 80,
      academics: 68,
    },
    idealCoursework: [
      "Web Technologies & User Experience Design",
      "Human-Computer Interaction (HCI)",
      "Software Engineering & Architecture",
      "Computer Graphics & Multimedia Systems",
    ],
    idealProjectSignatures: [
      "react",
      "frontend",
      "ui",
      "tailwind",
      "nextjs",
      "dashboard",
      "portfolio",
      "web-app",
      "component-library",
      "framer-motion",
    ],
  },
  {
    id: "devops-cloud",
    title: "DevOps & Cloud Platform Engineer",
    shortTitle: "DevOps & Cloud",
    category: "Infrastructure & Platform",
    summary:
      "Automating infrastructure lifecycle, orchestrating Kubernetes clusters, deploying continuous delivery pipelines, and safeguarding 99.99% cloud service reliability.",
    badge: "⚡ High Demand Infrastructure",
    colorTheme: {
      accent: "#34D399",
      bgSubtle: "rgba(52, 211, 153, 0.08)",
      border: "rgba(52, 211, 153, 0.25)",
      textAccent: "#34D399",
    },
    keyResponsibilities: [
      "Design and maintain automated CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins).",
      "Provision reproducible cloud infrastructure via Terraform and CloudFormation.",
      "Deploy, manage, and scale containerized services in Kubernetes and Docker environments.",
      "Build real-time monitoring, alerting, and distributed tracing stacks (Prometheus, Grafana).",
      "Enforce cloud security guardrails, secrets management, and zero-trust IAM policies.",
    ],
    industryDemand: {
      level: "Very High",
      sharePercentage: 9,
      statusLabel: "Critical Talent Shortage in Cloud Infrastructure",
      trend: "Exploding demand for Kubernetes, Terraform, and AWS/Azure Platform Engineering.",
    },
    avgCompensation: {
      inrRange: "₹14 - ₹38 LPA",
      entryLevel: "₹8 - ₹18 LPA",
      seniorLevel: "₹30 - ₹58+ LPA",
      usdRange: "$120k - $180k",
      medianLpa: 24,
    },
    topHiringCompanies: [
      "Amazon",
      "Microsoft",
      "Google",
      "Cisco",
      "Oracle",
      "Atlassian",
      "Salesforce",
      "Netflix",
    ],
    hiringBars: [
      "1 Linux Systems, Bash Scripting, and Networking Fundamentals Round",
      "1 Containerization & Orchestration Live Troubleshooting (Docker & Kubernetes)",
      "1 Infrastructure as Code (Terraform) & Cloud Architecture (AWS/GCP)",
      "1 Site Reliability & Incident Response Scenario Round",
    ],
    coreRequiredSkills: [
      { name: "Linux", category: "Core CS", weight: 1.0 },
      { name: "Docker", category: "DevOps", weight: 1.0 },
      { name: "Kubernetes", category: "DevOps", weight: 0.9 },
      { name: "AWS / Cloud", category: "Cloud", weight: 0.9 },
      { name: "CI/CD", category: "DevOps", weight: 0.9 },
      { name: "Terraform", category: "DevOps", weight: 0.8 },
      { name: "Python / Bash", category: "Language", weight: 0.8 },
      { name: "Git", category: "Tooling", weight: 0.8 },
    ],
    preferredSkills: [
      { name: "Prometheus & Grafana", category: "Monitoring" },
      { name: "GitHub Actions", category: "DevOps" },
      { name: "Nginx", category: "Networking" },
      { name: "Ansible", category: "DevOps" },
      { name: "Helm", category: "DevOps" },
      { name: "Cloud Security", category: "Security" },
    ],
    targetDsaSolvedCount: 60,
    targetDimensions: {
      dsa: 65,
      projects: 85,
      skills: 90,
      resume: 80,
      academics: 70,
    },
    idealCoursework: [
      "Computer Networks & Distributed Cloud Systems",
      "Operating Systems & Linux Architecture",
      "System Administration & Cloud Computing",
      "Information Security & Cryptography",
    ],
    idealProjectSignatures: [
      "devops",
      "docker",
      "kubernetes",
      "terraform",
      "ci-cd",
      "aws",
      "cloud",
      "prometheus",
      "grafana",
      "microservices",
    ],
  },
  {
    id: "data-engineer",
    title: "Data Engineer & Analytics",
    shortTitle: "Data Eng",
    category: "Big Data & Distributed Pipelines",
    summary:
      "Architecting distributed big data streaming architectures, ETL/ELT pipelines, real-time analytics data warehouses, and multi-terabyte data lakes.",
    badge: "📊 Data Warehouses & Lakehouses",
    colorTheme: {
      accent: "#A78BFA",
      bgSubtle: "rgba(167, 139, 250, 0.08)",
      border: "rgba(167, 139, 250, 0.25)",
      textAccent: "#A78BFA",
    },
    keyResponsibilities: [
      "Design, build, and optimize scalable data pipelines using Apache Spark, Kafka, and Airflow.",
      "Model dimensional data warehouses and lakehouses (Snowflake, BigQuery, Databricks).",
      "Ensure data quality, lineage, governance, and schema evolution across multi-terabyte datasets.",
      "Write complex, highly-optimized SQL analytical queries and window transformations.",
      "Implement real-time streaming ingestion pipelines with Kafka and Flink.",
    ],
    industryDemand: {
      level: "High",
      sharePercentage: 8,
      statusLabel: "Fundamental for AI & Analytics-Driven Enterprises",
      trend: "Rising demand for PySpark, dbt, Snowflake, and streaming Kafka pipelines.",
    },
    avgCompensation: {
      inrRange: "₹12 - ₹36 LPA",
      entryLevel: "₹8 - ₹17 LPA",
      seniorLevel: "₹26 - ₹52+ LPA",
      usdRange: "$115k - $170k",
      medianLpa: 21,
    },
    topHiringCompanies: [
      "Netflix",
      "Uber",
      "Amazon",
      "Goldman Sachs",
      "Google",
      "Meta",
      "Microsoft",
      "Flipkart",
    ],
    hiringBars: [
      "1 Advanced SQL & Data Modeling (Window Functions, CTEs, Joins, Indexing)",
      "1 Distributed Computing & Python/PySpark Coding Round",
      "1 Data Architecture & Pipeline Design (Batch vs Streaming, Partitioning, Lambda)",
      "1 Behavioral & Business Problem Solving Round",
    ],
    coreRequiredSkills: [
      { name: "SQL", category: "Database", weight: 1.0 },
      { name: "Python", category: "Language", weight: 1.0 },
      { name: "Apache Spark / PySpark", category: "Big Data", weight: 0.9 },
      { name: "PostgreSQL / Data Warehouses", category: "Database", weight: 0.9 },
      { name: "ETL / Data Pipelines", category: "Data", weight: 0.9 },
      { name: "Airflow / Orchestration", category: "Data", weight: 0.8 },
      { name: "Git", category: "Tooling", weight: 0.8 },
    ],
    preferredSkills: [
      { name: "Kafka", category: "Messaging" },
      { name: "Snowflake", category: "Database" },
      { name: "BigQuery", category: "Database" },
      { name: "dbt", category: "Data" },
      { name: "AWS S3 / Glue", category: "Cloud" },
      { name: "Pandas", category: "Data" },
      { name: "Docker", category: "DevOps" },
    ],
    targetDsaSolvedCount: 80,
    targetDimensions: {
      dsa: 70,
      projects: 85,
      skills: 88,
      resume: 80,
      academics: 75,
    },
    idealCoursework: [
      "Database Management Systems (DBMS) & Data Warehousing",
      "Big Data Analytics & Distributed Systems",
      "Data Mining & Business Intelligence",
      "Statistical Methods & Linear Algebra",
    ],
    idealProjectSignatures: [
      "data-pipeline",
      "etl",
      "spark",
      "pyspark",
      "airflow",
      "snowflake",
      "sql",
      "kafka",
      "analytics",
      "data-engineering",
    ],
  },
  {
    id: "aiml-engineer",
    title: "AI/ML Engineering",
    shortTitle: "AI & ML",
    category: "Machine Learning & Generative AI",
    summary:
      "Developing machine learning models, fine-tuning LLMs, implementing Retrieval-Augmented Generation (RAG) pipelines, and serving intelligent inference engines in production.",
    badge: "🤖 Generative AI Frontier",
    colorTheme: {
      accent: "#EC4899",
      bgSubtle: "rgba(236, 72, 153, 0.08)",
      border: "rgba(236, 72, 153, 0.25)",
      textAccent: "#EC4899",
    },
    keyResponsibilities: [
      "Train, fine-tune, and evaluate machine learning and deep learning neural architectures.",
      "Build production RAG pipelines utilizing vector databases, embedding models, and rerankers.",
      "Optimize model inference latency via quantization, ONNX runtime, and vLLM serving.",
      "Deploy scalable RESTful model inference endpoints using FastAPI, Docker, and GPU clusters.",
      "Perform rigorous feature engineering, data preprocessing, and model drift monitoring.",
    ],
    industryDemand: {
      level: "Explosive Surge",
      sharePercentage: 5,
      statusLabel: "Highest Growth Domain Across Global Tech",
      trend: "Enormous demand for LLM application engineering, PyTorch, and AI Agent workflows.",
    },
    avgCompensation: {
      inrRange: "₹16 - ₹48 LPA",
      entryLevel: "₹10 - ₹22 LPA",
      seniorLevel: "₹35 - ₹70+ LPA",
      usdRange: "$130k - $210k",
      medianLpa: 28,
    },
    topHiringCompanies: [
      "Google",
      "Microsoft",
      "Meta",
      "NVIDIA",
      "Adobe",
      "Amazon",
      "Apple",
    ],
    hiringBars: [
      "1 Python & Algorithmic Problem Solving (Matrix Math, Recursion, Trees)",
      "1 Machine Learning Fundamentals & Math (Loss functions, Optimization, Overfitting)",
      "1 ML System Design / LLM Pipeline Architecture (RAG, Vector DBs, Fine-tuning)",
      "1 Research Paper Discussion / Practical AI Project Defense",
    ],
    coreRequiredSkills: [
      { name: "Python", category: "Language", weight: 1.0 },
      { name: "PyTorch / TensorFlow", category: "AI/ML", weight: 1.0 },
      { name: "Scikit-Learn", category: "AI/ML", weight: 0.9 },
      { name: "Pandas & NumPy", category: "AI/ML", weight: 0.9 },
      { name: "Machine Learning", category: "AI/ML", weight: 0.9 },
      { name: "Deep Learning", category: "AI/ML", weight: 0.8 },
      { name: "FastAPI / Flask", category: "Backend", weight: 0.8 },
      { name: "Git", category: "Tooling", weight: 0.8 },
    ],
    preferredSkills: [
      { name: "Hugging Face", category: "AI/ML" },
      { name: "LangChain / LlamaIndex", category: "AI/ML" },
      { name: "Vector Databases (Pinecone/Milvus)", category: "AI/ML" },
      { name: "Docker", category: "DevOps" },
      { name: "OpenCV / Computer Vision", category: "AI/ML" },
      { name: "Transformers / NLP", category: "AI/ML" },
      { name: "CUDA / GPU Optimization", category: "AI/ML" },
    ],
    targetDsaSolvedCount: 90,
    targetDimensions: {
      dsa: 75,
      projects: 90,
      skills: 90,
      resume: 82,
      academics: 80,
    },
    idealCoursework: [
      "Machine Learning & Pattern Recognition",
      "Deep Learning & Neural Networks",
      "Linear Algebra & Multivariable Calculus",
      "Probability & Mathematical Statistics",
      "Natural Language Processing (NLP)",
    ],
    idealProjectSignatures: [
      "machine-learning",
      "deep-learning",
      "pytorch",
      "tensorflow",
      "llm",
      "rag",
      "nlp",
      "computer-vision",
      "scikit-learn",
      "transformers",
      "fastapi",
    ],
  },
  {
    id: "mobile-developer",
    title: "Mobile Application Developer (iOS/Android/React Native)",
    shortTitle: "Mobile Dev",
    category: "Native & Cross-Platform Mobile",
    summary:
      "Engineering fluid native and hybrid mobile applications for iOS and Android with React Native/Flutter or Swift/Kotlin, offline persistence, and seamless OS integrations.",
    badge: "📱 Mobile App Engineering",
    colorTheme: {
      accent: "#F472B6",
      bgSubtle: "rgba(244, 114, 182, 0.08)",
      border: "rgba(244, 114, 182, 0.25)",
      textAccent: "#F472B6",
    },
    keyResponsibilities: [
      "Build performant cross-platform (React Native/Flutter) or native (Swift/Kotlin) apps.",
      "Implement robust local caching and offline synchronization using SQLite/Room/CoreData.",
      "Integrate native hardware capabilities (Camera, Geolocation, Biometrics, Bluetooth).",
      "Manage app store release pipelines (Google Play Store, Apple App Store, TestFlight).",
      "Optimize rendering speed, battery consumption, memory leaks, and 60fps gesture animations.",
    ],
    industryDemand: {
      level: "Steady & High",
      sharePercentage: 3,
      statusLabel: "Essential for Consumer & FinTech Product Companies",
      trend: "Strong demand for React Native + TypeScript and Kotlin multiplatform skills.",
    },
    avgCompensation: {
      inrRange: "₹11 - ₹34 LPA",
      entryLevel: "₹7 - ₹16 LPA",
      seniorLevel: "₹25 - ₹50+ LPA",
      usdRange: "$110k - $165k",
      medianLpa: 20,
    },
    topHiringCompanies: [
      "Uber",
      "Swiggy",
      "Zomato",
      "Flipkart",
      "Apple",
      "Meta",
      "Amazon",
      "Google",
    ],
    hiringBars: [
      "1 Problem Solving & DSA (Data Structures, Strings, Arrays, Recursion)",
      "1 Live Mobile Machine Coding (State, Navigation, Offline Sync, Animation)",
      "1 Mobile Architecture & Lifecycle (State Management, Native Bridges, Memory)",
      "1 Product UX & Collaboration Round",
    ],
    coreRequiredSkills: [
      { name: "React Native / Flutter", category: "Mobile", weight: 1.0 },
      { name: "JavaScript / TypeScript", category: "Language", weight: 0.9 },
      { name: "Mobile UI Design", category: "Mobile", weight: 0.9 },
      { name: "REST APIs", category: "Architecture", weight: 0.8 },
      { name: "State Management", category: "Mobile", weight: 0.8 },
      { name: "Git", category: "Tooling", weight: 0.8 },
    ],
    preferredSkills: [
      { name: "Swift / iOS", category: "Mobile" },
      { name: "Kotlin / Android", category: "Mobile" },
      { name: "SQLite / Realm", category: "Database" },
      { name: "Expo", category: "Mobile" },
      { name: "Redux / Zustand", category: "Mobile" },
      { name: "Push Notifications", category: "Mobile" },
    ],
    targetDsaSolvedCount: 60,
    targetDimensions: {
      dsa: 65,
      projects: 85,
      skills: 88,
      resume: 80,
      academics: 68,
    },
    idealCoursework: [
      "Mobile Application Development",
      "Human-Computer Interaction (HCI)",
      "Operating Systems & Mobile OS Architecture",
      "Software Engineering",
    ],
    idealProjectSignatures: [
      "react-native",
      "flutter",
      "ios",
      "android",
      "mobile-app",
      "swift",
      "kotlin",
      "expo",
      "mobile",
    ],
  },
  {
    id: "cybersecurity-systems",
    title: "Cyber Security & Systems Engineer",
    shortTitle: "Cyber Security",
    category: "Security & Systems Engineering",
    summary:
      "Securing enterprise architectures, conducting vulnerability assessments, implementing cryptographic protocols, penetration testing, and hardening low-level operating system surfaces.",
    badge: "🛡️ National & Enterprise Defense",
    colorTheme: {
      accent: "#4ADE80",
      bgSubtle: "rgba(74, 222, 128, 0.08)",
      border: "rgba(74, 222, 128, 0.25)",
      textAccent: "#4ADE80",
    },
    keyResponsibilities: [
      "Conduct penetration testing, code auditing, and vulnerability assessments (OWASP Top 10).",
      "Implement secure authentication, public key infrastructure (PKI), and cryptographic protocols.",
      "Configure network security perimeters, Web Application Firewalls (WAF), and SIEM tooling.",
      "Perform reverse engineering, malware analysis, and binary exploitation mitigation.",
      "Lead incident response and create security hardening compliance guidelines.",
    ],
    industryDemand: {
      level: "Critical Priority",
      sharePercentage: 2,
      statusLabel: "Ever-Expanding Demand Across Cloud, FinTech, & Defense",
      trend: "Massive demand for Cloud Security Posture (CSPM), DevSecOps, and Zero Trust.",
    },
    avgCompensation: {
      inrRange: "₹13 - ₹40 LPA",
      entryLevel: "₹8 - ₹18 LPA",
      seniorLevel: "₹28 - ₹56+ LPA",
      usdRange: "$125k - $190k",
      medianLpa: 23,
    },
    topHiringCompanies: [
      "Cisco",
      "Google",
      "Microsoft",
      "Goldman Sachs",
      "Amazon",
      "Oracle",
      "CrowdStrike",
      "Cloudflare",
      "Qualys",
    ],
    hiringBars: [
      "1 Computer Networks & OS Internals Deep Dive (TCP/IP, Sockets, Memory, Linux)",
      "1 Application Security & Practical Vulnerability Assessment (OWASP, JWT, SQLi, XSS)",
      "1 Cryptography & System Hardening Architecture Scenario",
      "1 Behavioral & Incident Management Protocol Round",
    ],
    coreRequiredSkills: [
      { name: "Computer Networks", category: "Core CS", weight: 1.0 },
      { name: "Operating Systems / Linux", category: "Core CS", weight: 1.0 },
      { name: "C / C++", category: "Language", weight: 0.9 },
      { name: "Python", category: "Language", weight: 0.9 },
      { name: "Security & Cryptography", category: "Security", weight: 1.0 },
      { name: "OWASP & Web Security", category: "Security", weight: 0.9 },
      { name: "Git", category: "Tooling", weight: 0.7 },
    ],
    preferredSkills: [
      { name: "Wireshark / Burp Suite", category: "Security" },
      { name: "DevSecOps", category: "Security" },
      { name: "Reverse Engineering", category: "Security" },
      { name: "Cloud Security", category: "Cloud" },
      { name: "Docker", category: "DevOps" },
    ],
    targetDsaSolvedCount: 80,
    targetDimensions: {
      dsa: 72,
      projects: 82,
      skills: 88,
      resume: 80,
      academics: 80,
    },
    idealCoursework: [
      "Cryptography & Network Security",
      "Operating Systems & Linux Kernel Internals",
      "Computer Networks (Advanced Protocol Analysis)",
      "Information Security & Ethical Hacking",
    ],
    idealProjectSignatures: [
      "security",
      "cryptography",
      "cybersecurity",
      "firewall",
      "penetration-testing",
      "wireshark",
      "linux",
      "network",
      "cplusplus",
    ],
  },
];

/**
 * Returns list of all canonical role benchmarks
 */
export function getCanonicalRoles() {
  return CANONICAL_ROLES_BENCHMARK;
}

/**
 * Finds a specific canonical role by id or slug
 */
export function getRoleBySlug(slug) {
  if (!slug) return CANONICAL_ROLES_BENCHMARK[0];
  const clean = slug.toLowerCase().trim();
  return (
    CANONICAL_ROLES_BENCHMARK.find(
      (r) =>
        r.id === clean ||
        r.title.toLowerCase() === clean ||
        r.title.toLowerCase().includes(clean) ||
        clean.includes(r.id)
    ) || CANONICAL_ROLES_BENCHMARK[0]
  );
}

/**
 * Tokenizes compound skill names (e.g., "C / C++", "Python / Bash", "Pandas & NumPy")
 */
function getSkillTokens(skillName) {
  if (!skillName || typeof skillName !== "string") return [];
  const normalized = skillName.toLowerCase().trim();
  const splitRegex = new RegExp("[/,]|(?:\\s+&\\s+)");
  const tokens = normalized
    .split(splitRegex)
    .map((t) => t.trim())
    .filter(Boolean);

  if (!tokens.includes(normalized)) {
    tokens.push(normalized);
  }
  return tokens;
}

/**
 * Checks if a token matches within a text body with single-char boundary safety
 */
function matchTextToken(text, token) {
  if (!text || !token) return false;
  if (token.length === 1) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(text);
  }
  return text.includes(token);
}

/**
 * Normalizes user skill list across various potential formats
 */
function extractCandidateSkills(userProfile) {
  const skillSet = new Set();

  const addSkill = (s) => {
    if (typeof s === "string" && s.trim()) {
      const lower = s.trim().toLowerCase();
      skillSet.add(lower);
      const tokens = getSkillTokens(lower);
      tokens.forEach((t) => skillSet.add(t));
    } else if (s && typeof s.name === "string" && s.name.trim()) {
      addSkill(s.name);
    }
  };

  // From userProfile.skills array
  if (Array.isArray(userProfile?.skills)) {
    userProfile.skills.forEach(addSkill);
  }

  // From userProfile.resumeAnalysis
  const resumeSkills =
    userProfile?.resumeAnalysis?.skills_extracted ||
    userProfile?.resumeAnalysis?.skills ||
    [];
  if (Array.isArray(resumeSkills)) {
    resumeSkills.forEach(addSkill);
  }

  return Array.from(skillSet);
}

/**
 * Computes transparent multi-evidence role alignment for the candidate
 */
export function evaluateRoleFit({
  userProfile = null,
  academicProfile = null,
  readinessData = null,
  githubProfile = null,
  leetcodeProfile = null,
  marketplaceJobs = [],
}) {
  const parseNumeric = (val) =>
    val !== null && val !== undefined && val !== "" && !isNaN(Number(val)) ? Number(val) : null;

  const candidateSkills = extractCandidateSkills(userProfile);

  // GitHub signals
  const hasGitHub = Boolean(githubProfile && (githubProfile.username || githubProfile.connected));
  const githubRepos = githubProfile?.repositories || [];
  const githubLanguages = (githubProfile?.languages || []).map((l) => ({
    name: (l.languageName || l.name || "").toLowerCase(),
    percentage: Number(l.percentage) || 0,
    repoCount: Number(l.repoCount) || 1,
  }));
  const originalReposCount = Number(githubProfile?.originalReposCount ?? githubRepos.length ?? 0);
  const githubProjectScore = hasGitHub ? Number(githubProfile?.projectScore ?? (originalReposCount > 0 ? Math.min(95, originalReposCount * 15 + 30) : 0)) : 0;
  const deployedRepos = githubRepos.filter(
    (r) => r.isDeployed || Boolean(r.liveUrl) || Boolean(r.homepage)
  );

  // LeetCode signals
  const hasLeetCode = Boolean(leetcodeProfile && (leetcodeProfile.username || leetcodeProfile.connected));
  const leetcodeSolved = Number(
    leetcodeProfile?.totalSolved ??
      (readinessData?.dimensions?.dsa?.score ? Math.round(readinessData.dimensions.dsa.score * 1.8) : 0)
  );
  const leetcodeMediumSolved = Number(leetcodeProfile?.mediumSolved ?? (leetcodeSolved > 0 ? Math.round(leetcodeSolved * 0.45) : 0));
  const leetcodeHardSolved = Number(leetcodeProfile?.hardSolved ?? (leetcodeSolved > 0 ? Math.round(leetcodeSolved * 0.08) : 0));

  // Resume ATS signals
  const rawResumeScore = userProfile?.resumeScore ?? readinessData?.dimensions?.resume?.score ?? null;
  const resumeAtsScore = rawResumeScore !== null ? Number(rawResumeScore) : 0;
  const resumeText = (userProfile?.resumeText || "").toLowerCase();

  // Academics signals
  const degree = (academicProfile?.degree || userProfile?.degree || "").toLowerCase();
  const branch = (academicProfile?.branch || userProfile?.branch || "").toLowerCase();
  const coursework = (academicProfile?.coursework || []).map((c) =>
    (typeof c === "string" ? c : c.name || "").toLowerCase()
  );
  const currentCgpa = parseNumeric(academicProfile?.currentCgpa ?? userProfile?.cgpa);

  // Data sufficiency check (avoids fabricating high match scores when candidate profile is completely empty)
  let sufficiencyPoints = 0;
  if (candidateSkills.length > 0) sufficiencyPoints += 30;
  if (hasGitHub && (originalReposCount > 0 || githubLanguages.length > 0)) sufficiencyPoints += 25;
  if (hasLeetCode && leetcodeSolved > 0) sufficiencyPoints += 20;
  if (userProfile?.resumeScore || userProfile?.resumeText) sufficiencyPoints += 15;
  if (degree || branch || (currentCgpa !== null && currentCgpa > 0)) sufficiencyPoints += 10;

  const hasLowData = sufficiencyPoints < 35;

  // Evaluate every canonical role
  const evaluatedRoles = CANONICAL_ROLES_BENCHMARK.map((role) => {
    const strongMatchingEvidence = [];
    const missingSkills = [];

    // -------------------------------------------------------------
    // 1. SKILLS EVIDENCE ALIGNMENT (28% WEIGHT)
    // -------------------------------------------------------------
    let matchedCorePoints = 0;
    let totalCorePoints = 0;

    role.coreRequiredSkills.forEach((skillItem) => {
      totalCorePoints += skillItem.weight;
      const tokens = getSkillTokens(skillItem.name);

      // Check candidateSkills direct or partial match
      const matchedDirect = candidateSkills.some((cs) =>
        tokens.some((token) => cs === token || cs.includes(token) || token.includes(cs))
      );
      // Check GitHub languages match
      const matchedLang = githubLanguages.some((gl) =>
        tokens.some((token) => gl.name.includes(token) || token.includes(gl.name))
      );
      // Check resume keywords match
      const matchedResume =
        resumeText.length > 0 && tokens.some((token) => matchTextToken(resumeText, token));

      if (matchedDirect || matchedLang || matchedResume) {
        matchedCorePoints += skillItem.weight;
        const source = matchedDirect
          ? "Profile Skills"
          : matchedLang
          ? "GitHub Codebase"
          : "Resume Verified";
        strongMatchingEvidence.push(`${skillItem.name} (${source})`);
      } else {
        missingSkills.push({
          skill: skillItem.name,
          category: skillItem.category,
          priority: skillItem.weight >= 0.9 ? "High" : "Medium",
          fixLink: "/app/roadmap",
        });
      }
    });

    // Preferred skills bonus (up to 15 bonus pts)
    let preferredMatchedCount = 0;
    role.preferredSkills.forEach((pref) => {
      const prefTokens = getSkillTokens(pref.name);
      const isMatched =
        candidateSkills.some((cs) =>
          prefTokens.some((token) => cs.includes(token) || token.includes(cs))
        ) ||
        (resumeText.length > 0 && prefTokens.some((token) => matchTextToken(resumeText, token)));
      if (isMatched) {
        preferredMatchedCount += 1;
        strongMatchingEvidence.push(`${pref.name} (Bonus Technology)`);
      }
    });

    let skillsScore = 0;
    if (candidateSkills.length > 0 || githubLanguages.length > 0 || resumeText.length > 0) {
      const skillsCoveragePct = totalCorePoints > 0 ? (matchedCorePoints / totalCorePoints) * 100 : 0;
      skillsScore = Math.min(
        100,
        Math.round(skillsCoveragePct * 0.85 + Math.min(15, preferredMatchedCount * 4))
      );
    }

    // -------------------------------------------------------------
    // 2. GITHUB & PROJECT EVIDENCE ALIGNMENT (24% WEIGHT)
    // -------------------------------------------------------------
    let githubMatchScore = 0;
    let matchingReposCount = 0;

    if (hasGitHub && (githubRepos.length > 0 || originalReposCount > 0)) {
      githubRepos.forEach((repo) => {
        const textToSearch = `${repo.name || ""} ${repo.description || ""} ${(repo.topics || []).join(" ")} ${
          repo.language || ""
        }`.toLowerCase();

        const matchesSignature = role.idealProjectSignatures.some((sig) => textToSearch.includes(sig));
        if (matchesSignature) {
          matchingReposCount += 1;
        }
      });

      if (matchingReposCount > 0) {
        strongMatchingEvidence.push(
          `${matchingReposCount} GitHub repos match ${role.shortTitle} architectures`
        );
      }

      if (deployedRepos.length > 0 && ["full-stack-developer", "frontend-developer", "mobile-developer"].includes(role.id)) {
        strongMatchingEvidence.push(
          `${deployedRepos.length} live project deployment${deployedRepos.length > 1 ? "s" : ""} verified`
        );
      }

      // Compute composite GitHub score for this role
      const repoRatio = Math.min(1, matchingReposCount / 2);
      const projectBase = githubProjectScore;
      githubMatchScore = Math.min(100, Math.round(projectBase * 0.5 + repoRatio * 40 + (deployedRepos.length > 0 ? 10 : 0)));
    } else {
      githubMatchScore = 0;
    }

    // -------------------------------------------------------------
    // 3. LEETCODE & PROBLEM SOLVING ALIGNMENT (20% WEIGHT)
    // -------------------------------------------------------------
    const dsaTarget = role.targetDsaSolvedCount;
    let dsaScore = 0;

    if (leetcodeSolved > 0) {
      const dsaSolvedRatio = Math.min(1.2, leetcodeSolved / dsaTarget);
      dsaScore = Math.min(100, Math.round(dsaSolvedRatio * 85 + (leetcodeMediumSolved > 25 ? 10 : 0) + (leetcodeHardSolved > 5 ? 5 : 0)));

      if (leetcodeSolved >= dsaTarget * 0.8) {
        strongMatchingEvidence.push(
          `${leetcodeSolved} LeetCode problems solved (${leetcodeMediumSolved} Mediums)`
        );
      } else {
        missingSkills.push({
          skill: `DSA Bar (${dsaTarget}+ Solved Target)`,
          category: "Problem Solving",
          priority: role.id === "sde-core" || role.id === "backend-developer" ? "High" : "Medium",
          fixLink: "/app/dsa",
        });
      }
    } else {
      missingSkills.push({
        skill: `DSA Bar (${dsaTarget}+ Solved Target)`,
        category: "Problem Solving",
        priority: role.id === "sde-core" || role.id === "backend-developer" ? "High" : "Medium",
        fixLink: "/app/dsa",
      });
    }

    // -------------------------------------------------------------
    // 4. RESUME ATS & DOMAIN KEYWORDS (16% WEIGHT)
    // -------------------------------------------------------------
    let resumeScore = 0;
    let resumeMatchedKeywordsCount = 0;

    if (resumeAtsScore > 0 || resumeText.length > 0) {
      resumeScore = resumeAtsScore;
      role.coreRequiredSkills.forEach((s) => {
        const tokens = getSkillTokens(s.name);
        if (resumeText.length > 0 && tokens.some((token) => matchTextToken(resumeText, token))) {
          resumeMatchedKeywordsCount += 1;
        }
      });

      if (resumeMatchedKeywordsCount >= 3) {
        strongMatchingEvidence.push(
          `${resumeMatchedKeywordsCount} core keywords validated in ATS Resume`
        );
        resumeScore = Math.min(100, resumeScore + 6);
      }
    }

    // -------------------------------------------------------------
    // 5. ACADEMIC COURSEWORK & DOMAIN SPECIALIZATION (12% WEIGHT)
    // -------------------------------------------------------------
    let academicScore = 0;
    let matchingCourseCount = 0;

    role.idealCoursework.forEach((course) => {
      const cLower = course.toLowerCase();
      const isMatched = coursework.some((cw) => cw.includes(cLower) || cLower.includes(cw));
      if (isMatched) {
        matchingCourseCount += 1;
      }
    });

    if (matchingCourseCount > 0) {
      strongMatchingEvidence.push(
        `Curriculum includes: ${role.idealCoursework.slice(0, 2).join(", ")}`
      );
      academicScore = Math.min(100, 60 + matchingCourseCount * 10 + (currentCgpa ? Math.round((currentCgpa / 10) * 20) : 0));
    } else if (degree || branch || currentCgpa !== null) {
      academicScore = currentCgpa ? Math.round((currentCgpa / 10) * 70) : 50;
    } else {
      academicScore = 0;
    }

    // -------------------------------------------------------------
    // COMPOSITE MATCH PERCENTAGE (0 - 100%)
    // -------------------------------------------------------------
    const rawCompositeScore = Math.round(
      skillsScore * 0.28 +
        githubMatchScore * 0.24 +
        dsaScore * 0.20 +
        resumeScore * 0.16 +
        academicScore * 0.12
    );

    const matchScore = Math.min(100, Math.max(0, rawCompositeScore));

    // Match Grade badge
    let matchGrade = "Unassessed";
    let matchGradeColor = "zinc";
    if (matchScore >= 85) {
      matchGrade = "Exceptional Fit";
      matchGradeColor = "emerald";
    } else if (matchScore >= 70) {
      matchGrade = "Strong Match";
      matchGradeColor = "lime";
    } else if (matchScore >= 50) {
      matchGrade = "Moderate Fit";
      matchGradeColor = "amber";
    } else if (matchScore > 0) {
      matchGrade = "Growth Area";
      matchGradeColor = "zinc";
    } else {
      matchGrade = "Unassessed";
      matchGradeColor = "zinc";
    }

    // Filter relevant marketplace jobs for this role
    const matchedJobs = marketplaceJobs.filter((job) => {
      const titleLower = (job.title || "").toLowerCase();
      const roleLower = role.title.toLowerCase();
      const roleShortLower = role.shortTitle.toLowerCase();
      return (
        titleLower.includes(roleShortLower) ||
        roleLower.includes(titleLower) ||
        (job.skills || []).some((s) =>
          role.coreRequiredSkills.some((rs) => rs.name.toLowerCase() === s.toLowerCase())
        )
      );
    });

    // Determine if this is the user's currently selected target role
    const isCurrentTarget =
      Boolean(userProfile?.targetJobRole) &&
      (userProfile.targetJobRole.toLowerCase() === role.title.toLowerCase() ||
        userProfile.targetJobRole.toLowerCase().includes(role.shortTitle.toLowerCase()) ||
        role.title.toLowerCase().includes(userProfile.targetJobRole.toLowerCase()));

    return {
      ...role,
      matchScore,
      matchGrade,
      matchGradeColor,
      isCurrentTarget,
      strongMatchingEvidence: Array.from(new Set(strongMatchingEvidence)).slice(0, 5),
      missingSkills: missingSkills.slice(0, 4),
      matchedJobs: matchedJobs.slice(0, 4),
      dimensionScores: {
        skills: skillsScore,
        github: githubMatchScore,
        dsa: dsaScore,
        resume: resumeScore,
        academics: academicScore,
      },
    };
  });

  // Sort descending by matchScore
  evaluatedRoles.sort((a, b) => b.matchScore - a.matchScore);

  // Mark top rank
  if (evaluatedRoles.length > 0) {
    evaluatedRoles[0].isTopMatch = true;
  }

  return {
    hasLowData,
    sufficiencyPoints,
    evaluatedRoles,
    topRole: evaluatedRoles[0] || null,
    totalEvaluated: evaluatedRoles.length,
    candidateSummary: {
      totalSkillsCount: candidateSkills.length,
      leetcodeSolved,
      githubReposCount: originalReposCount,
      resumeScore: resumeAtsScore,
    },
  };
}

/**
 * Adopts a canonical role as the user's official target job role via Node API
 */
export async function adoptTargetRole(roleTitle) {
  if (!roleTitle || typeof roleTitle !== "string") {
    throw new Error("Invalid role title");
  }

  const response = await axios.put(
    `${NODE_API_URL}/api/users/profile`,
    {
      targetJobRole: roleTitle.trim(),
    },
    { withCredentials: true }
  );

  return response.data;
}
