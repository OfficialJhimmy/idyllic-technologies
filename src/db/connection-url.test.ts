import { describe, expect, it } from "vitest";
import { serverlessConnectionUrl } from "@/db/connection-url";

const session = "postgresql://postgres.abc:secret@aws-0-eu-west-2.pooler.supabase.com:5432/postgres";
const transaction = session.replace(":5432", ":6543");

describe("serverlessConnectionUrl", () => {
  it("moves a Supabase transaction pooler address to the session pooler on Vercel", () => {
    expect(serverlessConnectionUrl(transaction, true)).toBe(session);
  });
  it("leaves the session pooler address alone", () => {
    expect(serverlessConnectionUrl(session, true)).toBe(session);
  });
  it("changes nothing off Vercel", () => {
    expect(serverlessConnectionUrl(transaction, false)).toBe(transaction);
  });
  it("leaves an address that is not a Supabase pooler, or not a URL, alone", () => {
    const other = "postgresql://u:p@db.example.com:6543/app";
    expect(serverlessConnectionUrl(other, true)).toBe(other);
    expect(serverlessConnectionUrl("not a url", true)).toBe("not a url");
  });
});
