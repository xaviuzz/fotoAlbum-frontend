import { describe, expect, test } from "bun:test";
import { Session } from "@/lib/Session";

describe("Session", () => {
	test("starts every time with a different identity", () => {
		const first = Session.start();
		const second = Session.start();

		expect(first.serialize()).not.toBe(second.serialize());
	});

	test("is restored from its serialized text", () => {
		const session = Session.start();

		const restored = Session.restore(session.serialize());

		expect(restored.serialize()).toBe(session.serialize());
		expect(restored.avatarColor()).toBe(session.avatarColor());
	});

	test("keeps only its identity when restoring text that names a chosen album", () => {
		const text = '{"identity":"abc","chosenReference":"SQ-210"}';

		const restored = Session.restore(text);

		expect(restored.serialize()).toBe('{"identity":"abc"}');
	});

	test("starts a new session when the text is not a session", () => {
		const texts = ["", "not json", "null", "[]", '{"identity":7}'];

		for (const text of texts) {
			expect(Session.restore(text).callHeader("c").sessionId).toMatch(
				/^[0-9a-f-]{36}$/,
			);
		}
	});

	test("takes a new identity when starting over", () => {
		const session = Session.start();

		const fresh = session.startingOver();

		expect(fresh.serialize()).not.toBe(session.serialize());
	});

	test("gives the same avatar color to the same identity", () => {
		const session = Session.start();

		const restored = Session.restore(session.serialize());

		expect(restored.avatarColor()).toBe(session.avatarColor());
	});

	test("gives different identities more than one avatar color", () => {
		const colors = new Set<string>();

		for (let count = 0; count < 30; count++) {
			colors.add(Session.start().avatarColor());
		}

		expect(colors.size).toBeGreaterThan(1);
	});
});
