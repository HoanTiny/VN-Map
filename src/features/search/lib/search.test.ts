import { describe, it, expect } from "vitest";
import { normalize } from "./search";

describe("normalize", () => {
  it("strips Vietnamese diacritics", () => {
    expect(normalize("Hà Nội")).toBe("ha noi");
    expect(normalize("Thành phố Hồ Chí Minh")).toBe("thanh pho ho chi minh");
    expect(normalize("Đà Lạt")).toBe("da lat");
  });

  it("lowercases output", () => {
    expect(normalize("CAFE")).toBe("cafe");
  });

  it("trims whitespace", () => {
    expect(normalize("  Hội An  ")).toBe("hoi an");
  });

  it("converts đ/Đ to d", () => {
    expect(normalize("đường")).toBe("duong");
    expect(normalize("Đông")).toBe("dong");
  });

  it("handles empty string", () => {
    expect(normalize("")).toBe("");
  });
});
