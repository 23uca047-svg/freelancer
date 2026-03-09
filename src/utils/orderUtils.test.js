import {
  calculateDeliveryDate,
  calculateServiceFee,
  formatDate,
  getOrderProgress,
  getStatusInfo,
  getStatusTimeline,
  validateOrderData,
} from "./orderUtils";

describe("orderUtils", () => {
  it("returns mapped status details", () => {
    expect(getStatusInfo("in-progress")).toMatchObject({
      label: "In Progress",
      color: "#ffd93d",
    });
  });

  it("falls back to pending status details for unknown statuses", () => {
    expect(getStatusInfo("unknown").label).toBe("Pending");
  });

  it("calculates delivery date from JS Date source", () => {
    const result = calculateDeliveryDate(new Date("2026-01-01T00:00:00.000Z"), 3);
    expect(result.toISOString()).toContain("2026-01-04");
  });

  it("supports Firestore-like timestamps", () => {
    const stamp = { toDate: () => new Date("2026-01-01T00:00:00.000Z") };
    const result = calculateDeliveryDate(stamp, 2);
    expect(result.toISOString()).toContain("2026-01-03");
  });

  it("returns order progress weight", () => {
    expect(getOrderProgress("pending")).toBe(25);
    expect(getOrderProgress("completed")).toBe(100);
  });

  it("formats date string for display", () => {
    const result = formatDate(new Date("2026-01-01T00:00:00.000Z"));
    expect(result).toContain("2026");
  });

  it("builds timeline with active stage", () => {
    const timeline = getStatusTimeline("in-progress");
    const active = timeline.find((item) => item.active);
    expect(active.stage).toBe("in-progress");
  });

  it("validates required order fields", () => {
    const validOrder = {
      title: "Landing Page Design",
      package: "basic",
      price: 150,
      total: 160,
      status: "pending",
      buyerId: "buyer-1",
    };
    expect(validateOrderData(validOrder)).toBe(true);
    expect(validateOrderData({ title: "missing fields" })).toBe(false);
  });

  it("calculates percentage-based service fee", () => {
    expect(calculateServiceFee(200, 10)).toBe(20);
    expect(calculateServiceFee(199)).toBe(10);
  });
});
