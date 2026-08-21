/**
 * Centralized DSA Topic Taxonomy & Mapping Specification for getPlaced
 * 
 * Provides canonical categories, topics, LeetCode tag slug mappings,
 * baseline required proficiency levels, and explainability metadata.
 */

export const DSA_CATEGORIES = [
  {
    id: "core",
    name: "Core",
    description: "Fundamental data structures and array manipulation patterns required across all coding interviews.",
  },
  {
    id: "searching",
    name: "Searching",
    description: "Logarithmic space partition, binary search variations, and search on answer domains.",
  },
  {
    id: "linked-structures",
    name: "Linked Structures",
    description: "Node-based sequential memory structures, stacks, queues, and priority heaps.",
  },
  {
    id: "trees",
    name: "Trees",
    description: "Hierarchical non-linear structures, binary trees, binary search trees, and tries.",
  },
  {
    id: "graphs",
    name: "Graphs",
    description: "Vertex and edge networks, traversals (BFS/DFS), shortest paths, connectivity, and DAG ordering.",
  },
  {
    id: "algorithms",
    name: "Algorithms",
    description: "Classical algorithmic paradigms including sorting, recursion, backtracking, and greedy strategies.",
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    description: "Optimal substructure, overlapping subproblems, memoization, and state-space transitions.",
  },
  {
    id: "advanced",
    name: "Advanced",
    description: "Specialized structures and techniques including monotonic stacks, bit manipulation, and segment trees.",
  },
];

export const DSA_TOPICS = [
  // ---------------------------------------------------------------------------
  // 1. Core
  // ---------------------------------------------------------------------------
  {
    id: "arrays",
    name: "Arrays",
    category: "Core",
    categoryId: "core",
    leetcodeSlugs: ["array"],
    defaultRequiredLevel: 8.5,
    description: "Linear arrays, in-place manipulation, subarrays, frequency counters, and prefix manipulation.",
    recommendedPatterns: ["Kadane's Algorithm", "Two-Sum Variations", "Rotate Array", "Product of Array Except Self"],
    importance: "Required",
  },
  {
    id: "strings",
    name: "Strings",
    category: "Core",
    categoryId: "core",
    leetcodeSlugs: ["string", "string-matching"],
    defaultRequiredLevel: 8.0,
    description: "String parsing, anagram verification, palindrome manipulation, and string matching.",
    recommendedPatterns: ["Valid Anagram", "Longest Common Prefix", "Group Anagrams", "String Compression"],
    importance: "Required",
  },
  {
    id: "hash-table",
    name: "Hash Table",
    category: "Core",
    categoryId: "core",
    leetcodeSlugs: ["hash-table", "hash-function", "rolling-hash"],
    defaultRequiredLevel: 8.5,
    description: "O(1) average lookup dictionaries, hash sets, collision resolution, and frequency maps.",
    recommendedPatterns: ["Two Sum", "Subarray Sum Equals K", "Longest Consecutive Sequence", "Ransom Note"],
    importance: "Required",
  },
  {
    id: "two-pointers",
    name: "Two Pointers",
    category: "Core",
    categoryId: "core",
    leetcodeSlugs: ["two-pointers"],
    defaultRequiredLevel: 8.5,
    description: "Opposite-direction, same-direction, and fast/slow pointer traversals for O(N) optimizations.",
    recommendedPatterns: ["3Sum", "Container With Most Water", "Trapping Rain Water", "Move Zeroes"],
    importance: "Required",
  },
  {
    id: "sliding-window",
    name: "Sliding Window",
    category: "Core",
    categoryId: "core",
    leetcodeSlugs: ["sliding-window"],
    defaultRequiredLevel: 8.5,
    description: "Fixed and dynamic contiguous subarray/substring search with running aggregate optimizations.",
    recommendedPatterns: ["Longest Substring Without Repeating Characters", "Minimum Window Substring", "Sliding Window Maximum"],
    importance: "Required",
  },
  {
    id: "prefix-sum",
    name: "Prefix Sum",
    category: "Core",
    categoryId: "core",
    leetcodeSlugs: ["prefix-sum"],
    defaultRequiredLevel: 8.0,
    description: "Cumulative sum arrays, range sum queries, difference arrays, and 2D prefix grids.",
    recommendedPatterns: ["Range Sum Query Immutable", "Subarray Sums Divisible by K", "Find Pivot Index"],
    importance: "Required",
  },

  // ---------------------------------------------------------------------------
  // 2. Searching
  // ---------------------------------------------------------------------------
  {
    id: "binary-search",
    name: "Binary Search",
    category: "Searching",
    categoryId: "searching",
    leetcodeSlugs: ["binary-search", "search"],
    defaultRequiredLevel: 8.5,
    description: "Logarithmic search in sorted sequences, rotated arrays, and monotonic predicate answer spaces.",
    recommendedPatterns: ["Search in Rotated Sorted Array", "Find Peak Element", "Koko Eating Bananas", "Capacity To Ship Packages"],
    importance: "Required",
  },

  // ---------------------------------------------------------------------------
  // 3. Linked Structures
  // ---------------------------------------------------------------------------
  {
    id: "linked-list",
    name: "Linked List",
    category: "Linked Structures",
    categoryId: "linked-structures",
    leetcodeSlugs: ["linked-list", "doubly-linked-list"],
    defaultRequiredLevel: 8.0,
    description: "Singly and doubly linked nodes, in-place reversal, cycle detection (Floyd's), and merge operations.",
    recommendedPatterns: ["Reverse Linked List", "Linked List Cycle II", "Merge K Sorted Lists", "LRU Cache (Doubly Linked)"],
    importance: "Required",
  },
  {
    id: "stack",
    name: "Stack",
    category: "Linked Structures",
    categoryId: "linked-structures",
    leetcodeSlugs: ["stack"],
    defaultRequiredLevel: 8.0,
    description: "LIFO data structure, valid parentheses validation, expression evaluation, and call-stack simulations.",
    recommendedPatterns: ["Valid Parentheses", "Evaluate Reverse Polish Notation", "Min Stack", "Simplify Path"],
    importance: "Required",
  },
  {
    id: "queue",
    name: "Queue",
    category: "Linked Structures",
    categoryId: "linked-structures",
    leetcodeSlugs: ["queue", "deque"],
    defaultRequiredLevel: 7.5,
    description: "FIFO sequential buffers, circular queues, double-ended deques, and stream processing.",
    recommendedPatterns: ["Implement Queue using Stacks", "Design Circular Queue", "Recent Calls Counter"],
    importance: "Required",
  },
  {
    id: "heap-priority-queue",
    name: "Heap / Priority Queue",
    category: "Linked Structures",
    categoryId: "linked-structures",
    leetcodeSlugs: ["heap-priority-queue", "heap", "priority-queue"],
    defaultRequiredLevel: 8.0,
    description: "Binary min/max heaps, top-K frequent elements, running median maintenance, and greedy scheduling.",
    recommendedPatterns: ["Kth Largest Element in an Array", "Find Median from Data Stream", "Top K Frequent Elements", "Task Scheduler"],
    importance: "Required",
  },

  // ---------------------------------------------------------------------------
  // 4. Trees
  // ---------------------------------------------------------------------------
  {
    id: "binary-tree",
    name: "Binary Tree",
    category: "Trees",
    categoryId: "trees",
    leetcodeSlugs: ["binary-tree", "tree"],
    defaultRequiredLevel: 8.5,
    description: "Hierarchical parent-child node structures, depth calculations, symmetry checks, and path sums.",
    recommendedPatterns: ["Maximum Depth of Binary Tree", "Invert Binary Tree", "Binary Tree Maximum Path Sum", "Serialize and Deserialize Binary Tree"],
    importance: "Required",
  },
  {
    id: "binary-search-tree",
    name: "Binary Search Tree",
    category: "Trees",
    categoryId: "trees",
    leetcodeSlugs: ["binary-search-tree", "bst"],
    defaultRequiredLevel: 8.0,
    description: "Ordered binary search trees, BST invariant validation, insertion, deletion, and LCA queries.",
    recommendedPatterns: ["Validate Binary Search Tree", "Lowest Common Ancestor in BST", "Kth Smallest Element in BST"],
    importance: "Required",
  },
  {
    id: "tree-traversal",
    name: "Tree Traversal",
    category: "Trees",
    categoryId: "trees",
    leetcodeSlugs: ["tree-traversal", "eulerian-circuit"],
    defaultRequiredLevel: 8.0,
    description: "Preorder, Inorder, Postorder (DFS) and Level-order / Zig-zag (BFS) tree traversals.",
    recommendedPatterns: ["Binary Tree Level Order Traversal", "Binary Tree Zigzag Level Order Traversal", "Construct Binary Tree from Preorder and Inorder"],
    importance: "Required",
  },
  {
    id: "trie",
    name: "Trie",
    category: "Trees",
    categoryId: "trees",
    leetcodeSlugs: ["trie"],
    defaultRequiredLevel: 7.5,
    description: "Prefix trees for fast retrieval, dictionary lookup, autocomplete, and bitwise prefix matching.",
    recommendedPatterns: ["Implement Trie (Prefix Tree)", "Design Add and Search Words Data Structure", "Word Search II"],
    importance: "Preferred",
  },

  // ---------------------------------------------------------------------------
  // 5. Graphs
  // ---------------------------------------------------------------------------
  {
    id: "graph-traversal",
    name: "Graph Traversal",
    category: "Graphs",
    categoryId: "graphs",
    leetcodeSlugs: ["graph", "graph-traversal"],
    defaultRequiredLevel: 8.5,
    description: "Adjacency matrix/list representation, connected components, cycle detection, and bipartite verification.",
    recommendedPatterns: ["Clone Graph", "Number of Islands", "Is Graph Bipartite?", "Reconstruct Itinerary"],
    importance: "Required",
  },
  {
    id: "bfs",
    name: "Breadth-First Search (BFS)",
    category: "Graphs",
    categoryId: "graphs",
    leetcodeSlugs: ["breadth-first-search", "bfs"],
    defaultRequiredLevel: 8.5,
    description: "Queue-driven layer-by-layer exploration for finding unweighted shortest paths and multi-source spreads.",
    recommendedPatterns: ["Word Ladder", "Rotting Oranges", "01 Matrix", "Shortest Path in Binary Matrix"],
    importance: "Required",
  },
  {
    id: "dfs",
    name: "Depth-First Search (DFS)",
    category: "Graphs",
    categoryId: "graphs",
    leetcodeSlugs: ["depth-first-search", "dfs"],
    defaultRequiredLevel: 8.5,
    description: "Recursive depth exploration, connected component flood fill, cycle discovery, and path backtracking.",
    recommendedPatterns: ["Surrounded Regions", "Pacific Atlantic Water Flow", "Course Schedule", "Word Search"],
    importance: "Required",
  },
  {
    id: "shortest-path",
    name: "Shortest Path",
    category: "Graphs",
    categoryId: "graphs",
    leetcodeSlugs: ["shortest-path", "dijkstra"],
    defaultRequiredLevel: 8.0,
    description: "Dijkstra's algorithm, Bellman-Ford, and shortest paths in weighted non-negative/negative graphs.",
    recommendedPatterns: ["Network Delay Time", "Cheapest Flights Within K Stops", "Path with Minimum Effort"],
    importance: "Required",
  },
  {
    id: "union-find",
    name: "Union Find (Disjoint Set)",
    category: "Graphs",
    categoryId: "graphs",
    leetcodeSlugs: ["union-find", "disjoint-set"],
    defaultRequiredLevel: 8.0,
    description: "Disjoint set union data structure with path compression and rank optimization for dynamic connectivity.",
    recommendedPatterns: ["Number of Provinces", "Redundant Connection", "Accounts Merge", "Graph Valid Tree"],
    importance: "Required",
  },
  {
    id: "minimum-spanning-tree",
    name: "Minimum Spanning Tree",
    category: "Graphs",
    categoryId: "graphs",
    leetcodeSlugs: ["minimum-spanning-tree", "mst"],
    defaultRequiredLevel: 7.5,
    description: "Kruskal and Prim algorithms for connecting all graph vertices with minimal cumulative edge weight.",
    recommendedPatterns: ["Min Cost to Connect All Points", "Connecting Cities With Minimum Cost"],
    importance: "Preferred",
  },
  {
    id: "topological-sort",
    name: "Topological Sort",
    category: "Graphs",
    categoryId: "graphs",
    leetcodeSlugs: ["topological-sort"],
    defaultRequiredLevel: 8.0,
    description: "Linear ordering of vertices in Directed Acyclic Graphs (DAGs) using Kahn's algorithm (indegree) and DFS post-order.",
    recommendedPatterns: ["Course Schedule II", "Alien Dictionary", "Sequence Reconstruction"],
    importance: "Required",
  },

  // ---------------------------------------------------------------------------
  // 6. Algorithms
  // ---------------------------------------------------------------------------
  {
    id: "sorting",
    name: "Sorting",
    category: "Algorithms",
    categoryId: "algorithms",
    leetcodeSlugs: ["sorting", "quickselect", "merge-sort", "bucket-sort", "radix-sort", "counting-sort"],
    defaultRequiredLevel: 8.0,
    description: "QuickSort, MergeSort, Custom Comparators, and Quickselect for order statistics.",
    recommendedPatterns: ["Sort Colors", "Merge Intervals (Sorting)", "Kth Largest Element (Quickselect)", "Top K Frequent Words"],
    importance: "Required",
  },
  {
    id: "recursion",
    name: "Recursion",
    category: "Algorithms",
    categoryId: "algorithms",
    leetcodeSlugs: ["recursion"],
    defaultRequiredLevel: 8.0,
    description: "Inductive base cases, recursive subproblem state generation, and divide-and-conquer formulations.",
    recommendedPatterns: ["Pow(x, n)", "Reverse String Recursively", "Tower of Hanoi"],
    importance: "Required",
  },
  {
    id: "backtracking",
    name: "Backtracking",
    category: "Algorithms",
    categoryId: "algorithms",
    leetcodeSlugs: ["backtracking"],
    defaultRequiredLevel: 8.0,
    description: "State-space tree search, pruning invalid branches, permutations, subsets, and combinatorics.",
    recommendedPatterns: ["Subsets", "Permutations", "Combination Sum", "N-Queens", "Sudoku Solver"],
    importance: "Required",
  },
  {
    id: "greedy",
    name: "Greedy",
    category: "Algorithms",
    categoryId: "algorithms",
    leetcodeSlugs: ["greedy"],
    defaultRequiredLevel: 8.0,
    description: "Locally optimal choice heuristics, activity selection, gas station loops, and jump games.",
    recommendedPatterns: ["Jump Game II", "Gas Station", "Hand of Straights", "Partition Labels"],
    importance: "Required",
  },
  {
    id: "divide-and-conquer",
    name: "Divide and Conquer",
    category: "Algorithms",
    categoryId: "algorithms",
    leetcodeSlugs: ["divide-and-conquer"],
    defaultRequiredLevel: 7.5,
    description: "Partitioning complex problems into independent subproblems and recombining results.",
    recommendedPatterns: ["Merge k Sorted Lists", "Construct Quad Tree", "Majority Element"],
    importance: "Preferred",
  },

  // ---------------------------------------------------------------------------
  // 7. Dynamic Programming
  // ---------------------------------------------------------------------------
  {
    id: "1d-dp",
    name: "1D Dynamic Programming",
    category: "Dynamic Programming",
    categoryId: "dynamic-programming",
    leetcodeSlugs: ["dynamic-programming", "memoization"],
    defaultRequiredLevel: 8.5,
    description: "1-dimensional state transitions, optimal substructure, memoization tables, and bottom-up tabulation.",
    recommendedPatterns: ["Climbing Stairs", "House Robber II", "Coin Change", "Word Break", "Decode Ways"],
    importance: "Required",
  },
  {
    id: "2d-dp",
    name: "2D Dynamic Programming",
    category: "Dynamic Programming",
    categoryId: "dynamic-programming",
    leetcodeSlugs: ["2d-dynamic-programming", "matrix-dp"],
    defaultRequiredLevel: 8.5,
    description: "Two-parameter state matrices, grid path optimization, and multi-variable transition formulas.",
    recommendedPatterns: ["Unique Paths II", "Longest Common Subsequence", "Edit Distance", "Interleaving String"],
    importance: "Required",
  },
  {
    id: "knapsack",
    name: "Knapsack Problems",
    category: "Dynamic Programming",
    categoryId: "dynamic-programming",
    leetcodeSlugs: ["knapsack"],
    defaultRequiredLevel: 8.0,
    description: "0/1 Knapsack, Unbounded Knapsack, Partition Equal Subset Sum, and Target Sum transformations.",
    recommendedPatterns: ["Partition Equal Subset Sum", "Target Sum", "Coin Change II", "Ones and Zeroes"],
    importance: "Required",
  },
  {
    id: "subsequence-dp",
    name: "Subsequence DP",
    category: "Dynamic Programming",
    categoryId: "dynamic-programming",
    leetcodeSlugs: ["subsequence-dp", "longest-common-subsequence", "longest-increasing-subsequence"],
    defaultRequiredLevel: 8.5,
    description: "Longest Increasing Subsequence (LIS), Longest Common Subsequence (LCS), and Palindromic Substrings.",
    recommendedPatterns: ["Longest Increasing Subsequence", "Longest Common Subsequence", "Distinct Subsequences", "Longest Palindromic Substring"],
    importance: "Required",
  },
  {
    id: "grid-dp",
    name: "Grid DP",
    category: "Dynamic Programming",
    categoryId: "dynamic-programming",
    leetcodeSlugs: ["grid-dp", "matrix"],
    defaultRequiredLevel: 8.0,
    description: "2D matrix pathfinding, obstacle avoidance, maximal rectangle areas, and dungeon games.",
    recommendedPatterns: ["Minimum Path Sum", "Maximal Square", "Dungeon Game", "Cherry Pickup"],
    importance: "Required",
  },

  // ---------------------------------------------------------------------------
  // 8. Advanced
  // ---------------------------------------------------------------------------
  {
    id: "bit-manipulation",
    name: "Bit Manipulation",
    category: "Advanced",
    categoryId: "advanced",
    leetcodeSlugs: ["bit-manipulation", "bitmask"],
    defaultRequiredLevel: 7.5,
    description: "Bitwise operators, bitmasks, Brian Kernighan algorithm, two's complement, and XOR properties.",
    recommendedPatterns: ["Single Number", "Number of 1 Bits", "Counting Bits", "Sum of Two Integers", "Subsets (Bitmask)"],
    importance: "Preferred",
  },
  {
    id: "intervals",
    name: "Intervals",
    category: "Advanced",
    categoryId: "advanced",
    leetcodeSlugs: ["intervals", "line-sweep"],
    defaultRequiredLevel: 8.0,
    description: "Interval sorting, range merging, meeting room allocations, and sweep-line algorithms.",
    recommendedPatterns: ["Merge Intervals", "Insert Interval", "Non-overlapping Intervals", "Meeting Rooms II"],
    importance: "Required",
  },
  {
    id: "monotonic-stack",
    name: "Monotonic Stack",
    category: "Advanced",
    categoryId: "advanced",
    leetcodeSlugs: ["monotonic-stack", "monotonic-queue"],
    defaultRequiredLevel: 8.0,
    description: "Monotonically increasing/decreasing stacks for next greater element and histogram max areas in O(N).",
    recommendedPatterns: ["Daily Temperatures", "Next Greater Element I", "Largest Rectangle in Histogram", "Online Stock Span"],
    importance: "Required",
  },
  {
    id: "segment-tree",
    name: "Segment Tree",
    category: "Advanced",
    categoryId: "advanced",
    leetcodeSlugs: ["segment-tree"],
    defaultRequiredLevel: 7.0,
    description: "Binary tree for range queries (min/max/sum) and point/range updates in O(log N) time.",
    recommendedPatterns: ["Range Sum Query - Mutable", "Count of Smaller Numbers After Self"],
    importance: "Preferred",
  },
  {
    id: "fenwick-tree",
    name: "Fenwick Tree (Binary Indexed Tree)",
    category: "Advanced",
    categoryId: "advanced",
    leetcodeSlugs: ["fenwick-tree", "binary-indexed-tree"],
    defaultRequiredLevel: 7.0,
    description: "Compact binary indexed tree for efficient prefix sums and point updates with minimal space overhead.",
    recommendedPatterns: ["Range Sum Query - Mutable", "Reverse Pairs"],
    importance: "Preferred",
  },
  {
    id: "advanced-graph-algorithms",
    name: "Advanced Graph Algorithms",
    category: "Advanced",
    categoryId: "advanced",
    leetcodeSlugs: [
      "strongly-connected-component",
      "biconnected-component",
      "maximum-flow",
      "minimum-cost-flow",
      "eulerian-circuit",
      "graph-coloring",
    ],
    defaultRequiredLevel: 7.0,
    description: "Tarjan's strongly connected components, bridge/articulation points, network flow, and Eulerian paths.",
    recommendedPatterns: ["Critical Connections in a Network (Bridges)", "Reconstruct Itinerary (Eulerian Path)"],
    importance: "Preferred",
  },
];

/**
 * Direct lookup map from canonical topic id -> topic definition
 */
export const TOPIC_BY_ID_MAP = new Map(DSA_TOPICS.map((t) => [t.id, t]));

/**
 * Inverted index map from LeetCode tag slug -> Array of canonical topic definitions
 */
export const LEETCODE_SLUG_TO_TOPICS_MAP = new Map();

for (const topic of DSA_TOPICS) {
  for (const slug of topic.leetcodeSlugs) {
    const cleanSlug = slug.toLowerCase().trim();
    if (!LEETCODE_SLUG_TO_TOPICS_MAP.has(cleanSlug)) {
      LEETCODE_SLUG_TO_TOPICS_MAP.set(cleanSlug, []);
    }
    LEETCODE_SLUG_TO_TOPICS_MAP.get(cleanSlug).push(topic);
  }
}

/**
 * Extended LeetCode tag aliases and keyword heuristics mapping
 */
const EXTENDED_ALIASES = {
  "depth-first-search": ["dfs"],
  "breadth-first-search": ["bfs"],
  "binary-tree": ["binary-tree", "tree-traversal"],
  "binary-search-tree": ["binary-search-tree"],
  "dynamic-programming": ["1d-dp", "2d-dp"],
  "heap-priority-queue": ["heap-priority-queue"],
  "two-pointers": ["two-pointers"],
  "sliding-window": ["sliding-window"],
  "hash-table": ["hash-table"],
  "linked-list": ["linked-list"],
  "binary-search": ["binary-search"],
  "bit-manipulation": ["bit-manipulation"],
  "monotonic-stack": ["monotonic-stack"],
  "union-find": ["union-find"],
  "topological-sort": ["topological-sort"],
  "shortest-path": ["shortest-path"],
  "segment-tree": ["segment-tree"],
  "binary-indexed-tree": ["fenwick-tree"],
};

/**
 * Resolves a LeetCode tag slug or name to one or more canonical topic IDs.
 *
 * @param {string} rawTag - LeetCode tag name or slug
 * @returns {Array<Object>} List of matched canonical topic definitions
 */
export const mapLeetCodeTagToTopics = (rawTag) => {
  if (!rawTag || typeof rawTag !== "string") return [];

  const slug = rawTag.toLowerCase().trim().replace(/[^a-z0-9\-]+/g, "-");

  // Direct slug lookup
  if (LEETCODE_SLUG_TO_TOPICS_MAP.has(slug)) {
    return LEETCODE_SLUG_TO_TOPICS_MAP.get(slug);
  }

  // Alias lookup
  if (EXTENDED_ALIASES[slug]) {
    const topicIds = EXTENDED_ALIASES[slug];
    return topicIds.map((id) => TOPIC_BY_ID_MAP.get(id)).filter(Boolean);
  }

  // Substring match heuristic
  const matches = [];
  for (const topic of DSA_TOPICS) {
    if (
      topic.leetcodeSlugs.some((s) => slug.includes(s) || s.includes(slug)) ||
      slug.includes(topic.id) ||
      topic.id.includes(slug)
    ) {
      matches.push(topic);
    }
  }

  return matches;
};
