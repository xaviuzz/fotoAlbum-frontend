import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadButton } from "@/components/making/UploadButton";

describe("UploadButton", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("offers to upload photos", () => {
		sut.show({ uploading: false });

		expect(sut.button()).toBeEnabled();
	});

	test("hands over the chosen files", async () => {
		sut.show({ uploading: false });

		await sut.choose(["a.jpg", "b.png"]);

		expect(sut.chosenNames()).toEqual(["a.jpg", "b.png"]);
	});

	test("accepts several JPEG, PNG and WebP files", () => {
		sut.show({ uploading: false });

		expect(sut.chooser()).toHaveAttribute("multiple");
		expect(sut.chooser()).toHaveAttribute(
			"accept",
			"image/jpeg,image/png,image/webp",
		);
	});

	test("is disabled while uploading", () => {
		sut.show({ uploading: true });

		expect(sut.button()).toBeDisabled();
	});
});

class SUT {
	private chosen: File[] = [];

	show({ uploading }: { uploading: boolean }) {
		render(
			<UploadButton
				uploading={uploading}
				onChosen={(files) => {
					this.chosen = files;
				}}
			/>,
		);
	}

	button() {
		return screen.getByRole("button", { name: "Subir fotos" });
	}

	chooser() {
		return screen.getByLabelText("Fotos a subir");
	}

	async choose(names: string[]) {
		const files = names.map(
			(name) => new File(["bytes"], name, { type: "image/jpeg" }),
		);
		await userEvent.upload(this.chooser(), files);
	}

	chosenNames() {
		return this.chosen.map((file) => file.name);
	}
}
