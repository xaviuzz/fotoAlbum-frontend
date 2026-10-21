import type { ReactNode } from "react";
import { SessionProvider } from "@/contexts/SessionContext";
import { SessionStore } from "@/lib/SessionStore";
import { FakeStorage } from "./FakeStorage";

export function FreshSession({ children }: { children: ReactNode }) {
	const store = new SessionStore(new FakeStorage());
	return <SessionProvider store={store}>{children}</SessionProvider>;
}
