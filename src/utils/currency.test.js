import { formatRupees } from "./currency";

describe("formatRupees", () => {
  it("formats finite amounts with Indian locale separators", () => {
    expect(formatRupees(125000)).toBe("Rs 1,25,000");
  });

  it("returns Rs 0 for invalid values", () => {
    expect(formatRupees("not-a-number")).toBe("Rs 0");
  });
});
