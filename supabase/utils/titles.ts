interface SearchOptions {
  exactMode: boolean; // true = exact bucket only, false = expanded (±1 level)
}

interface SearchResult {
  patterns: string[];
  matchedBuckets: string[];
  nonSeniorityTerms: string[];
}

export function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/[-\/,.()&]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const fillerWords = new Set([
  "of",
  "the",
  "and",
  "&",
  "in",
  "at",
  "for",
  "with",
  "to",
  "by",
  "on",
]);

export function removeFillerWords(text: string): string {
  return text
    .split(" ")
    .filter((word) => !fillerWords.has(word))
    .join(" ");
}

// Step 2: Remove filler words

export function searchJobTitles(
  query: string,
  options: SearchOptions
): SearchResult {
  // Seniority buckets with all variations
  const seniorityBuckets = [
    {
      name: "Entry / Junior",
      terms: [
        "intern",
        "int",
        "inter",
        "interrn",
        "intrn",
        "trainee",
        "trainie",
        "trainnee",
        "tranee",
        "junior",
        "jr",
        "jnr",
        "junr",
        "junio",
        "assistant",
        "asst",
        "assitant",
        "assistent",
        "coordinator",
        "coord",
        "coodinator",
        "cordinator",
        "coordnator",
        "associate",
        "assoc",
        "assosiate",
        "assciate",
        "analyst",
        "an",
        "analist",
        "analst",
      ],
    },
    {
      name: "Mid-Level",
      terms: [
        "senior",
        "sr",
        "senr",
        "senir",
        "specialist",
        "spec",
        "specalist",
        "specialst",
        "specialiest",
        "consultant",
        "cons",
        "consltant",
        "consultent",
        "consultnt",
        "lead",
        "ld",
        "leed",
        "lede",
        "officer",
        "off",
        "offcer",
        "oficer",
        "offcr",
      ],
    },
    {
      name: "Manager",
      terms: [
        "manager",
        "mgr",
        "mngr",
        "managr",
        "maneger",
        "manger",
        "senior manager",
        "sr manager",
        "sr mgr",
        "sr mngr",
        "senir manager",
        "supervisor",
        "supv",
        "superviser",
        "supervizer",
        "suprivisor",
        "program manager",
        "prog manager",
        "prog mgr",
        "progrm mgr",
        "project manager",
        "proj manager",
        "proj mgr",
        "pm",
        "project mngr",
        "project managr",
        "team lead",
        "tl",
        "team leed",
        "team lider",
        "unit manager",
        "unit mgr",
        "unit mngr",
        "group manager",
        "grp manager",
        "grp mgr",
        "group mngr",
        "head",
      ],
    },
    {
      name: "Director",
      terms: [
        "director",
        "dir",
        "directer",
        "dirctor",
        "direcctor",
        "senior director",
        "sr director",
        "sr dir",
        "senir director",
        "associate director",
        "assoc director",
        "assoc dir",
        "assciate director",
        "assosiate director",
        "assistant director",
        "asst director",
        "asst dir",
        "assitant director",
        "assistent director",
        "executive director",
        "exec director",
        "exec dir",
        "exective director",
        "exicutive director",
        "managing director",
        "md",
        "managing dir",
        "managin director",
        "maneging director",
        "deputy director",
        "dep director",
        "dep dir",
        "depty director",
        "deputi director",
        "regional director",
        "reg director",
        "reg dir",
        "regional directer",
        "regonal director",
      ],
    },
    {
      name: "VP / Executive",
      terms: [
        "vice president",
        "vp",
        "v p",
        "vce president",
        "vice pres",
        "vice presdent",
        "senior vice president",
        "svp",
        "sr vp",
        "senir vp",
        "senr vp",
        "executive vice president",
        "evp",
        "exec vp",
        "exective vp",
        "associate vice president",
        "avp",
        "assoc vp",
        "assciate vp",
        "assosiate vp",
        "assistant vice president",
        "asst vp",
        "assitant vp",
        "assistent vp",
        "group vice president",
        "grp vp",
        "gvp",
        "group vp",
        "group vce pres",
        "regional vice president",
        "reg vp",
        "rvp",
        "reginal vp",
        "regionl vp",
        "chief executive officer",
        "ceo",
        "cheif executive officer",
        "chief financial officer",
        "cfo",
        "cheif financial officer",
        "chief operating officer",
        "coo",
        "cheif operating officer",
        "chief marketing officer",
        "cmo",
        "cheif marketing officer",
        "chief technology officer",
        "cto",
        "cheif technology officer",
      ],
    },
  ];

  // Step 1: Normalize input

  // Step 3: Find seniority matches
  function findSeniorityMatches(normalizedText: string) {
    const matches: { bucketIndex: number; matchedTerms: string[] }[] = [];

    seniorityBuckets.forEach((bucket, index) => {
      const matchedTerms: string[] = [];

      bucket.terms.forEach((term) => {
        const pattern = new RegExp(
          `\\b${term.replace(/\s+/g, "\\s+")}\\b`,
          "i"
        );
        if (pattern.test(normalizedText)) {
          matchedTerms.push(term);
        }
      });

      if (matchedTerms.length > 0) {
        matches.push({ bucketIndex: index, matchedTerms });
      }
    });

    return matches;
  }

  // Step 4: Get expanded buckets (±1 level)
  function getExpandedBuckets(bucketIndex: number): number[] {
    const buckets = [bucketIndex];

    if (bucketIndex > 0) {
      buckets.push(bucketIndex - 1);
    }

    if (bucketIndex < seniorityBuckets.length - 1) {
      buckets.push(bucketIndex + 1);
    }

    return buckets.sort((a, b) => a - b);
  }

  // Step 5: Extract non-seniority terms
  function extractNonSeniorityTerms(
    normalizedText: string,
    seniorityMatches: { bucketIndex: number; matchedTerms: string[] }[]
  ): string[] {
    let remainingText = normalizedText;

    seniorityMatches.forEach((match) => {
      match.matchedTerms.forEach((term) => {
        const pattern = new RegExp(
          `\\b${term.replace(/\s+/g, "\\s+")}\\b`,
          "gi"
        );
        remainingText = remainingText.replace(pattern, " ");
      });
    });

    const remainingTerms = removeFillerWords(remainingText)
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((term) => term.length > 0);

    return remainingTerms;
  }

  // Step 6: Create regex patterns
  // Step 6: Create regex patterns (RE2-compatible)
  function createRegexPatterns(
    bucketIndices: number[],
    nonSeniorityTerms: string[]
  ): string[] {
    const patterns: string[] = [];

    const seniorityTerms: string[] = [];
    bucketIndices.forEach((index) => {
      seniorityTerms.push(...seniorityBuckets[index].terms);
    });

    if (nonSeniorityTerms.length > 0) {
      // Create patterns that match both seniority and functional terms
      // Using alternation instead of lookaheads for RE2 compatibility
      seniorityTerms.forEach((seniorityTerm) => {
        nonSeniorityTerms.forEach((nonSeniorityTerm) => {
          const seniorityPattern = seniorityTerm.replace(/\s+/g, "\\s+");
          const nonSeniorityPattern = nonSeniorityTerm.replace(/\s+/g, "\\s+");

          // Create a single pattern that matches either order using alternation
          patterns.push(
            `(\\b${seniorityPattern}\\b.*\\b${nonSeniorityPattern}\\b|\\b${nonSeniorityPattern}\\b.*\\b${seniorityPattern}\\b)`
          );
        });
      });
    } else {
      // OR logic: any seniority term matches
      seniorityTerms.forEach((term) => {
        const pattern = term.replace(/\s+/g, "\\s+");
        patterns.push(`\\b${pattern}\\b`);
      });
    }

    return patterns;
  }

  // Main execution
  const normalizedQuery = normalizeInput(query);
  const seniorityMatches = findSeniorityMatches(normalizedQuery);

  if (seniorityMatches.length === 0) {
    // No seniority terms found
    const cleanQuery = removeFillerWords(normalizedQuery);
    const terms = cleanQuery.split(" ").filter((term) => term.length > 0);

    return {
      patterns: terms.map((term) => `\\b${term.replace(/\s+/g, "\\s+")}\\b`),
      matchedBuckets: [],
      nonSeniorityTerms: terms,
    };
  }

  // Determine target buckets
  let targetBuckets: number[] = [];

  if (options.exactMode) {
    targetBuckets = seniorityMatches.map((match) => match.bucketIndex);
  } else {
    const expandedBuckets = new Set<number>();
    seniorityMatches.forEach((match) => {
      getExpandedBuckets(match.bucketIndex).forEach((bucket) => {
        expandedBuckets.add(bucket);
      });
    });
    targetBuckets = Array.from(expandedBuckets).sort((a, b) => a - b);
  }

  const nonSeniorityTerms = extractNonSeniorityTerms(
    normalizedQuery,
    seniorityMatches
  );
  const patterns = createRegexPatterns(targetBuckets, nonSeniorityTerms);
  const matchedBuckets = targetBuckets.map(
    (index) => seniorityBuckets[index].name
  );

  return {
    patterns,
    matchedBuckets,
    nonSeniorityTerms,
  };
}
