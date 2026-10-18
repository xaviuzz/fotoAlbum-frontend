import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import {
	AlbumMaking,
	type AlbumMakingReading,
} from "@/components/making/AlbumMaking";
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

describe("AlbumMaking", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows a quiet loading message while the album is pending", () => {
		sut.show("loading");

		expect(sut.loading()).toBeInTheDocument();
	});

	test("shows the album of the answer", () => {
		sut.show({ status: "ok", album });

		expect(sut.heading("Retrato de bolsillo")).toBeInTheDocument();
	});

	test("says the album was not found", () => {
		sut.show({ status: "error", code: "ALBUM_NOT_FOUND" });

		expect(sut.notFound()).toBeInTheDocument();
	});

	test("shows an error message for any other error", () => {
		sut.show({ status: "error", code: "INTERNAL_ERROR" });

		expect(sut.errorMessage()).toBeInTheDocument();
	});
});

class SUT {
	show(reading: AlbumMakingReading) {
		render(<AlbumMaking reading={reading} />);
	}

	loading() {
		return screen.getByRole("status", { name: "Cargando álbum" });
	}

	heading(name: string) {
		return screen.getByRole("heading", { name });
	}

	notFound() {
		return screen.getByText("Álbum no encontrado");
	}

	errorMessage() {
		return screen.getByRole("alert");
	}
}
