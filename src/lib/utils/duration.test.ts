import { describe, expect, it } from "vitest";
import { formatMonthDuration } from "./duration";

describe("formatMonthDuration", () => {
	it("formats German durations", () => {
		expect(formatMonthDuration(1, "de")).toBe("1 Monat");
		expect(formatMonthDuration(12, "de")).toBe("1 Jahr");
		expect(formatMonthDuration(26, "de")).toBe("2 Jahre, 2 Monate");
	});

	it("formats English durations", () => {
		expect(formatMonthDuration(1, "en")).toBe("1 month");
		expect(formatMonthDuration(12, "en")).toBe("1 year");
		expect(formatMonthDuration(26, "en")).toBe("2 years, 2 months");
	});
});
