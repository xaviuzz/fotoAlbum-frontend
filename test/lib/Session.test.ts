import { describe, expect, test } from "bun:test";
import { Session } from "@/lib/Session";

describe("Session", () => {
	test("belongs to the catalogue until an album is chosen", () => {
		const session = Session.start();

		expect(session.path()).toBe("/");
	});

	test("belongs to the making page of the chosen album", () => {
		const session = Session.start().choosing("SQ-210");

		expect(session.path()).toBe("/confeccion/SQ-210");
	});

	test("starts every time with a different identity", () => {
		const first = Session.start();
		const second = Session.start();

		expect(first.serialize()).not.toBe(second.serialize());
	});

	test("is restored from its serialized text", () => {
		const session = Session.start().choosing("PT-150");

		const restored = Session.restore(session.serialize());

		expect(restored.path()).toBe("/confeccion/PT-150");
		expect(restored.avatarColor()).toBe(session.avatarColor());
	});

	test("restores a session without a chosen album", () => {
		const session = Session.start();

		const restored = Session.restore(session.serialize());

		expect(restored.path()).toBe("/");
		expect(restored.avatarColor()).toBe(session.avatarColor());
	});

	test("starts a new session when the text is not a session", () => {
		const texts = ["", "not json", "null", "[]", '{"identity":7}'];

		for (const text of texts) {
			expect(Session.restore(text).path()).toBe("/");
		}
	});

	test("forgets the chosen album when starting over", () => {
		const session = Session.start().choosing("SQ-210");

		const fresh = session.startingOver();

		expect(fresh.path()).toBe("/");
		expect(fresh.serialize()).not.toBe(session.serialize());
	});

	test("gives the same avatar color to the same identity", () => {
		const session = Session.start();

		expect(session.choosing("SQ-210").avatarColor()).toBe(
			session.avatarColor(),
		);
	});

	test("gives different identities more than one avatar color", () => {
		const colors = new Set<string>();

		for (let count = 0; count < 30; count++) {
			colors.add(Session.start().avatarColor());
		}

		expect(colors.size).toBeGreaterThan(1);
	});
});
