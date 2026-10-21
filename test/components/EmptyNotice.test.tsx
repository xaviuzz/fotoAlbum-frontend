import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { EmptyNotice } from "@/components/EmptyNotice";

describe("EmptyNotice", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("says with the given message that there is nothing", () => {
		sut.show("Aún no hay fotos");

		expect(sut.message("Aún no hay fotos")).toBeInTheDocument();
	});
});

class SUT {
	show(message: string) {
		render(<EmptyNotice message={message} />);
	}

	message(text: string) {
		return screen.getByText(text);
	}
}
