import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiProvider } from "@/api/ApiContext";
import { PhotoTray } from "@/components/making/PhotoTray";
import { FreshSession } from "../../support/FreshSession";

const firstPhoto = { id: "p1", thumbnailUrl: "/photos/s/p1/thumbnail" };
const secondPhoto = { id: "p2", thumbnailUrl: "/photos/s/p2/thumbnail" };
const thirdPhoto = { id: "p3", thumbnailUrl: "/photos/s/p3/thumbnail" };

describe("PhotoTray", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows a quiet loading message while the photos are pending", () => {
		sut.show();

		expect(sut.loading()).toBeInTheDocument();
	});

	test("shows the photos of the session", async () => {
		sut.answerList({ photos: [firstPhoto, secondPhoto] });

		sut.show();

		expect(await sut.thumbnails()).toHaveLength(2);
	});

	test("says there are no photos yet", async () => {
		sut.answerList({ photos: [] });

		sut.show();

		expect(await sut.emptyMessage()).toBeInTheDocument();
	});

	test("shows an error message when the list fails", async () => {
		sut.failList();

		sut.show();

		expect(await sut.listError()).toBeInTheDocument();
	});

	test("puts the uploaded photos at the end", async () => {
		sut.answerList({ photos: [firstPhoto] });
		sut.answerUpload({ photos: [secondPhoto, thirdPhoto], rejected: [] });
		sut.show();
		await sut.thumbnails();

		await sut.upload(["b.jpg", "c.jpg"]);

		const sources = await sut.thumbnailSourcesOnceThereAre(3);
		expect(sources).toEqual([
			firstPhoto.thumbnailUrl,
			secondPhoto.thumbnailUrl,
			thirdPhoto.thumbnailUrl,
		]);
	});

	test("lists the rejected files until the next upload", async () => {
		sut.answerList({ photos: [] });
		sut.answerUpload({
			photos: [],
			rejected: [{ name: "notes.txt", code: "UNSUPPORTED_FORMAT" }],
		});
		sut.show();
		await sut.emptyMessage();

		await sut.upload(["notes.txt"]);
		expect(await sut.rejection("notes.txt: Formato no admitido")).toBeVisible();

		sut.answerUpload({ photos: [firstPhoto], rejected: [] });
		await sut.upload(["a.jpg"]);
		await sut.thumbnailSourcesOnceThereAre(1);

		expect(sut.rejections()).toHaveLength(0);
	});

	test("disables the button while uploading", async () => {
		sut.answerList({ photos: [] });
		sut.holdUpload();
		sut.show();
		await sut.emptyMessage();

		await sut.upload(["a.jpg"]);

		expect(sut.uploadButton()).toBeDisabled();
	});

	test("shows an error message when the whole upload fails", async () => {
		sut.answerList({ photos: [] });
		sut.failUpload();
		sut.show();
		await sut.emptyMessage();

		await sut.upload(["a.jpg"]);

		expect(await sut.uploadError()).toBeInTheDocument();
	});
});

type Pending = () => Promise<Response>;

class SUT {
	private list: Pending = () => new Promise(() => {});
	private uploadReply: Pending = () => new Promise(() => {});

	show() {
		const fetch = async (request: Request) => {
			const isUpload = new URL(request.url).pathname === "/photo.upload";
			let reply = this.list;
			if (isUpload) {
				reply = this.uploadReply;
			}
			return reply();
		};
		render(
			<FreshSession>
				<ApiProvider baseUrl="http://localhost" fetch={fetch}>
					<PhotoTray />
				</ApiProvider>
			</FreshSession>,
		);
	}

	answerList(body: unknown) {
		this.list = async () => okReply(body);
	}

	failList() {
		this.list = async () => {
			throw new TypeError("network down");
		};
	}

	answerUpload(body: unknown) {
		this.uploadReply = async () => okReply(body);
	}

	holdUpload() {
		this.uploadReply = () => new Promise(() => {});
	}

	failUpload() {
		this.uploadReply = async () => {
			throw new TypeError("network down");
		};
	}

	async upload(names: string[]) {
		const files = names.map(
			(name) => new File(["bytes"], name, { type: "image/jpeg" }),
		);
		await userEvent.upload(screen.getByLabelText("Fotos a subir"), files);
	}

	loading() {
		return screen.getByRole("status", { name: "Cargando fotos" });
	}

	thumbnails() {
		return screen.findAllByRole("img");
	}

	async thumbnailSourcesOnceThereAre(count: number) {
		await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(count));
		return screen.getAllByRole("img").map((image) => image.getAttribute("src"));
	}

	emptyMessage() {
		return screen.findByText("Aún no hay fotos");
	}

	listError() {
		return screen.findByText("No se pudieron cargar las fotos");
	}

	uploadError() {
		return screen.findByText("No se pudieron subir las fotos");
	}

	rejection(text: string) {
		return screen.findByText(text);
	}

	rejections() {
		return screen.queryAllByText(/Formato no admitido/);
	}

	uploadButton() {
		return screen.getByRole("button", { name: "Subir fotos" });
	}
}

function okReply(body: unknown) {
	return new Response(
		JSON.stringify({ header: { callId: "c", status: "ok" }, body }),
		{ headers: { "content-type": "application/json" } },
	);
}
