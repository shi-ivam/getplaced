/**
 * Study Material Mapping Service for VTOP Courses
 * Maps VIT Course Codes & Titles to exact study material pages on vhelpcc.com
 */

const VHELPCC_STUDY_MATERIAL_BASE = "https://www.vhelpcc.com/study-material";

// Canonical Subject Code to Slug Map
const COURSE_CODE_MAP = {
  // Database Systems
  CSE2004: "dbms",
  BCSE302L: "dbms",
  BCSE302P: "dbms",
  SWE2001: "dbms",
  ITE3001: "dbms",

  // Operating Systems
  CSE2005: "operating-systems",
  BCSE303L: "operating-systems",
  BCSE303P: "operating-systems",
  SWE2002: "operating-systems",

  // Computer Networks
  CSE3001: "computer-networks",
  BCSE308L: "computer-networks",
  SWE3001: "computer-networks",
  ITE2002: "computer-networks",

  // Data Structures & Algorithms
  CSE2003: "data-structures-and-algorithms",
  BCSE202L: "data-structures-and-algorithms",
  BCSE202P: "data-structures-and-algorithms",
  SWE1007: "data-structures-and-algorithms",

  // Theory of Computation & Compiler Design
  CSE3002: "theory-of-computation",
  BCSE304L: "theory-of-computation",
  CSE4005: "compiler-design",
  BCSE305L: "compiler-design",

  // Software Engineering & Object-Oriented Analysis
  CSE3003: "software-engineering",
  SWE2003: "software-engineering",
  BCSE307L: "software-engineering",

  // Object Oriented Programming (Java/C++/Python)
  CSE1002: "object-oriented-programming",
  BCSE102L: "object-oriented-programming",
  SWE1004: "object-oriented-programming",
  CSE1001: "problem-solving-and-programming",
  BCSE101E: "problem-solving-and-programming",

  // Computer Architecture & Microprocessors
  CSE2001: "computer-architecture-and-organization",
  BCSE205L: "computer-architecture-and-organization",
  ECE2003: "microprocessors-and-microcontrollers",
  BECE204L: "microprocessors-and-microcontrollers",

  // AI & Machine Learning
  CSE4001: "artificial-intelligence",
  BCSE309L: "artificial-intelligence",
  CSE4002: "machine-learning",
  BCSE314L: "machine-learning",

  // Web Technologies
  CSE3005: "web-technologies",
  SWE2005: "web-technologies",
  BCSE209L: "web-technologies",

  // Cryptography & Network Security
  CSE4003: "cryptography-and-network-security",
  BCSE312L: "cryptography-and-network-security",

  // Cloud Computing & Distributed Systems
  CSE3006: "cloud-computing",
  BCSE310L: "cloud-computing",

  // Mathematics
  MAT1011: "calculus",
  BMAT101L: "calculus",
  MAT2001: "differential-equations-and-transforms",
  BMAT201L: "differential-equations-and-transforms",
  MAT2002: "discrete-mathematics",
  BMAT202L: "discrete-mathematics",
  MAT3004: "applied-linear-algebra",
  BMAT205L: "probability-and-statistics",

  // Physics & Chemistry
  PHY1701: "engineering-physics",
  BPHY101L: "engineering-physics",
  CHY1701: "engineering-chemistry",
  BCHY101L: "engineering-chemistry",

  // Digital Logic Design & Microcontrollers
  ECE1001: "digital-logic-design",
  BECE101L: "digital-logic-design",
};

// Keyword-based matcher for titles
const KEYWORD_RULES = [
  { match: /(database|dbms|sql|rdbms)/i, slug: "dbms" },
  { match: /(operating system|os)/i, slug: "operating-systems" },
  { match: /(computer network|networking|data communication)/i, slug: "computer-networks" },
  { match: /(data structure|algorithm|dsa|daa)/i, slug: "data-structures-and-algorithms" },
  { match: /(theory of computation|automata|formal language|toc)/i, slug: "theory-of-computation" },
  { match: /(compiler design|compiler)/i, slug: "compiler-design" },
  { match: /(software engineering|agile|software design)/i, slug: "software-engineering" },
  { match: /(object oriented|oops|java programming|c\+\+)/i, slug: "object-oriented-programming" },
  { match: /(problem solving|python programming|c programming)/i, slug: "problem-solving-and-programming" },
  { match: /(computer architecture|computer organization|cao)/i, slug: "computer-architecture-and-organization" },
  { match: /(microprocessor|microcontroller|embedded system)/i, slug: "microprocessors-and-microcontrollers" },
  { match: /(artificial intelligence|ai)/i, slug: "artificial-intelligence" },
  { match: /(machine learning|deep learning|data science)/i, slug: "machine-learning" },
  { match: /(web tech|internet and web|full stack|web development)/i, slug: "web-technologies" },
  { match: /(cryptography|network security|cyber security|information security)/i, slug: "cryptography-and-network-security" },
  { match: /(cloud computing|distributed systems)/i, slug: "cloud-computing" },
  { match: /(discrete math|combinatorics|graph theory)/i, slug: "discrete-mathematics" },
  { match: /(calculus|multivariable|differential calculus)/i, slug: "calculus" },
  { match: /(differential equation|complex variables|transforms)/i, slug: "differential-equations-and-transforms" },
  { match: /(linear algebra|matrix)/i, slug: "applied-linear-algebra" },
  { match: /(probability|statistics|random process)/i, slug: "probability-and-statistics" },
  { match: /(physics|electromagnet|quantum)/i, slug: "engineering-physics" },
  { match: /(chemistry|environmental|materials)/i, slug: "engineering-chemistry" },
  { match: /(digital logic|digital electronics|circuits)/i, slug: "digital-logic-design" },
];

/**
 * Resolves a course code and title to its exact study material URL on vhelpcc.com
 */
export function getStudyMaterialUrl(code = "", title = "") {
  const cleanCode = (code || "").trim().toUpperCase();
  const cleanTitle = (title || "").trim();

  // 1. Direct code lookup
  if (COURSE_CODE_MAP[cleanCode]) {
    return `${VHELPCC_STUDY_MATERIAL_BASE}/${COURSE_CODE_MAP[cleanCode]}`;
  }

  // 2. Check partial code matches (e.g. BCSE302L vs BCSE302)
  for (const [key, slug] of Object.entries(COURSE_CODE_MAP)) {
    if (cleanCode.startsWith(key) || key.startsWith(cleanCode)) {
      return `${VHELPCC_STUDY_MATERIAL_BASE}/${slug}`;
    }
  }

  // 3. Keyword-based matching on title
  if (cleanTitle) {
    for (const rule of KEYWORD_RULES) {
      if (rule.match.test(cleanTitle)) {
        return `${VHELPCC_STUDY_MATERIAL_BASE}/${rule.slug}`;
      }
    }
  }

  // 4. Keyword-based matching on code
  for (const rule of KEYWORD_RULES) {
    if (rule.match.test(cleanCode)) {
      return `${VHELPCC_STUDY_MATERIAL_BASE}/${rule.slug}`;
    }
  }

  // 5. Default subject search fallback
  return `${VHELPCC_STUDY_MATERIAL_BASE}`;
}
