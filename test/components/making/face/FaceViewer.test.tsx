import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiProvider } from "@/api/ApiContext";
import { FaceViewer } from "@/components/making/face/FaceViewer";
import { PhotosProvider } from "@/contexts/PhotosContext";
import { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import { AdoptingUserAlbum } from "../../../support/AdoptingUserAlbum";
import { FreshSession } from "../../../support/FreshSession";

const portraitAlbum = new PresentedAlbum({
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 3,
	binding: "softcover",
	orientation: "portrait",
});

describe("FaceViewer", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("opens on the first face", () => {
		sut.show(portraitAlbum);

		expect(sut.position()).toHaveTextContent("1/3");
		expect(sut.face()).toHaveAccessibleName("Cara 1");
	});

	test("keeps the proportion of the page size", () => {
		sut.show(portraitAlbum);

		expect(sut.face()).toHaveStyle({ aspectRatio: "140 / 200" });
	});

	test("marks the binding on the left of an odd face", () => {
		sut.show(portraitAlbum);

		expect(sut.face()).toHaveAttribute("data-binding-side", "left");
	});

	test("moves to the next face, bound on the right", async () => {
		sut.show(portraitAlbum);

		await sut.next();

		expect(sut.position()).toHaveTextContent("2/3");
		expect(sut.face()).toHaveAccessibleName("Cara 2");
		expect(sut.face()).toHaveAttribute("data-binding-side", "right");
	});

	test("moves back to the previous face", async () => {
		sut.show(portraitAlbum);
		await sut.next();

		await sut.previous();

		expect(sut.position()).toHaveTextContent("1/3");
	});

	test("cannot go back from the first face", () => {
		sut.show(portraitAlbum);

		expect(sut.previousButton()).toBeDisabled();
		expect(sut.nextButton()).toBeEnabled();
	});

	test("cannot go forward from the last face", async () => {
		sut.show(portraitAlbum);

		await sut.next();
		await sut.next();

		expect(sut.position()).toHaveTextContent("3/3");
		expect(sut.nextButton()).toBeDisabled();
		expect(sut.previousButton()).toBeEnabled();
	});
});

class SUT {
	show(album: PresentedAlbum) {
		render(
			<FreshSession>
				<ApiProvider
					baseUrl="http://localhost"
					fetch={() => new Promise<Response>(() => {})}
				>
					<AdoptingUserAlbum initial={album}>
						<PhotosProvider>
							<FaceViewer album={album} />
						</PhotosProvider>
					</AdoptingUserAlbum>
				</ApiProvider>
			</FreshSession>,
		);
	}

	face() {
		return screen.getByRole("img", { name: /^Cara \d+$/ });
	}

	position() {
		return screen.getByRole("status", { name: "Posición" });
	}

	previousButton() {
		return screen.getByRole("button", { name: "Anterior" });
	}

	nextButton() {
		return screen.getByRole("button", { name: "Siguiente" });
	}

	previous() {
		return userEvent.click(this.previousButton());
	}

	next() {
		return userEvent.click(this.nextButton());
	}
}
