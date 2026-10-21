import { beforeEach, describe, expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import type { ApiAnswer } from "@/api/rpc/ApiAnswer";
import { ReadingView } from "@/components/ReadingView";
import type { Reading } from "@/lib/useReading";

type Items = ApiAnswer<{ items: string[] }>;

describe("ReadingView", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("shows the loading node while the reading is pending", () => {
		sut.show("loading");

		expect(sut.shown()).toBe("loading");
	});

	test("shows the failed node when the answer is an error", () => {
		sut.show({ status: "error", code: "INTERNAL_ERROR" });

		expect(sut.shown()).toBe("failed");
	});

	test("shows the empty node when the answer has nothing", () => {
		sut.show({ status: "ok", items: [] });

		expect(sut.shown()).toBe("empty");
	});

	test("shows the loaded node with the answer when it has content", () => {
		sut.show({ status: "ok", items: ["a", "b"] });

		expect(sut.shown()).toBe("loaded a,b");
	});
});

class SUT {
	show(reading: Reading<Items>) {
		render(
			<ReadingView
				reading={reading}
				loading={<p>loading</p>}
				failed={<p>failed</p>}
				empty={<p>empty</p>}
				isEmpty={(ok) => ok.items.length === 0}
				loaded={(ok) => <p>loaded {ok.items.join(",")}</p>}
			/>,
		);
	}

	shown() {
		return screen.getByText(/./).textContent;
	}
}
