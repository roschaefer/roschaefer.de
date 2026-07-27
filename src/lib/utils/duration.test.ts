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

	it("formats compact German durations, rounded to the nearest quarter-year", () => {
		expect(formatMonthDuration(1, "de", true)).toBe("1 Monat");
		expect(formatMonthDuration(12, "de", true)).toBe("1 Jahr");
		expect(formatMonthDuration(24, "de", true)).toBe("2 Jahre");
		expect(formatMonthDuration(27, "de", true)).toBe("2¼ Jahre");
		expect(formatMonthDuration(30, "de", true)).toBe("2½ Jahre");
		expect(formatMonthDuration(33, "de", true)).toBe("2¾ Jahre");
		expect(formatMonthDuration(35, "de", true)).toBe("3 Jahre");
	});

	it("formats compact English durations, rounded to the nearest quarter-year", () => {
		expect(formatMonthDuration(1, "en", true)).toBe("1 month");
		expect(formatMonthDuration(12, "en", true)).toBe("1 year");
		expect(formatMonthDuration(24, "en", true)).toBe("2 years");
		expect(formatMonthDuration(27, "en", true)).toBe("2¼ years");
		expect(formatMonthDuration(30, "en", true)).toBe("2½ years");
		expect(formatMonthDuration(33, "en", true)).toBe("2¾ years");
		expect(formatMonthDuration(35, "en", true)).toBe("3 years");
	});
});
