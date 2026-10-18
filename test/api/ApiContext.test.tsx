import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { useAlbums } from "@/api/ApiContext";

function AlbumsUser() {
	useAlbums();
	return null;
}

describe("useAlbums", () => {
	test("needs an api provider", () => {
		expect(() => render(<AlbumsUser />)).toThrow("ApiProvider");
	});
});
