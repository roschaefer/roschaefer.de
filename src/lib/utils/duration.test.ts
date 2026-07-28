import { describe, expect, it } from "vitest";
import { formatMonthDuration } from "./duration";

describe("formatMonthDuration", () => {
	it("formats German durations, rounded to the nearest quarter-year", () => {
		expect(formatMonthDuration(1, "de")).toBe("1 Monat");
		expect(formatMonthDuration(12, "de")).toBe("1 Jahr");
		expect(formatMonthDuration(24, "de")).toBe("2 Jahre");
		expect(formatMonthDuration(27, "de")).toBe("2¼ Jahre");
		expect(formatMonthDuration(30, "de")).toBe("2½ Jahre");
		expect(formatMonthDuration(33, "de")).toBe("2¾ Jahre");
		expect(formatMonthDuration(35, "de")).toBe("3 Jahre");
	});

	it("formats English durations, rounded to the nearest quarter-year", () => {
		expect(formatMonthDuration(1, "en")).toBe("1 month");
		expect(formatMonthDuration(12, "en")).toBe("1 year");
		expect(formatMonthDuration(24, "en")).toBe("2 years");
		expect(formatMonthDuration(27, "en")).toBe("2¼ years");
		expect(formatMonthDuration(30, "en")).toBe("2½ years");
		expect(formatMonthDuration(33, "en")).toBe("2¾ years");
		expect(formatMonthDuration(35, "en")).toBe("3 years");
	});
});
