import "server-only";
import { createDeterministicEngine, initialState, type Turn } from "@/assistant/engine";
import { databaseSource } from "@/assistant/source";

/** The one engine the site uses. Swapping it for another AssistantEngine is a change in this file only. */
export const engine = createDeterministicEngine(databaseSource);

/** The first question, rendered with the page so the drawer opens with no wait. It reads no data. */
export const getOpeningTurn = (): Promise<Turn> => engine.next(initialState, { type: "start" });
