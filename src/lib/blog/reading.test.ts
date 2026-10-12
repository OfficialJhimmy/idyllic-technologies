import { describe, expect, it } from "vitest";
import { countWords, minutesLeft, readingMinutes } from "@/lib/blog/reading";

describe("reading time", () => {
  it("counts the words in HTML, not the tags", () => {
    expect(countWords("<p>One <strong>two</strong> three</p><p>four&nbsp;five</p>")).toBe(5);
    expect(countWords("<script>var a = 1 2 3</script><p>hello</p>")).toBe(1);
    expect(countWords("")).toBe(0);
  });
  it("rounds up to whole minutes, with a minimum of one", () => {
    const words = (n: number) => `<p>${Array.from({ length: n }, () => "word").join(" ")}</p>`;
    expect(readingMinutes(words(10))).toBe(1);
    expect(readingMinutes(words(200))).toBe(1);
    expect(readingMinutes(words(201))).toBe(2);
    expect(readingMinutes(words(1000))).toBe(5);
    expect(readingMinutes("")).toBe(1);
  });
  it("works out the minutes left", () => {
    expect(minutesLeft(10, 0)).toBe(10);
    expect(minutesLeft(10, 50)).toBe(5);
    expect(minutesLeft(10, 100)).toBe(0);
    expect(minutesLeft(10, 140)).toBe(0);
    expect(minutesLeft(10, -5)).toBe(10);
  });
});
