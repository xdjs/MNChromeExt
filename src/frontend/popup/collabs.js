// Fast hardcoded pattern matching for collaboration detection
export function hasCollaborationKeywords(title) {
    const patterns = [
      /\bft\.?\s/i,                    // "ft. " or "ft "
      /\bfeat\.?\s/i,                  // "feat. " or "feat "  
      /\bfeaturing\b/i,                // "featuring"
      /\bwith\b/i,                     // "with"
      /\sx\s/i,                        // " x " (Artist x Artist)
      /\s&\s/,                         // " & "
      /\s\+\s/,                        // " + "
      /\bvs\.?\b/i,                    // "vs" or "vs."
      /\b(collab|collaboration)\b/i,   // "collab", "collaboration"
      /\bremix by\b/i,                 // "remix by"
      /\bprod\.? by\b/i               // "prod by", "produced by"
    ];
    
    return patterns.some(pattern => pattern.test(title));
  }
  
  export function shouldCheckForCollaborations(title) {
    // Quick check before doing full multi-artist extraction
    return hasCollaborationKeywords(title);
  } 