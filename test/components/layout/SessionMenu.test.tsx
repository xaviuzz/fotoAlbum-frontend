import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionMenu } from "@/components/layout/SessionMenu";
import { SessionStore } from "@/lib/SessionStore";
import { SessionProvider } from "@/session/SessionContext";
import { FakeStorage } from "../../support/FakeStorage";

describe("SessionMenu", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows the avatar of the session", () => {
		sut.show();

		expect(sut.avatar()).toHaveStyle({
			backgroundColor: sut.session().avatarColor(),
		});
	});

	test("offers only to start over", async () => {
		sut.show();

		await sut.open();

		expect(sut.options()).toHaveLength(1);
		expect(sut.startOverOption()).toBeInTheDocument();
	});

	test("asks for confirmation before starting over", async () => {
		sut.show();

		await sut.chooseStartOver();

		expect(sut.confirmation()).toBeInTheDocument();
		expect(sut.session().serialize()).toBe(sut.initial());
	});

	test("keeps the session when the confirmation is cancelled", async () => {
		sut.show();
		await sut.chooseStartOver();

		await sut.cancel();

		expect(sut.confirmation()).not.toBeInTheDocument();
		expect(sut.session().serialize()).toBe(sut.initial());
	});

	test("starts a new session when the confirmation is accepted", async () => {
		sut.show();
		await sut.chooseStartOver();

		await sut.confirm();

		expect(sut.session().serialize()).not.toBe(sut.initial());
	});
});

class SUT {
	private readonly store = new SessionStore(new FakeStorage());
	private first = this.store.load();

	show() {
		this.store.save(this.first);
		render(
			<SessionProvider store={this.store}>
				<SessionMenu />
			</SessionProvider>,
		);
	}

	initial() {
		return this.first.serialize();
	}

	session() {
		return this.store.load();
	}

	avatar() {
		return within(this.trigger()).getByRole("img");
	}

	open() {
		return userEvent.click(this.trigger());
	}

	options() {
		return screen.getAllByRole("menuitem");
	}

	startOverOption() {
		return screen.getByRole("menuitem", { name: "Volver a empezar" });
	}

	async chooseStartOver() {
		await this.open();
		await userEvent.click(this.startOverOption());
	}

	confirmation() {
		return screen.queryByRole("alertdialog", { name: "¿Volver a empezar?" });
	}

	cancel() {
		return userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
	}

	confirm() {
		return userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
	}

	private trigger() {
		return screen.getByRole("button", { name: "Sesión anónima" });
	}
}
