## 2024-05-23 - Excessive Promise.all on Synchronous Code
**Learning:** The codebase frequently uses `await Promise.all(array.map(async ...))` even when the callback function contains only synchronous code. This adds unnecessary overhead (microtask scheduling, array allocation) without any concurrency benefit.
**Action:** When identifying performance wins, check loops. Replace these `Promise.all` patterns with simple `for...of` loops to reduce overhead and improve readability.
