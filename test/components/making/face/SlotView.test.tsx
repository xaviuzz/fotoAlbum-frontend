import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { ApiProvider } from "@/api/ApiContext";
import { FaceNumber } from "@/components/making/face/FaceNumber";
import { SlotView } from "@/components/making/face/SlotView";
import { PhotosProvider } from "@/contexts/PhotosContext";
import { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import { AdoptingUserAlbum } from "../../../support/AdoptingUserAlbum";
import { FreshSession } from "../../../support/FreshSession";

const album = {
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 3,
	binding: "softcover" as const,
	orientation: "portrait" as const,
};
const photo = { id: "p1", thumbnailUrl: "/photos/s/p1/thumbnail" };

describe("SlotView", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("sits inside the margins of the face", () => {
		sut.show(new PresentedAlbum({ ...album, slots: [] }));

		expect(sut.slot()).toHaveStyle({
			left: "5%",
			top: "5%",
			width: "90%",
			height: "90%",
		});
	});

	test("is outlined in blue while empty", () => {
		sut.show(
			new PresentedAlbum({ ...album, slots: [{ face: 1, photoId: null }] }),
		);

		expect(sut.slot()).toHaveClass("outline-blue-500");
		expect(sut.photo()).not.toBeInTheDocument();
	});

	test("shows the thumbnail of its photo, fitted and without outline", async () => {
		sut.answerList({ photos: [photo] });
		sut.show(
			new PresentedAlbum({ ...album, slots: [{ face: 1, photoId: "p1" }] }),
		);

		const shown = await sut.photoOnceShown();

		expect(shown).toHaveAttribute("src", photo.thumbnailUrl);
		expect(shown).toHaveClass("object-contain");
		expect(sut.slot()).not.toHaveClass("outline-blue-500");
	});

	test("shows the photo of its own face", async () => {
		sut.answerList({ photos: [photo] });
		sut.show(
			new PresentedAlbum({ ...album, slots: [{ face: 2, photoId: "p1" }] }),
		);

		expect(await sut.slotOnceListed()).toHaveClass("outline-blue-500");
		expect(sut.photo()).not.toBeInTheDocument();
	});
});

class SUT {
	private list: Response | null = null;

	answerList(body: unknown) {
		this.list = new Response(
			JSON.stringify({ header: { callId: "c", status: "ok" }, body }),
			{ headers: { "content-type": "application/json" } },
		);
	}

	show(presented: PresentedAlbum) {
		const fetch = async () => {
			let reply = new Promise<Response>(() => {});
			if (this.list !== null) {
				reply = Promise.resolve(this.list);
			}
			return reply;
		};
		render(
			<FreshSession>
				<ApiProvider baseUrl="http://localhost" fetch={fetch}>
					<AdoptingUserAlbum initial={presented}>
						<PhotosProvider>
							<SlotView album={presented} face={FaceNumber.first(3)} />
						</PhotosProvider>
					</AdoptingUserAlbum>
				</ApiProvider>
			</FreshSession>,
		);
	}

	slot() {
		return screen.getByRole("figure", { name: "Hueco de la cara 1" });
	}

	async slotOnceListed() {
		await screen.findByRole("figure", { name: "Hueco de la cara 1" });
		return this.slot();
	}

	photo() {
		return screen.queryByRole("img", { name: "Foto de la cara 1" });
	}

	photoOnceShown() {
		return screen.findByRole("img", { name: "Foto de la cara 1" });
	}
}
