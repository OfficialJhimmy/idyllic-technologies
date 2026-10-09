"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** Reports a search once per results page. Only the length of the words is sent, never the words. */
export function TrackSearch({ queryLength, resultCount }: { queryLength: number; resultCount: number }) {
  useEffect(() => {
    track("search", { query_length: queryLength, result_count: resultCount });
  }, [queryLength, resultCount]);
  return null;
}
