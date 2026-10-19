import { describe, expect, test } from "bun:test";
import { render } from "@testing-library/react";
import { useAlbums, useUserAlbums } from "@/api/ApiContext";

function AlbumsUser() {
	useAlbums();
	return null;
}

function UserAlbumsUser() {
	useUserAlbums();
	return null;
}

describe("useAlbums", () => {
	test("needs an api provider", () => {
		expect(() => render(<AlbumsUser />)).toThrow("ApiProvider");
	});
});

describe("useUserAlbums", () => {
	test("needs an api provider", () => {
		expect(() => render(<UserAlbumsUser />)).toThrow("ApiProvider");
	});
});
