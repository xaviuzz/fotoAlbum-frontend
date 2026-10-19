import { describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { PhotoThumbnails } from "@/components/making/PhotoThumbnails";

describe("PhotoThumbnails", () => {
	test("shows each thumbnail in order", () => {
		render(
			<PhotoThumbnails
				photos={[
					{ id: "p1", thumbnailUrl: "/photos/s/p1/thumbnail" },
					{ id: "p2", thumbnailUrl: "/photos/s/p2/thumbnail" },
				]}
			/>,
		);

		const images = screen.getAllByRole("img");
		expect(images[0]).toHaveAttribute("src", "/photos/s/p1/thumbnail");
		expect(images[1]).toHaveAttribute("src", "/photos/s/p2/thumbnail");
	});
});
