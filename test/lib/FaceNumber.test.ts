import { describe, expect, test } from "bun:test";
import { FaceNumber } from "@/lib/FaceNumber";

describe("FaceNumber", () => {
	test("starts at the first face and reads n over the page count", () => {
		const face = FaceNumber.first(24);

		expect(face.label()).toBe("1/24");
		expect(face.isFirst()).toBe(true);
		expect(face.isLast()).toBe(false);
	});

	test("moves to the next face", () => {
		const face = FaceNumber.first(24).next();

		expect(face.label()).toBe("2/24");
		expect(face.isFirst()).toBe(false);
	});

	test("moves back to the previous face", () => {
		const face = FaceNumber.first(24).next().previous();

		expect(face.label()).toBe("1/24");
	});

	test("stays on the last face when there is no next one", () => {
		const face = FaceNumber.first(2).next();

		expect(face.isLast()).toBe(true);
		expect(face.next().label()).toBe("2/2");
	});

	test("stays on the first face when there is no previous one", () => {
		const face = FaceNumber.first(2);

		expect(face.previous().label()).toBe("1/2");
	});

	test("is bound on the left on odd faces and on the right on even ones", () => {
		const first = FaceNumber.first(4);
		const second = first.next();
		const third = second.next();

		expect(first.bindingSide()).toBe("left");
		expect(second.bindingSide()).toBe("right");
		expect(third.bindingSide()).toBe("left");
	});
});
