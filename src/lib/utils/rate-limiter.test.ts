import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRateLimiter } from "./rate-limiter";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests up to the limit", () => {
    const check = createRateLimiter(3, 60_000);
    expect(check("user1").allowed).toBe(true);
    expect(check("user1").allowed).toBe(true);
    expect(check("user1").allowed).toBe(true);
    expect(check("user1").allowed).toBe(false);
  });

  it("tracks remaining count correctly", () => {
    const check = createRateLimiter(5, 60_000);
    expect(check("u").remaining).toBe(4);
    expect(check("u").remaining).toBe(3);
  });

  it("resets after the window expires", () => {
    const check = createRateLimiter(2, 60_000);
    check("u");
    check("u");
    expect(check("u").allowed).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(check("u").allowed).toBe(true);
  });

  it("isolates different keys", () => {
    const check = createRateLimiter(1, 60_000);
    check("a");
    expect(check("a").allowed).toBe(false);
    expect(check("b").allowed).toBe(true);
  });

  it("returns retryAfterSec when blocked", () => {
    const check = createRateLimiter(1, 60_000);
    check("u");
    const result = check("u");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSec).toBeGreaterThan(0);
    expect(result.retryAfterSec).toBeLessThanOrEqual(60);
  });
});
