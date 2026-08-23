// Curated Whitelist of Premier Technology Companies & Canonical Roles for getPlaced
// Users and AI models are strictly constrained to this whitelist.

export const CURATED_COMPANIES = [
  {
    id: "google",
    name: "Google",
    fullName: "Google (Alphabet)",
    slug: "google",
    domain: "google.com",
    logoUrl: "https://cdn.simpleicons.org/google",
    brandColor: "#4285F4",
    tier: "Tier-1 / FAANG / Big Tech",
    avgPackageLpa: 45,
    ctcRange: "₹35L - ₹58L / yr",
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["All Branches", "CS/IT", "ECE", "EEE", "Mechanical", "Civil"],
    shortBio: "Global leader in search, cloud infrastructure, AI (Gemini), distributed systems, and web technologies.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Backend Developer",
      "Frontend Developer",
      "Full Stack Developer",
      "AI/ML Engineering",
    ],
  },
  {
    id: "microsoft",
    name: "Microsoft",
    fullName: "Microsoft Corporation",
    slug: "microsoft",
    domain: "microsoft.com",
    logoUrl: "https://cdn.simpleicons.org/microsoft",
    brandColor: "#00A4EF",
    tier: "Tier-1 / Big Tech / Cloud Giant",
    avgPackageLpa: 44,
    ctcRange: "₹32L - ₹52L / yr",
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches", "ECE", "EEE", "Maths & Computing"],
    shortBio: "Pioneering enterprise cloud (Azure), developer tools, operating systems, and OpenAI partner ecosystems.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Full Stack Developer",
      "Backend Developer",
      "DevOps & Cloud Platform Engineer",
      "AI/ML Engineering",
    ],
  },
  {
    id: "amazon",
    name: "Amazon",
    fullName: "Amazon (AWS)",
    slug: "amazon",
    domain: "amazon.com",
    logoUrl: "https://cdn.simpleicons.org/amazon",
    brandColor: "#FF9900",
    tier: "Tier-1 / FAANG / Cloud Giant",
    avgPackageLpa: 38,
    ctcRange: "₹30L - ₹48L / yr",
    minCgpa: 7.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["All Engineering Branches"],
    shortBio: "World's largest e-commerce and cloud infrastructure provider (AWS) operating at planetary scale.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Backend Developer",
      "DevOps & Cloud Platform Engineer",
      "Full Stack Developer",
      "Data Engineer & Analytics",
    ],
  },
  {
    id: "meta",
    name: "Meta",
    fullName: "Meta Platforms",
    slug: "meta",
    domain: "meta.com",
    logoUrl: "https://cdn.simpleicons.org/meta",
    brandColor: "#0668E1",
    tier: "Tier-1 / FAANG / Social & AI",
    avgPackageLpa: 48,
    ctcRange: "₹38L - ₹62L / yr",
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE", "Circuit Branches"],
    shortBio: "Pioneering social graph networks, open-source AI (Llama), React ecosystem, and immersive platforms.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Frontend Developer",
      "Full Stack Developer",
      "AI/ML Engineering",
      "Mobile Application Developer",
    ],
  },
  {
    id: "apple",
    name: "Apple",
    fullName: "Apple Inc.",
    slug: "apple",
    domain: "apple.com",
    logoUrl: "https://cdn.simpleicons.org/apple",
    brandColor: "#555555",
    tier: "Tier-1 / FAANG / Ecosystem",
    avgPackageLpa: 46,
    ctcRange: "₹36L - ₹60L / yr",
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE", "EE"],
    shortBio: "Gold-standard hardware-software integration, iOS ecosystem, Swift, and high-performance silicon.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Mobile Application Developer",
      "Backend Developer",
      "AI/ML Engineering",
    ],
  },
  {
    id: "netflix",
    name: "Netflix",
    fullName: "Netflix, Inc.",
    slug: "netflix",
    domain: "netflix.com",
    logoUrl: "https://cdn.simpleicons.org/netflix",
    brandColor: "#E50914",
    tier: "Tier-1 / FAANG / High Autonomy",
    avgPackageLpa: 52,
    ctcRange: "₹42L - ₹70L / yr",
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE"],
    shortBio: "Global streaming entertainment titan famous for high autonomy, microservices architecture, and chaos engineering.",
    roles: [
      "Backend Developer",
      "Full Stack Developer",
      "Data Engineer & Analytics",
      "DevOps & Cloud Platform Engineer",
    ],
  },
  {
    id: "uber",
    name: "Uber",
    fullName: "Uber Technologies",
    slug: "uber",
    domain: "uber.com",
    logoUrl: "https://cdn.simpleicons.org/uber",
    brandColor: "#000000",
    tier: "Tier-1 / High Scale Distributed",
    avgPackageLpa: 48,
    ctcRange: "₹38L - ₹60L / yr",
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches"],
    shortBio: "Real-time mobility and delivery marketplace driven by low-latency Go microservices, Kafka, and spatial indexing.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Backend Developer",
      "Mobile Application Developer",
      "Data Engineer & Analytics",
    ],
  },
  {
    id: "adobe",
    name: "Adobe",
    fullName: "Adobe Systems",
    slug: "adobe",
    domain: "adobe.com",
    logoUrl: "https://cdn.simpleicons.org/adobe",
    brandColor: "#FF0000",
    tier: "Tier-1 / Creative Tech & Cloud",
    avgPackageLpa: 42,
    ctcRange: "₹34L - ₹54L / yr",
    minCgpa: 7.8,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE", "Maths & Computing"],
    shortBio: "Creative software, document cloud, digital marketing platforms, and generative multimedia engineering.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Full Stack Developer",
      "Frontend Developer",
      "AI/ML Engineering",
    ],
  },
  {
    id: "atlassian",
    name: "Atlassian",
    fullName: "Atlassian Corporation",
    slug: "atlassian",
    domain: "atlassian.com",
    logoUrl: "https://cdn.simpleicons.org/atlassian",
    brandColor: "#0052CC",
    tier: "Tier-1 / Enterprise SaaS Giant",
    avgPackageLpa: 45,
    ctcRange: "₹35L - ₹58L / yr",
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE"],
    shortBio: "Global collaboration and team productivity platform building Jira, Confluence, Trello, and Bitbucket.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Full Stack Developer",
      "Frontend Developer",
      "DevOps & Cloud Platform Engineer",
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    fullName: "Stripe, Inc.",
    slug: "stripe",
    domain: "stripe.com",
    logoUrl: "https://cdn.simpleicons.org/stripe",
    brandColor: "#635BFF",
    tier: "Tier-1 / Global FinTech Giant",
    avgPackageLpa: 48,
    ctcRange: "₹38L - ₹64L / yr",
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches"],
    shortBio: "Economic infrastructure for the internet powering billions of financial transactions with world-class API design.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Backend Developer",
      "Full Stack Developer",
      "Frontend Developer",
    ],
  },
  {
    id: "goldman-sachs",
    name: "Goldman Sachs",
    fullName: "The Goldman Sachs Group",
    slug: "goldman-sachs",
    domain: "goldmansachs.com",
    logoUrl: "https://cdn.simpleicons.org/goldmansachs",
    brandColor: "#7399C6",
    tier: "Tier-1 / Global Investment Banking",
    avgPackageLpa: 36,
    ctcRange: "₹28L - ₹45L / yr",
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE", "EEE", "Maths & Computing", "Mechanical"],
    shortBio: "Global investment banking powerhouse building low-latency algorithmic trading, financial engineering, and quantitative systems.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Backend Developer",
      "Data Engineer & Analytics",
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    fullName: "Salesforce, Inc.",
    slug: "salesforce",
    domain: "salesforce.com",
    logoUrl: "https://cdn.simpleicons.org/salesforce",
    brandColor: "#00A1E0",
    tier: "Tier-1 / Enterprise Cloud CRM",
    avgPackageLpa: 38,
    ctcRange: "₹30L - ₹48L / yr",
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches"],
    shortBio: "The world's #1 enterprise customer relationship platform and cloud applications pioneer.",
    roles: [
      "Full Stack Developer",
      "Backend Developer",
      "DevOps & Cloud Platform Engineer",
      "Software Development Engineer (SDE / Core)",
    ],
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    fullName: "NVIDIA Corporation",
    slug: "nvidia",
    domain: "nvidia.com",
    logoUrl: "https://cdn.simpleicons.org/nvidia",
    brandColor: "#76B900",
    tier: "Tier-1 / AI & Accelerated Computing",
    avgPackageLpa: 46,
    ctcRange: "₹36L - ₹60L / yr",
    minCgpa: 8.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE", "EEE"],
    shortBio: "Pioneering GPU accelerated computing, CUDA architecture, and infrastructure powering the global AI revolution.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "AI/ML Engineering",
      "Backend Developer",
    ],
  },
  {
    id: "oracle",
    name: "Oracle",
    fullName: "Oracle Corporation",
    slug: "oracle",
    domain: "oracle.com",
    logoUrl: "https://cdn.simpleicons.org/oracle",
    brandColor: "#C74634",
    tier: "Tier-1 / Enterprise Cloud & Database",
    avgPackageLpa: 34,
    ctcRange: "₹26L - ₹42L / yr",
    minCgpa: 7.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["All Engineering Branches"],
    shortBio: "Enterprise database engines, Java stewardship, and high-performance Oracle Cloud Infrastructure (OCI).",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Backend Developer",
      "DevOps & Cloud Platform Engineer",
    ],
  },
  {
    id: "cisco",
    name: "Cisco",
    fullName: "Cisco Systems",
    slug: "cisco",
    domain: "cisco.com",
    logoUrl: "https://cdn.simpleicons.org/cisco",
    brandColor: "#1BA0D7",
    tier: "Tier-1 / Networking & Security",
    avgPackageLpa: 32,
    ctcRange: "₹24L - ₹40L / yr",
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE", "EEE", "Telecom"],
    shortBio: "Networking hardware, cybersecurity, distributed routing protocols, and enterprise communications.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "DevOps & Cloud Platform Engineer",
      "Backend Developer",
    ],
  },
  {
    id: "flipkart",
    name: "Flipkart",
    fullName: "Flipkart (Walmart Group)",
    slug: "flipkart",
    domain: "flipkart.com",
    logoUrl: "https://cdn.simpleicons.org/flipkart",
    brandColor: "#2874F0",
    tier: "Tier-1 / E-Commerce Giant",
    avgPackageLpa: 32,
    ctcRange: "₹26L - ₹42L / yr",
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches"],
    shortBio: "India's e-commerce powerhouse handling massive high-concurrency festival sales and supply-chain logistics.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Backend Developer",
      "Full Stack Developer",
      "Mobile Application Developer",
    ],
  },
  {
    id: "swiggy",
    name: "Swiggy",
    fullName: "Swiggy Limited",
    slug: "swiggy",
    domain: "swiggy.com",
    logoUrl: "https://cdn.simpleicons.org/swiggy",
    brandColor: "#FC8019",
    tier: "Tier-1 / On-Demand Consumer Tech",
    avgPackageLpa: 34,
    ctcRange: "₹26L - ₹44L / yr",
    minCgpa: 7.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches", "All Branches"],
    shortBio: "Hyperlocal on-demand logistics, quick commerce (Instamart), and high-throughput microservices.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Backend Developer",
      "Full Stack Developer",
      "Mobile Application Developer",
    ],
  },
  {
    id: "zomato",
    name: "Zomato",
    fullName: "Zomato / Blinkit",
    slug: "zomato",
    domain: "zomato.com",
    logoUrl: "https://cdn.simpleicons.org/zomato",
    brandColor: "#E23744",
    tier: "Tier-1 / Consumer Tech Unicorn",
    avgPackageLpa: 32,
    ctcRange: "₹25L - ₹42L / yr",
    minCgpa: 7.0,
    maxActiveBacklogs: 0,
    allowedBranches: ["All Engineering Branches"],
    shortBio: "Food discovery, delivery logistics, and Blinkit 10-minute quick commerce platform engineering.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Frontend Developer",
      "Backend Developer",
      "Mobile Application Developer",
    ],
  },
  {
    id: "razorpay",
    name: "Razorpay",
    fullName: "Razorpay Software",
    slug: "razorpay",
    domain: "razorpay.com",
    logoUrl: "https://cdn.simpleicons.org/razorpay",
    brandColor: "#0C2340",
    tier: "Tier-1 / FinTech Unicorn",
    avgPackageLpa: 34,
    ctcRange: "₹26L - ₹44L / yr",
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "Circuit Branches"],
    shortBio: "India's premier payments and neo-banking infrastructure handling millions of mission-critical transactions.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Full Stack Developer",
      "Backend Developer",
      "Frontend Developer",
    ],
  },
  {
    id: "intuit",
    name: "Intuit",
    fullName: "Intuit Inc.",
    slug: "intuit",
    domain: "intuit.com",
    logoUrl: "https://cdn.simpleicons.org/intuit",
    brandColor: "#0077C5",
    tier: "Tier-1 / Financial Software Giant",
    avgPackageLpa: 36,
    ctcRange: "₹28L - ₹46L / yr",
    minCgpa: 7.5,
    maxActiveBacklogs: 0,
    allowedBranches: ["CS/IT", "ECE"],
    shortBio: "Financial intelligence powerhouse behind TurboTax, QuickBooks, Credit Karma, and Mailchimp.",
    roles: [
      "Software Development Engineer (SDE / Core)",
      "Full Stack Developer",
      "Frontend Developer",
      "Backend Developer",
    ],
  },
];

export const CANONICAL_ROLES = [
  "Software Development Engineer (SDE / Core)",
  "Full Stack Developer",
  "Backend Developer",
  "Frontend Developer",
  "DevOps & Cloud Platform Engineer",
  "Data Engineer & Analytics",
  "AI/ML Engineering",
  "Mobile Application Developer",
];

// Helper Lookups & Normalizations
const COMPANY_NAME_MAP = new Map();
const COMPANY_SLUG_MAP = new Map();

CURATED_COMPANIES.forEach((c) => {
  COMPANY_NAME_MAP.set(c.name.toLowerCase(), c);
  COMPANY_SLUG_MAP.set(c.slug.toLowerCase(), c);
  if (c.fullName) {
    COMPANY_NAME_MAP.set(c.fullName.toLowerCase(), c);
  }
});

// Common Aliases
const COMPANY_ALIASES = {
  goog: "Google",
  alphabet: "Google",
  msft: "Microsoft",
  amzn: "Amazon",
  aws: "Amazon",
  fb: "Meta",
  facebook: "Meta",
  aapl: "Apple",
  nflx: "Netflix",
  ubr: "Uber",
  adbe: "Adobe",
  atlass: "Atlassian",
  jira: "Atlassian",
  gs: "Goldman Sachs",
  goldman: "Goldman Sachs",
  sfdc: "Salesforce",
  nvda: "NVIDIA",
  orcl: "Oracle",
  csco: "Cisco",
  flip: "Flipkart",
  swig: "Swiggy",
  zom: "Zomato",
  blinkit: "Zomato",
  rzp: "Razorpay",
  intt: "Intuit",
};

const ROLE_ALIASES = {
  sde: "Software Development Engineer (SDE / Core)",
  "sde 1": "Software Development Engineer (SDE / Core)",
  "sde-1": "Software Development Engineer (SDE / Core)",
  "sde i": "Software Development Engineer (SDE / Core)",
  "sde 2": "Software Development Engineer (SDE / Core)",
  "sde-2": "Software Development Engineer (SDE / Core)",
  "sde ii": "Software Development Engineer (SDE / Core)",
  "software engineer": "Software Development Engineer (SDE / Core)",
  "software development engineer": "Software Development Engineer (SDE / Core)",
  swe: "Software Development Engineer (SDE / Core)",
  "full stack": "Full Stack Developer",
  "fullstack": "Full Stack Developer",
  "full-stack": "Full Stack Developer",
  "full stack developer": "Full Stack Developer",
  "full stack engineer": "Full Stack Developer",
  backend: "Backend Developer",
  "backend developer": "Backend Developer",
  "backend engineer": "Backend Developer",
  frontend: "Frontend Developer",
  "frontend developer": "Frontend Developer",
  "frontend engineer": "Frontend Developer",
  devops: "DevOps & Cloud Platform Engineer",
  "cloud engineer": "DevOps & Cloud Platform Engineer",
  "devops engineer": "DevOps & Cloud Platform Engineer",
  sre: "DevOps & Cloud Platform Engineer",
  "site reliability engineer": "DevOps & Cloud Platform Engineer",
  "data engineer": "Data Engineer & Analytics",
  "data analytics": "Data Engineer & Analytics",
  "data analyst": "Data Engineer & Analytics",
  "data scientist": "Data Engineer & Analytics",
  aiml: "AI/ML Engineering",
  "ai/ml": "AI/ML Engineering",
  "ai engineer": "AI/ML Engineering",
  "machine learning": "AI/ML Engineering",
  "machine learning engineer": "AI/ML Engineering",
  "ml engineer": "AI/ML Engineering",
  mobile: "Mobile Application Developer",
  "mobile developer": "Mobile Application Developer",
  "ios developer": "Mobile Application Developer",
  "android developer": "Mobile Application Developer",
  "react native": "Mobile Application Developer",
};

export function isSupportedCompany(input = "") {
  if (!input || typeof input !== "string") return false;
  const clean = input.trim().toLowerCase();
  if (COMPANY_NAME_MAP.has(clean) || COMPANY_SLUG_MAP.has(clean)) return true;
  if (COMPANY_ALIASES[clean]) return true;
  return CURATED_COMPANIES.some((c) => clean.includes(c.slug) || clean.includes(c.name.toLowerCase()));
}

export function normalizeCompanyName(input = "") {
  if (!input || typeof input !== "string") return "Google";
  const clean = input.trim().toLowerCase();
  if (COMPANY_NAME_MAP.has(clean)) return COMPANY_NAME_MAP.get(clean).name;
  if (COMPANY_SLUG_MAP.has(clean)) return COMPANY_SLUG_MAP.get(clean).name;
  if (COMPANY_ALIASES[clean]) return COMPANY_ALIASES[clean];

  for (const c of CURATED_COMPANIES) {
    if (clean.includes(c.slug) || clean.includes(c.name.toLowerCase())) {
      return c.name;
    }
  }
  return "Google";
}

export function getCompanyDetails(input = "") {
  const norm = normalizeCompanyName(input);
  return CURATED_COMPANIES.find((c) => c.name.toLowerCase() === norm.toLowerCase()) || CURATED_COMPANIES[0];
}

export function isSupportedRole(roleInput = "", companyName = "") {
  if (!roleInput || typeof roleInput !== "string") return false;
  const clean = roleInput.trim().toLowerCase();
  const canonical = ROLE_ALIASES[clean] || CANONICAL_ROLES.find((r) => r.toLowerCase() === clean);
  if (!canonical) return false;

  if (companyName) {
    const comp = getCompanyDetails(companyName);
    return comp.roles.includes(canonical);
  }
  return true;
}

export function normalizeRoleName(roleInput = "", companyName = "") {
  if (!roleInput || typeof roleInput !== "string") {
    return "Software Development Engineer (SDE / Core)";
  }
  const clean = roleInput.trim().toLowerCase();
  const canonical = ROLE_ALIASES[clean] || CANONICAL_ROLES.find((r) => r.toLowerCase() === clean);

  const matchedRole = canonical || "Software Development Engineer (SDE / Core)";

  if (companyName) {
    const comp = getCompanyDetails(companyName);
    if (comp.roles.includes(matchedRole)) {
      return matchedRole;
    }
    return comp.roles[0] || matchedRole;
  }

  return matchedRole;
}

export function getRolesForCompany(companyName = "") {
  const comp = getCompanyDetails(companyName);
  return comp.roles || CANONICAL_ROLES;
}

export const CURATED_COMPANY_NAMES = CURATED_COMPANIES.map((c) => c.name);
