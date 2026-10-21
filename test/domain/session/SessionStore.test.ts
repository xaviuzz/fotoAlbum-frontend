import { beforeEach, describe, expect, test } from "bun:test";
import { Session } from "@/domain/session/Session";
import { SessionStore } from "@/domain/session/SessionStore";

const UUID = /^[0-9a-f-]{36}$/;

describe("SessionStore", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("starts a session when nothing was stored", () => {
		expect(sut.loadedIdentity()).toMatch(UUID);
	});

	test("loads the session that was saved", () => {
		const saved = Session.start();
		sut.save(saved);

		expect(sut.loaded().serialize()).toBe(saved.serialize());
	});

	test("starts a session when the stored text is not a session", () => {
		sut.storeText("garbage");

		expect(sut.loadedIdentity()).toMatch(UUID);
	});

	test("starts a session when the browser refuses to read", () => {
		sut.refuseStorage();

		expect(sut.loadedIdentity()).toMatch(UUID);
	});

	test("saves without failing when the browser refuses to write", () => {
		sut.refuseStorage();

		expect(() => sut.save(Session.start())).not.toThrow();
	});
});

class SUT {
	private text: string | null = null;
	private refuses = false;
	private readonly store = new SessionStore({
		getItem: () => {
			if (this.refuses) {
				throw new Error("storage refused");
			}
			return this.text;
		},
		setItem: (_key: string, value: string) => {
			if (this.refuses) {
				throw new Error("storage refused");
			}
			this.text = value;
		},
	});

	save(session: Session) {
		this.store.save(session);
	}

	loaded() {
		return this.store.load();
	}

	loadedIdentity() {
		return this.store.load().callHeader("c").sessionId;
	}

	storeText(text: string) {
		this.text = text;
	}

	refuseStorage() {
		this.refuses = true;
	}
}
