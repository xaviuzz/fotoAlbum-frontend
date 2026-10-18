import { beforeEach, describe, expect, test } from "bun:test";
import { Session } from "@/lib/Session";
import { SessionStore } from "@/lib/SessionStore";

describe("SessionStore", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("starts a session when nothing was stored", () => {
		expect(sut.loaded().path()).toBe("/");
	});

	test("loads the session that was saved", () => {
		sut.save(Session.start().choosing("LD-297"));

		expect(sut.loaded().path()).toBe("/confeccion/LD-297");
	});

	test("starts a session when the stored text is not a session", () => {
		sut.storeText("garbage");

		expect(sut.loaded().path()).toBe("/");
	});

	test("starts a session when the browser refuses to read", () => {
		sut.refuseStorage();

		expect(sut.loaded().path()).toBe("/");
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

	storeText(text: string) {
		this.text = text;
	}

	refuseStorage() {
		this.refuses = true;
	}
}
