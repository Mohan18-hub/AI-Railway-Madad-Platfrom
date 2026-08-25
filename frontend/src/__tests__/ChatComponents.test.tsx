import { describe, it, expect } from "vitest";
import StatusBadge from "../components/StatusBadge";
import { ai_intelligence_service_test } from "./test_helpers";

describe("Frontend Claude Chat UI & AI Logic Unit Tests", () => {
  it("verifies StatusBadge component exists and exports properly", () => {
    expect(StatusBadge).toBeDefined();
    expect(typeof StatusBadge).toBe("function");
  });

  it("verifies classification category matching rules", () => {
    const res = ai_intelligence_service_test.classify("Toilet in coach S4 is dirty");
    expect(res.category).toBe("cleanliness");
    expect(res.department).toContain("Health");
  });

  it("verifies severity detection logic for emergency keywords", () => {
    const criticalRes = ai_intelligence_service_test.detectSeverity("Fire inside train coach B1");
    expect(criticalRes.severity).toBe("critical");

    const highRes = ai_intelligence_service_test.detectSeverity("Luggage stolen in coach A2");
    expect(highRes.severity).toBe("high");
  });

  it("verifies details extraction for PNR, Coach, and Seat", () => {
    const details = ai_intelligence_service_test.extractDetails("AC not cooling in coach B2 seat 45 PNR 2415678901");
    expect(details.pnr).toBe("2415678901");
    expect(details.coach).toBe("B2");
    expect(details.seat).toBe("45");
  });
});
