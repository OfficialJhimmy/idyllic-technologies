import { describe, expect, it } from "vitest";
import { canChangeStatus, enquiryStatuses, enquiryTypes, statusOnOpen } from "./status";

describe("enquiry status", () => {
  it("opening a new enquiry marks it read, and nothing else changes", () => {
    expect(statusOnOpen("new")).toBe("read");
    expect(statusOnOpen("read")).toBe("read");
    expect(statusOnOpen("replied")).toBe("replied");
    expect(statusOnOpen("closed")).toBe("closed");
  });
  it("allows any move to a different status, so mistakes and reopened conversations are easy to fix", () => {
    for (const from of enquiryStatuses) for (const to of enquiryStatuses) expect(canChangeStatus(from, to)).toBe(from !== to);
  });
  it("matches the database enums", () => {
    expect([...enquiryTypes]).toEqual(["contact", "quote", "assistant"]);
    expect([...enquiryStatuses]).toEqual(["new", "read", "replied", "closed"]);
  });
});
