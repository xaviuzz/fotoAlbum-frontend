import { beforeEach, describe, expect, test } from "bun:test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ApiProvider } from "@/api/ApiContext";
import { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import { MakingPage } from "@/pages/MakingPage";
import { AdoptingUserAlbum } from "../support/AdoptingUserAlbum";
import { FreshSession } from "../support/FreshSession";

const userAlbum = {
	id: "0190-user-album",
	reference: "PT-150",
	commercialName: "Retrato de bolsillo",
	albumSize: { width: 150, height: 210 },
	pageSize: { width: 140, height: 200 },
	pageCount: 3,
	binding: "softcover" as const,
	orientation: "portrait" as const,
};
const firstPhoto = { id: "p1", thumbnailUrl: "/photos/s/p1/thumbnail" };
const secondPhoto = { id: "p2", thumbnailUrl: "/photos/s/p2/thumbnail" };
const thirdPhoto = { id: "p3", thumbnailUrl: "/photos/s/p3/thumbnail" };

describe("MakingPage dragging", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("dropping a tray photo on the slot places it and takes it off the tray", async () => {
		sut.listPhotos([firstPhoto, secondPhoto]);
		sut.placeAnswers([{ face: 1, photoId: "p1" }]);
		sut.show([{ face: 1, photoId: null }]);
		await sut.trayPhotosOnceThereAre(2);

		sut.dragTrayPhotoToSlot(0);

		expect(await sut.slotPhotoOnceShown()).toHaveAttribute(
			"src",
			firstPhoto.thumbnailUrl,
		);
		expect(sut.traySources()).toEqual([secondPhoto.thumbnailUrl]);
	});

	test("replacing the photo of the slot returns the old one to the tray in upload order", async () => {
		sut.listPhotos([firstPhoto, secondPhoto, thirdPhoto]);
		sut.placeAnswers([{ face: 1, photoId: "p2" }]);
		sut.show([{ face: 1, photoId: "p1" }]);
		await sut.trayPhotosOnceThereAre(2);

		sut.dragTrayPhotoToSlot(0);

		await waitFor(() =>
			expect(sut.traySources()).toEqual([
				firstPhoto.thumbnailUrl,
				thirdPhoto.thumbnailUrl,
			]),
		);
	});

	test("dropping the photo of the slot on the tray empties the slot", async () => {
		sut.listPhotos([firstPhoto, secondPhoto]);
		sut.emptyAnswers([{ face: 1, photoId: null }]);
		sut.show([{ face: 1, photoId: "p1" }]);
		await sut.trayPhotosOnceThereAre(1);
		await sut.slotPhotoOnceShown();

		sut.dragSlotPhotoToTray();

		await sut.trayPhotosOnceThereAre(2);
		expect(sut.traySources()).toEqual([
			firstPhoto.thumbnailUrl,
			secondPhoto.thumbnailUrl,
		]);
		expect(sut.slot()).toHaveClass("outline-blue-500");
	});

	test("a failed placement shows an alert and leaves tray and slot as they were", async () => {
		sut.listPhotos([firstPhoto, secondPhoto]);
		sut.failSlotCalls();
		sut.show([{ face: 1, photoId: null }]);
		await sut.trayPhotosOnceThereAre(2);

		sut.dragTrayPhotoToSlot(0);

		expect(await sut.alert("No se pudo colocar la foto")).toBeVisible();
		expect(sut.traySources()).toEqual([
			firstPhoto.thumbnailUrl,
			secondPhoto.thumbnailUrl,
		]);
		expect(sut.slot()).toHaveClass("outline-blue-500");
	});

	test("a failed emptying shows an alert and leaves tray and slot as they were", async () => {
		sut.listPhotos([firstPhoto, secondPhoto]);
		sut.failSlotCalls();
		sut.show([{ face: 1, photoId: "p1" }]);
		await sut.trayPhotosOnceThereAre(1);
		await sut.slotPhotoOnceShown();

		sut.dragSlotPhotoToTray();

		expect(await sut.alert("No se pudo vaciar el hueco")).toBeVisible();
		expect(sut.traySources()).toEqual([secondPhoto.thumbnailUrl]);
		expect(sut.slot()).not.toHaveClass("outline-blue-500");
	});
});

class SUT {
	private photos: unknown[] = [];
	private placed: unknown[] = [];
	private emptied: unknown[] = [];
	private slotCallsFail = false;

	listPhotos(photos: unknown[]) {
		this.photos = photos;
	}

	placeAnswers(slots: unknown[]) {
		this.placed = slots;
	}

	emptyAnswers(slots: unknown[]) {
		this.emptied = slots;
	}

	failSlotCalls() {
		this.slotCallsFail = true;
	}

	alert(name: string) {
		return screen.findByText(name);
	}

	show(slots: { face: number; photoId: string | null }[]) {
		const fetch = async (request: Request) => {
			const path = new URL(request.url).pathname;
			const isSlotCall = path.startsWith("/slot.");
			if (isSlotCall && this.slotCallsFail) {
				return errorReply();
			}
			let body: unknown = {};
			if (path === "/photo.list") {
				body = { photos: this.photos };
			}
			if (path === "/slot.place") {
				body = { userAlbum: { ...userAlbum, slots: this.placed } };
			}
			if (path === "/slot.empty") {
				body = { userAlbum: { ...userAlbum, slots: this.emptied } };
			}
			return okReply(body);
		};
		render(
			<FreshSession>
				<ApiProvider baseUrl="http://localhost" fetch={fetch}>
					<MemoryRouter initialEntries={["/confeccion"]}>
						<AdoptingUserAlbum initial={new PresentedAlbum(userAlbum, slots)}>
							<MakingPage />
						</AdoptingUserAlbum>
					</MemoryRouter>
				</ApiProvider>
			</FreshSession>,
		);
	}

	tray() {
		return screen.getByRole("complementary", { name: "Mis fotos" });
	}

	async trayPhotosOnceThereAre(count: number) {
		await waitFor(() => expect(this.trayPhotos()).toHaveLength(count));
	}

	trayPhotos() {
		return this.tray().querySelectorAll("img");
	}

	traySources() {
		return Array.from(this.trayPhotos()).map((image) =>
			image.getAttribute("src"),
		);
	}

	dragTrayPhotoToSlot(index: number) {
		const dataTransfer = new FakeDataTransfer();
		const photo = this.trayPhotos()[index];
		const slot = this.slot();
		fireEvent.dragStart(photo, { dataTransfer });
		fireEvent.dragOver(slot, { dataTransfer });
		fireEvent.drop(slot, { dataTransfer });
	}

	dragSlotPhotoToTray() {
		const dataTransfer = new FakeDataTransfer();
		const photo = screen.getByRole("img", { name: "Foto de la cara 1" });
		fireEvent.dragStart(photo, { dataTransfer });
		fireEvent.dragOver(this.tray(), { dataTransfer });
		fireEvent.drop(this.tray(), { dataTransfer });
	}

	slot() {
		return screen.getByRole("figure", { name: "Hueco de la cara 1" });
	}

	slotPhotoOnceShown() {
		return screen.findByRole("img", { name: "Foto de la cara 1" });
	}
}

class FakeDataTransfer {
	private readonly data = new Map<string, string>();
	dropEffect = "none";
	effectAllowed = "all";

	get types() {
		return Array.from(this.data.keys());
	}

	setData(type: string, value: string) {
		this.data.set(type, value);
	}

	getData(type: string) {
		return this.data.get(type) ?? "";
	}
}

function errorReply() {
	return new Response(
		JSON.stringify({
			header: { callId: "c", status: "error" },
			body: { code: "INTERNAL_ERROR", message: "failed" },
		}),
		{ headers: { "content-type": "application/json" } },
	);
}

function okReply(body: unknown) {
	return new Response(
		JSON.stringify({ header: { callId: "c", status: "ok" }, body }),
		{ headers: { "content-type": "application/json" } },
	);
}
