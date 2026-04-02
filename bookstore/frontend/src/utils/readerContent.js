const MIN_SIMULATED_PAGES = 220;
const MAX_SIMULATED_PAGES = 280;
const DEFAULT_SIMULATED_PAGES = 240;

const fallbackTopic = {
  foundation: "software craftsmanship",
  audience: "working developers",
  concepts: [
    "clarity in implementation",
    "tradeoffs in design",
    "maintainable structure",
    "practical iteration",
    "debugging habits",
    "team-friendly code",
  ],
  outcomes: [
    "more reliable delivery",
    "clearer day-to-day decisions",
    "stronger review conversations",
    "better long-term maintenance",
    "less confusion across teams",
    "steadier feature work",
  ],
  examples: [
    "a small service boundary",
    "a carefully named method",
    "a review comment on readability",
    "a refactor that removes duplication",
    "a feature that grows over time",
    "a bug fixed with better structure",
  ],
};

const topicLibrary = [
  {
    match: ["clean code"],
    foundation: "clean software design",
    audience: "engineers trying to write code other people can understand",
    concepts: [
      "intention-revealing names",
      "small focused functions",
      "meaningful boundaries",
      "removing duplication",
      "useful comments versus noisy comments",
      "refactoring without changing behavior",
    ],
    outcomes: [
      "faster onboarding for teammates",
      "code reviews with fewer misunderstandings",
      "simpler debugging sessions",
      "safer long-term maintenance",
      "clearer business logic",
      "fewer accidental regressions",
    ],
    examples: [
      "renaming a method so its purpose is obvious",
      "splitting a long function into smaller steps",
      "extracting domain rules from controller code",
      "removing duplicate validation logic",
      "rewriting a comment into a better function name",
      "isolating side effects to make code easier to test",
    ],
  },
  {
    match: ["spring in action", "spring"],
    foundation: "building applications with Spring",
    audience: "developers learning how framework pieces fit together",
    concepts: [
      "dependency injection",
      "request handling",
      "service-layer composition",
      "configuration discipline",
      "data access flow",
      "security boundaries",
    ],
    outcomes: [
      "cleaner application structure",
      "easier feature assembly",
      "safer configuration changes",
      "predictable request lifecycles",
      "better separation of concerns",
      "simpler testing strategy",
    ],
    examples: [
      "wiring a service through constructor injection",
      "moving business logic out of a controller",
      "choosing the right configuration property",
      "organizing repository and service collaboration",
      "handling validation before persistence",
      "protecting an endpoint with clear security rules",
    ],
  },
  {
    match: ["effective java"],
    foundation: "writing robust Java applications",
    audience: "Java developers refining day-to-day engineering judgment",
    concepts: [
      "immutable objects",
      "careful API design",
      "generics done clearly",
      "exception discipline",
      "object construction choices",
      "collections and contracts",
    ],
    outcomes: [
      "fewer surprising bugs",
      "stronger API readability",
      "safer reuse of shared components",
      "better performance decisions",
      "cleaner library code",
      "more predictable behavior in production",
    ],
    examples: [
      "preferring a factory method over a complex constructor",
      "designing an immutable value object",
      "using interfaces as the public shape of an API",
      "writing equals and hashCode with care",
      "choosing checked or unchecked exceptions deliberately",
      "making generic types easier to understand at the call site",
    ],
  },
  {
    match: ["concurrency"],
    foundation: "safe concurrent programming in Java",
    audience: "developers dealing with threads, shared state, and coordination",
    concepts: [
      "shared mutable state",
      "thread confinement",
      "visibility and ordering",
      "coordination with executors",
      "locks and contention",
      "safe task design",
    ],
    outcomes: [
      "fewer race conditions",
      "clearer multithreaded reasoning",
      "safer background processing",
      "more stable throughput",
      "better diagnosis of timing bugs",
      "stronger production reliability",
    ],
    examples: [
      "moving mutable state behind a single owner",
      "choosing an executor for background work",
      "replacing ad hoc locking with clearer coordination",
      "making a cache safe for concurrent access",
      "isolating tasks so failure stays contained",
      "reviewing a flaky issue caused by timing assumptions",
    ],
  },
  {
    match: ["design patterns"],
    foundation: "reusable object-oriented design patterns",
    audience: "developers trying to recognize recurring design shapes",
    concepts: [
      "strategy and variation points",
      "composition over inheritance",
      "factories and creation control",
      "observers and event flow",
      "decorators for extension",
      "adapters for integration",
    ],
    outcomes: [
      "better pattern selection",
      "more flexible designs",
      "cleaner collaboration between classes",
      "less rigid inheritance hierarchies",
      "easier extension of behavior",
      "more confidence during refactoring",
    ],
    examples: [
      "swapping algorithms through a strategy interface",
      "wrapping behavior with a decorator",
      "isolating object creation behind a factory",
      "connecting UI updates through an observer pattern",
      "bridging incompatible interfaces with an adapter",
      "restructuring a growing module around clearer roles",
    ],
  },
  {
    match: ["refactoring"],
    foundation: "improving existing code without changing behavior",
    audience: "developers working inside live systems that already have history",
    concepts: [
      "small safe transformations",
      "tests as safety rails",
      "identifying code smells",
      "improving naming and structure",
      "reshaping dependencies",
      "reducing hidden complexity",
    ],
    outcomes: [
      "cleaner legacy modules",
      "safer ongoing feature work",
      "reduced technical friction",
      "better readability during change",
      "fewer risky rewrites",
      "more confidence in incremental improvement",
    ],
    examples: [
      "extracting a concept from duplicated logic",
      "moving behavior to the class that owns it",
      "replacing conditionals with clearer structure",
      "creating a seam before changing legacy code",
      "splitting a bulky method into named steps",
      "using tests to lock behavior before cleanup",
    ],
  },
];

const pacingNotes = [
  "The page closes by reinforcing one practical lesson before moving to the next idea.",
  "The discussion stays deliberate so the concept feels usable rather than abstract.",
  "Each example is kept concrete so the reader can imagine applying it at work.",
  "The explanation returns to the main principle before widening the scope again.",
  "A short reflection at the end of the page ties the topic back to real engineering work.",
  "The tone remains instructional and steady, letting one lesson build on the previous one.",
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function sentenceCase(value) {
  if (!value) {
    return "This section";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeTitle(title) {
  return String(title || "").trim().toLowerCase();
}

function getTopicProfile(book) {
  const normalizedTitle = normalizeTitle(book?.title);

  return (
    topicLibrary.find((entry) => entry.match.some((keyword) => normalizedTitle.includes(keyword))) ||
    fallbackTopic
  );
}

export function getSimulatedPageCount(book) {
  const sourceCount = Number(book?.fullPageCount || book?.pageCount || DEFAULT_SIMULATED_PAGES);
  return clamp(sourceCount, MIN_SIMULATED_PAGES, MAX_SIMULATED_PAGES);
}

export function buildSimulatedBookPages(book) {
  const totalPages = getSimulatedPageCount(book);
  const title = book?.title || "Untitled Book";
  const author = book?.author || "Unknown Author";
  const description = (book?.description || "A book about practical software development ideas.").trim();
  const topic = getTopicProfile(book);

  return Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1;
    const chapterNumber = Math.floor(index / 12) + 1;
    const concept = topic.concepts[index % topic.concepts.length];
    const outcome = topic.outcomes[index % topic.outcomes.length];
    const example = topic.examples[index % topic.examples.length];
    const pacing = pacingNotes[index % pacingNotes.length];

    const paragraphOne = `${title} by ${author} explores ${topic.foundation} through chapter ${chapterNumber}. Page ${pageNumber} focuses on ${concept}, explaining why this idea matters for ${topic.audience}. ${sentenceCase(description)}.`;
    const paragraphTwo = `The discussion turns practical by walking through ${example}. Instead of presenting the topic as a rule to memorize, the page explains how the decision affects readability, maintenance, and long-term behavior in a real codebase.`;
    const paragraphThree = `A recurring theme on this page is ${outcome}. ${pacing}`;

    return [paragraphOne, paragraphTwo, paragraphThree].join("\n\n");
  });
}
