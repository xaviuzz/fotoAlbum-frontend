import type { ReactNode } from "react";
import { SessionStore } from "@/lib/SessionStore";
import { SessionProvider } from "@/session/SessionContext";
import { FakeStorage } from "./FakeStorage";

export function FreshSession({ children }: { children: ReactNode }) {
	const store = new SessionStore(new FakeStorage());
	return <SessionProvider store={store}>{children}</SessionProvider>;
}
