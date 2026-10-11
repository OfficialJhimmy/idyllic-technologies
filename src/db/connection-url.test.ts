import { describe, expect, it } from "vitest";
import { serverlessConnectionUrl } from "@/db/connection-url";

const session = "postgresql://postgres.abc:secret@aws-0-eu-west-2.pooler.supabase.com:5432/postgres";

describe("serverlessConnectionUrl", () => {
  it("moves a Supabase session pooler address to the transaction pooler on Vercel", () => {
    expect(serverlessConnectionUrl(session, true)).toBe("postgresql://postgres.abc:secret@aws-0-eu-west-2.pooler.supabase.com:6543/postgres");
  });
  it("changes nothing off Vercel", () => {
    expect(serverlessConnectionUrl(session, false)).toBe(session);
  });
  it("leaves an address that is already right, or is not a Supabase pooler, alone", () => {
    const tx = session.replace(":5432", ":6543");
    expect(serverlessConnectionUrl(tx, true)).toBe(tx);
    const other = "postgresql://u:p@db.example.com:5432/app";
    expect(serverlessConnectionUrl(other, true)).toBe(other);
    expect(serverlessConnectionUrl("not a url", true)).toBe("not a url");
  });
});
