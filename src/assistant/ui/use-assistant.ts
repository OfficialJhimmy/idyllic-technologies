"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { assistantNextAction } from "@/assistant/actions";
import { initialState, type AssistantInput, type AssistantState, type Question, type QuestionOption, type Turn } from "@/assistant/engine/types";
import { STORAGE_KEY, greetingFor, parseStored, serialize } from "@/assistant/ui/conversation-storage";
import { track } from "@/lib/analytics";

/** One line of the conversation: something the visitor chose, or something the assistant said. */
export type Entry = { id: number; kind: "greeting"; text: string } | { id: number; kind: "user"; text: string } | { id: number; kind: "turn"; turn: Turn };

type NewEntry = { kind: "user"; text: string } | { kind: "turn"; turn: Turn };

type Failed = { input: AssistantInput; state: AssistantState };

const lastTurn = (entries: Entry[]): Turn | null => {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]!;
    if (e.kind === "turn") return e.turn;
  }
  return null;
};

const freshConversation = (opening: Turn): Entry[] => [
  { id: 0, kind: "greeting", text: greetingFor(new Date().getHours()) },
  { id: 1, kind: "turn", turn: opening },
];

/** The saved conversation if there is one (after a refresh), with the greeting renewed for the time of day now. */
function startingEntries(opening: Turn): Entry[] {
  if (typeof window === "undefined") return freshConversation(opening);
  try {
    const saved = parseStored(window.sessionStorage.getItem(STORAGE_KEY));
    if (saved) return saved.map((e) => (e.kind === "greeting" ? { ...e, text: greetingFor(new Date().getHours()) } : e)) as Entry[];
  } catch {
    // Storage can be blocked. Start fresh.
  }
  return freshConversation(opening);
}

/** Conversation state for the drawer. It only knows the Turn contract, never how the engine decides. */
export function useAssistant(opening: Turn) {
  // The drawer is not part of the server's page, so reading storage here cannot disagree with it.
  const [entries, setEntries] = useState<Entry[]>(() => startingEntries(opening));
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState<Failed | null>(null);
  const busy = useRef(false);
  const ids = useRef(Math.max(...entries.map((e) => e.id)) + 1);

  // Keep the conversation for a refresh. Only for this tab, and only what was said.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, serialize(entries));
    } catch {
      // Storage can be blocked. The conversation simply is not kept.
    }
  }, [entries]);

  const push = useCallback((entry: NewEntry) => setEntries((prev) => [...prev, { ...entry, id: ids.current++ }]), []);

  const run = useCallback(
    async (input: AssistantInput, state: AssistantState) => {
      if (busy.current) return;
      busy.current = true;
      setPending(true);
      setFailed(null);
      try {
        const result = await assistantNextAction(state, input);
        if (!result.ok) {
          setFailed({ input, state });
          return;
        }
        const { turn } = result;
        push({ kind: "turn", turn });
        if (turn.kind === "recommendation") track("assistant_recommendation", { product_count: turn.groups.reduce((n, g) => n + g.products.length, 0) });
        if (turn.kind === "comparison") track("assistant_comparison", { product_count: turn.products.length });
      } catch {
        setFailed({ input, state });
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    [push],
  );

  const stateNow = (): AssistantState => lastTurn(entries)?.state ?? initialState;

  return {
    entries,
    pending,
    failed,
    canGoBack: entries.some((e) => e.kind === "user"),
    choose(question: Question, option: QuestionOption) {
      if (busy.current) return;
      track("assistant_answer", { question_id: question.id, option_id: option.id });
      push({ kind: "user", text: option.label });
      void run({ type: "answer", questionId: question.id, optionId: option.id }, stateNow());
    },
    compare(productIds: string[]) {
      void run({ type: "compare", productIds }, stateNow());
    },
    talkToAPerson() {
      void run({ type: "handoff" }, stateNow());
    },
    retry() {
      if (failed) void run(failed.input, failed.state);
    },
    /** Goes back to the last question the visitor answered. Nothing is sent: the question turn already holds its state. */
    back() {
      if (busy.current) return;
      setFailed(null);
      setEntries((prev) => {
        const at = prev.map((e) => e.kind).lastIndexOf("user");
        return at < 0 ? prev : prev.slice(0, at);
      });
    },
    restart() {
      if (busy.current) return;
      setFailed(null);
      setEntries(freshConversation(opening).map((e) => ({ ...e, id: ids.current++ })) as Entry[]);
    },
  };
}

/** A short line for the screen reader live region: the newest thing the assistant said. */
export function announcementFor(entries: Entry[], pending: boolean, failed: boolean): string {
  if (failed) return "Something went wrong. You can try again.";
  if (pending) return "One moment";
  const turn = lastTurn(entries);
  if (!turn) return "";
  return turn.kind === "question" ? turn.question.prompt : turn.headline;
}
