import { describe, expect, test } from "bun:test";
import { SlotGeometry } from "@/domain/album/SlotGeometry";

describe("SlotGeometry", () => {
	test("leaves a 5 % margin and takes 90 % when the page measures whole millimetres", () => {
		const geometry = SlotGeometry.of({ width: 140, height: 200 });

		const placement = geometry.placement();

		expect(placement.left).toBeCloseTo(5, 6);
		expect(placement.top).toBeCloseTo(5, 6);
		expect(placement.width).toBeCloseTo(90, 6);
		expect(placement.height).toBeCloseTo(90, 6);
	});

	test("rounds inwards to the millimetre when 5 % is not a whole number", () => {
		const geometry = SlotGeometry.of({ width: 145, height: 205 });

		const placement = geometry.placement();

		expect(placement.left).toBeCloseTo((8 / 145) * 100, 6);
		expect(placement.width).toBeCloseTo((129 / 145) * 100, 6);
		expect(placement.top).toBeCloseTo((11 / 205) * 100, 6);
		expect(placement.height).toBeCloseTo((183 / 205) * 100, 6);
	});

	test("never goes beyond the face", () => {
		const geometry = SlotGeometry.of({ width: 133, height: 187 });

		const placement = geometry.placement();

		expect(placement.left + placement.width).toBeLessThanOrEqual(100);
		expect(placement.top + placement.height).toBeLessThanOrEqual(100);
	});
});
