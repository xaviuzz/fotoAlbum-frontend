import { beforeEach, describe, expect, test } from "bun:test";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useReading } from "@/lib/useReading";

describe("useReading", () => {
	let sut: SUT;

	beforeEach(() => {
		sut = new SUT();
	});

	test("is loading until the read answers", () => {
		expect(sut.reading()).toBe("loading");
	});

	test("gives the answer once the read settles", async () => {
		sut.answer("first", "one");

		await waitFor(() => expect(sut.reading()).toBe("one"));
	});

	test("goes back to loading when the source changes", async () => {
		sut.answer("first", "one");
		await waitFor(() => expect(sut.reading()).toBe("one"));

		sut.change("second");

		expect(sut.reading()).toBe("loading");
	});

	test("ignores the answer of a source that was replaced", async () => {
		sut.change("second");

		sut.answer("first", "late");
		sut.answer("second", "current");

		await waitFor(() => expect(sut.reading()).toBe("current"));
	});

	test("takes the reading that is set by hand", async () => {
		sut.answer("first", "one");
		await waitFor(() => expect(sut.reading()).toBe("one"));

		sut.set("edited");

		expect(sut.reading()).toBe("edited");
	});
});

class SUT {
	private readonly pending = new Map<string, (answer: string) => void>();
	private readonly read = (source: string) =>
		new Promise<string>((resolve) => this.pending.set(source, resolve));
	private readonly hook = renderHook(
		(source: string) => useReading(source, this.read),
		{ initialProps: "first" },
	);

	change(source: string) {
		this.hook.rerender(source);
	}

	answer(source: string, answer: string) {
		act(() => this.pending.get(source)?.(answer));
	}

	set(reading: string) {
		act(() => this.hook.result.current[1](reading));
	}

	reading() {
		return this.hook.result.current[0];
	}
}
