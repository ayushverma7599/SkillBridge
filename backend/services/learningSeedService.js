// backend/services/learningSeedService.js
//
// First-boot seed data for the AI Learning Gap Detector: one CS subject
// ("Data Structures & Algorithms" — the most common freelance/interview
// skill gap for the campus student audience) with six concepts and a small
// question bank per concept. No-ops if content already exists.

const { Concept, Question } = require('../models');

const SUBJECT = 'Data Structures & Algorithms';

const CONCEPTS = [
  {
    name: 'Time Complexity (Big-O)',
    description: 'Reasoning about how an algorithm\'s running time grows with input size.',
    studyTip: 'Before you write code, write the Big-O of your approach on paper. Practice ranking O(1), O(log n), O(n), O(n log n), O(n^2) by hand.',
    questions: [
      {
        text: 'A loop that halves the search space each iteration (like binary search) runs in what time complexity?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctIndex: 1,
        explanation: 'Halving the input each step means the number of iterations is log₂(n) — that\'s the signature of binary search.',
      },
      {
        text: 'Two nested loops, each running n times independently, give what overall time complexity?',
        options: ['O(n)', 'O(2n)', 'O(n^2)', 'O(log n)'],
        correctIndex: 2,
        explanation: 'Nested loops multiply: n iterations of the outer loop × n of the inner loop = O(n²).',
      },
      {
        text: 'What is the time complexity of accessing an element in an array by index?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
        correctIndex: 2,
        explanation: 'Arrays support direct indexed memory access, so lookup by index is constant time regardless of size.',
      },
      {
        text: 'Which of these grows the fastest as n gets large?',
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'For large n, O(n²) overtakes O(n log n), which overtakes O(n), which overtakes O(log n).',
      },
    ],
  },
  {
    name: 'Arrays & Strings',
    description: 'Core operations, in-place manipulation, and common two-pointer / sliding-window patterns.',
    studyTip: 'Redo the two-pointer and sliding-window pattern from scratch without looking at a reference — that pattern covers most array/string interview questions.',
    questions: [
      {
        text: 'What is the time complexity of inserting an element at the beginning of an unsorted array of size n?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctIndex: 2,
        explanation: 'Every existing element has to shift right by one position, which touches all n elements.',
      },
      {
        text: 'The "two pointer" technique is most useful for problems on:',
        options: ['Unordered graphs', 'Sorted arrays', 'Hash maps only', 'Recursive trees'],
        correctIndex: 1,
        explanation: 'Two pointers exploit order — moving inward or forward makes sense once you can reason about relative position, which sorted arrays give you.',
      },
      {
        text: 'What does a "sliding window" technique primarily optimize for?',
        options: ['Finding a contiguous subarray/substring matching a condition without recomputation', 'Sorting an array in place', 'Reversing a string', 'Building a hash map'],
        correctIndex: 0,
        explanation: 'Sliding window reuses work from the previous window instead of recomputing a subarray/substring check from scratch each time.',
      },
      {
        text: 'In most languages, strings are:',
        options: ['Mutable, fixed-size arrays', 'Immutable sequences of characters', 'Always linked lists internally', 'Stored only as integers'],
        correctIndex: 1,
        explanation: 'In JS, Python, Java, etc. strings are immutable — every "modification" actually creates a new string.',
      },
    ],
  },
  {
    name: 'Linked Lists',
    description: 'Singly/doubly linked structures, pointer manipulation, and traversal tricks.',
    studyTip: 'Draw the nodes and arrows on paper before touching code. Most linked-list bugs come from losing track of a pointer mid-reassignment.',
    questions: [
      {
        text: 'What is the time complexity of accessing the k-th element in a singly linked list?',
        options: ['O(1)', 'O(log n)', 'O(k)', 'O(n^2)'],
        correctIndex: 2,
        explanation: 'You must traverse from the head one node at a time, so it takes k steps (worst case O(n)).',
      },
      {
        text: 'The "fast and slow pointer" technique is classically used to:',
        options: ['Sort a linked list', 'Detect a cycle in a linked list', 'Reverse a string', 'Balance a binary tree'],
        correctIndex: 1,
        explanation: 'If a fast pointer (2 steps) ever meets a slow pointer (1 step) again, the list has a cycle — this is Floyd\'s algorithm.',
      },
      {
        text: 'Compared to an array, a singly linked list\'s main advantage is:',
        options: ['O(1) random access', 'O(1) insertion/deletion once you have a reference to the node', 'Better cache locality', 'Lower memory overhead per element'],
        correctIndex: 1,
        explanation: 'Linked lists don\'t need to shift elements — insertion/removal next to a known node is O(1), unlike an array.',
      },
      {
        text: 'To reverse a singly linked list iteratively, you need to track:',
        options: ['Only the current node', 'Current and next node', 'Previous, current, and next node', 'The entire list in an array first'],
        correctIndex: 2,
        explanation: 'You rewire current.next to point at prev, so you need prev (to assign), current (to rewire), and next (saved before you overwrite current.next).',
      },
    ],
  },
  {
    name: 'Recursion',
    description: 'Base cases, recursive calls, and the call stack.',
    studyTip: 'For every recursive function you write, explicitly state the base case and what one recursive call assumes is already solved — write it as a comment first.',
    questions: [
      {
        text: 'Every correct recursive function must have:',
        options: ['A loop', 'A base case that stops the recursion', 'At least two recursive calls', 'A global variable'],
        correctIndex: 1,
        explanation: 'Without a base case (a condition that returns without recursing), the function recurses forever and overflows the call stack.',
      },
      {
        text: 'What data structure does the call stack use to manage recursive calls?',
        options: ['Queue (FIFO)', 'Stack (LIFO)', 'Hash map', 'Tree'],
        correctIndex: 1,
        explanation: 'Each call is pushed on entry and popped on return — last call in is the first to finish, which is exactly LIFO.',
      },
      {
        text: 'A recursive function that makes 2 recursive calls on a problem of size n-1 each time has what call-tree shape?',
        options: ['Linear', 'Logarithmic', 'Exponential (roughly O(2^n))', 'Constant'],
        correctIndex: 2,
        explanation: 'Branching into 2 calls per level for n levels produces 2^n total calls — this is why naive recursive Fibonacci is so slow.',
      },
      {
        text: 'Converting a recursive function to use "memoization" primarily helps by:',
        options: ['Reducing memory to zero', 'Caching results of subproblems already solved, avoiding recomputation', 'Removing the base case', 'Making the function iterative automatically'],
        correctIndex: 1,
        explanation: 'Memoization stores (caches) the result for a given input so overlapping subproblems are computed once instead of repeatedly.',
      },
    ],
  },
  {
    name: 'Sorting Algorithms',
    description: 'Comparison-based sorts, their complexities, and stability.',
    studyTip: 'Trace merge sort and quicksort by hand on a 6-element array. Being able to explain *why* quicksort is O(n²) worst-case but O(n log n) average is the key gap most people have.',
    questions: [
      {
        text: 'What is the average-case time complexity of quicksort?',
        options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
        correctIndex: 1,
        explanation: 'On average, quicksort\'s partitions are reasonably balanced, giving the same O(n log n) behavior as merge sort.',
      },
      {
        text: 'Merge sort\'s worst-case time complexity is:',
        options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(2^n)'],
        correctIndex: 0,
        explanation: 'Merge sort always splits in half and merges in linear time, regardless of input order — no worst case blowup.',
      },
      {
        text: 'A "stable" sort guarantees:',
        options: ['It runs in O(n log n) always', 'Equal elements keep their original relative order', 'It uses no extra memory', 'It never compares elements'],
        correctIndex: 1,
        explanation: 'Stability is about equal-key elements preserving input order after sorting — unrelated to speed or memory use.',
      },
      {
        text: 'Which sort has the worst average time complexity below?',
        options: ['Merge sort', 'Quicksort', 'Bubble sort', 'Heap sort'],
        correctIndex: 2,
        explanation: 'Bubble sort is O(n²) even on average, while the others average O(n log n).',
      },
    ],
  },
  {
    name: 'Trees & Graphs',
    description: 'Traversal strategies (DFS/BFS), binary trees, and basic graph representations.',
    studyTip: 'Practice writing BFS and DFS from memory on both a tree and a graph with a cycle — the visited-set handling is the part people usually get wrong on graphs.',
    questions: [
      {
        text: 'BFS (breadth-first search) uses which underlying data structure?',
        options: ['Stack', 'Queue', 'Heap', 'Linked list only'],
        correctIndex: 1,
        explanation: 'BFS processes nodes level by level, which a FIFO queue naturally gives you.',
      },
      {
        text: 'DFS (depth-first search) is most naturally implemented with:',
        options: ['A queue', 'Recursion (or an explicit stack)', 'A priority queue', 'A hash set only'],
        correctIndex: 1,
        explanation: 'DFS dives as deep as possible before backtracking — that\'s exactly what the call stack (or an explicit stack) does.',
      },
      {
        text: 'In a binary search tree, an in-order traversal visits nodes in:',
        options: ['Random order', 'Sorted (ascending) order', 'Reverse insertion order', 'Level order'],
        correctIndex: 1,
        explanation: 'In-order (left, node, right) on a BST always yields values in sorted ascending order — that\'s the defining property.',
      },
      {
        text: 'Why do graph traversals need a "visited" set that tree traversals usually don\'t?',
        options: ['Graphs are always bigger than trees', 'Graphs can contain cycles, so without tracking visited nodes you\'d loop forever', 'Trees don\'t have nodes', 'Graphs never have a root'],
        correctIndex: 1,
        explanation: 'A tree has no cycles by definition, so plain recursion always terminates. A graph can have cycles, which would cause infinite re-visits without a visited set.',
      },
    ],
  },
];

async function seedLearningContent() {
  const existing = await Concept.count();
  if (existing > 0) return;

  for (const c of CONCEPTS) {
    const concept = await Concept.create({
      subject: SUBJECT,
      name: c.name,
      description: c.description,
      studyTip: c.studyTip,
    });

    await Question.bulkCreate(
      c.questions.map((q) => ({
        conceptId: concept.id,
        subject: SUBJECT,
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        difficulty: 'medium',
      }))
    );
  }

  const totalQuestions = CONCEPTS.reduce((sum, c) => sum + c.questions.length, 0);
  console.log(`✅ Seeded ${CONCEPTS.length} concepts / ${totalQuestions} questions for "${SUBJECT}"`);
}

module.exports = { seedLearningContent, SUBJECT };
