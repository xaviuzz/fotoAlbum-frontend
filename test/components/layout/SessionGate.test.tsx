import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { SessionGate } from "@/components/layout/SessionGate";
import { Session } from "@/lib/Session";
import { SessionStore } from "@/lib/SessionStore";
import { SessionProvider } from "@/session/SessionContext";
import { FakeStorage } from "../../support/FakeStorage";

function Where() {
	return <output>{useLocation().pathname}</output>;
}

describe("SessionGate", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("sends a making address to the catalogue when nothing is chosen", () => {
		sut.showAt("/confeccion/SQ-210");

		expect(sut.location()).toHaveTextContent("/");
	});

	test("sends the catalogue to the chosen album", () => {
		sut.choose("PT-150");

		sut.showAt("/");

		expect(sut.location()).toHaveTextContent("/confeccion/PT-150");
	});

	test("sends another album's address to the chosen album", () => {
		sut.choose("PT-150");

		sut.showAt("/confeccion/SQ-210");

		expect(sut.location()).toHaveTextContent("/confeccion/PT-150");
	});

	test("leaves the address that is already the session's", () => {
		sut.choose("PT-150");

		sut.showAt("/confeccion/PT-150");

		expect(sut.location()).toHaveTextContent("/confeccion/PT-150");
	});
});

class SUT {
	private readonly store = new SessionStore(new FakeStorage());

	choose(reference: string) {
		this.store.save(Session.start().choosing(reference));
	}

	showAt(path: string) {
		render(
			<SessionProvider store={this.store}>
				<MemoryRouter initialEntries={[path]}>
					<SessionGate>
						<Where />
					</SessionGate>
				</MemoryRouter>
			</SessionProvider>,
		);
	}

	location() {
		return screen.getByRole("status");
	}
}
