import { describe, expect, it } from "vitest";
import { MAX_AGE_MS, greetingFor, parseStored, serialize } from "@/assistant/ui/conversation-storage";

const turn = { id: 1, kind: "turn", turn: { kind: "question", state: { answers: {} }, question: {} } };
const entries = [{ id: 0, kind: "greeting", text: "Hi" }, turn, { id: 2, kind: "user", text: "Home" }];

describe("greetingFor", () => {
  it("follows the visitor's clock", () => {
    expect(greetingFor(5)).toContain("morning");
    expect(greetingFor(11)).toContain("morning");
    expect(greetingFor(12)).toContain("afternoon");
    expect(greetingFor(16)).toContain("afternoon");
    expect(greetingFor(17)).toContain("evening");
    expect(greetingFor(23)).toContain("evening");
    expect(greetingFor(0)).toContain("morning");
  });
});

describe("saved conversation", () => {
  it("round trips", () => {
    expect(parseStored(serialize(entries as never))).toEqual(entries);
  });
  it("drops a conversation older than twelve hours", () => {
    const now = Date.now();
    expect(parseStored(serialize(entries as never, now - MAX_AGE_MS - 1), now)).toBeNull();
    expect(parseStored(serialize(entries as never, now - 1000), now)).not.toBeNull();
  });
  it("ignores anything that does not look right", () => {
    for (const bad of [null, "", "not json", "{}", JSON.stringify({ at: Date.now(), entries: [] }), JSON.stringify({ at: Date.now(), entries: [{ id: 1, kind: "turn", turn: { kind: "evil", state: {} } }] }), JSON.stringify({ at: Date.now(), entries: [{ id: "x", kind: "user", text: "a" }] }), JSON.stringify({ at: Date.now(), entries: [{ id: 1, kind: "user" }] })]) {
      expect(parseStored(bad)).toBeNull();
    }
  });
});
