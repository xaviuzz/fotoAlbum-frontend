import type { ReactNode } from "react";
import type { ApiAnswer } from "@/api/rpc/ApiAnswer";
import type { Reading } from "@/lib/useReading";

export function ReadingView<Ok extends object>({
	reading,
	loading,
	failed,
	empty,
	isEmpty,
	loaded,
}: {
	reading: Reading<ApiAnswer<Ok>>;
	loading: ReactNode;
	failed: ReactNode;
	empty: ReactNode;
	isEmpty: (ok: Ok) => boolean;
	loaded: (ok: Ok) => ReactNode;
}) {
	let content = failed;
	if (reading === "loading") {
		content = loading;
	} else if (reading.status === "ok" && isEmpty(reading)) {
		content = empty;
	} else if (reading.status === "ok") {
		content = loaded(reading);
	}
	return <>{content}</>;
}
