import { beforeEach, describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import { Session } from "@/lib/Session";
import { SessionStore } from "@/lib/SessionStore";
import { SessionProvider, useSession } from "@/session/SessionContext";
import { FakeStorage } from "../support/FakeStorage";

function SessionPanel() {
	const { session, restart } = useSession();
	return (
		<>
			<output>{session.callHeader("c").sessionId}</output>
			<button type="button" onClick={() => restart()}>
				restart
			</button>
		</>
	);
}

describe("SessionProvider", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("starts with the stored session", () => {
		const stored = Session.start();
		sut.store(stored);

		sut.show();

		expect(sut.identity()).toHaveTextContent(stored.callHeader("c").sessionId);
	});

	test("stores the session it starts with when none was stored", () => {
		sut.show();

		const shown = sut.identity().textContent;
		expect(sut.stored().callHeader("c").sessionId).toBe(shown);
	});

	test("takes a new identity when starting over and stores it", () => {
		const stored = Session.start();
		sut.store(stored);
		sut.show();

		sut.restart();

		expect(sut.identity()).not.toHaveTextContent(
			stored.callHeader("c").sessionId,
		);
		expect(sut.stored().serialize()).not.toBe(stored.serialize());
	});
});

describe("useSession", () => {
	test("needs a session provider", () => {
		expect(() => render(<SessionPanel />)).toThrow("SessionProvider");
	});
});

class SUT {
	private readonly sessionStore = new SessionStore(new FakeStorage());

	store(session: Session) {
		this.sessionStore.save(session);
	}

	show() {
		render(
			<SessionProvider store={this.sessionStore}>
				<SessionPanel />
			</SessionProvider>,
		);
	}

	restart() {
		act(() => screen.getByRole("button", { name: "restart" }).click());
	}

	identity() {
		return screen.getByRole("status");
	}

	stored() {
		return this.sessionStore.load();
	}
}
