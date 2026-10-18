import { beforeEach, describe, expect, test } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import { Session } from "@/lib/Session";
import { SessionStore } from "@/lib/SessionStore";
import { SessionProvider, useSession } from "@/session/SessionContext";
import { FakeStorage } from "../support/FakeStorage";

function SessionPanel() {
	const { session, choose, restart } = useSession();
	return (
		<>
			<output>{session.path()}</output>
			<button type="button" onClick={() => choose("SQ-210")}>
				choose
			</button>
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
		sut.store(Session.start().choosing("PT-150"));

		sut.show();

		expect(sut.path()).toHaveTextContent("/confeccion/PT-150");
	});

	test("records the chosen album and stores it", () => {
		sut.show();

		sut.choose();

		expect(sut.path()).toHaveTextContent("/confeccion/SQ-210");
		expect(sut.stored().path()).toBe("/confeccion/SQ-210");
	});

	test("forgets the chosen album when starting over", () => {
		sut.store(Session.start().choosing("PT-150"));
		sut.show();

		sut.restart();

		expect(sut.path()).toHaveTextContent("/");
		expect(sut.stored().path()).toBe("/");
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

	choose() {
		act(() => screen.getByRole("button", { name: "choose" }).click());
	}

	restart() {
		act(() => screen.getByRole("button", { name: "restart" }).click());
	}

	path() {
		return screen.getByRole("status");
	}

	stored() {
		return this.sessionStore.load();
	}
}
