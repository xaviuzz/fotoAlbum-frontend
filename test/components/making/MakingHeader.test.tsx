import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MakingHeader } from "@/components/making/MakingHeader";
import { PresentedAlbum } from "@/lib/PresentedAlbum";

const album = new PresentedAlbum({
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 20,
	binding: "softcover",
	orientation: "portrait",
});

describe("MakingHeader", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows the commercial name as heading", () => {
		sut.show(album);

		expect(sut.heading("Retrato de bolsillo")).toBeInTheDocument();
	});

	test("keeps the characteristics hidden until asked", () => {
		sut.show(album);

		expect(sut.characteristics()).not.toBeInTheDocument();
	});

	test("reveals every characteristic when the pointer rests on the name", async () => {
		sut.show(album);

		await sut.hover();

		const characteristics = await sut.revealed();
		expect(characteristics).toHaveTextContent("PT-150");
		expect(characteristics).toHaveTextContent("150 × 210 mm");
		expect(characteristics).toHaveTextContent("140 × 200 mm");
		expect(characteristics).toHaveTextContent("20");
		expect(characteristics).toHaveTextContent("Tapa blanda");
		expect(characteristics).toHaveTextContent("Vertical");
	});

	test("reveals the characteristics when the name takes focus", async () => {
		sut.show(album);

		await sut.focus();

		expect(await sut.revealed()).toHaveTextContent("PT-150");
	});
});

class SUT {
	show(album: PresentedAlbum) {
		render(<MakingHeader album={album} />);
	}

	heading(name: string) {
		return screen.getByRole("heading", { name });
	}

	hover() {
		return userEvent.hover(this.name());
	}

	focus() {
		return userEvent.tab();
	}

	characteristics() {
		return screen.queryByText("Referencia");
	}

	async revealed() {
		const term = await screen.findByText("Referencia");
		return term.closest("dl") as HTMLElement;
	}

	private name() {
		return screen.getByRole("button", { name: "Retrato de bolsillo" });
	}
}
