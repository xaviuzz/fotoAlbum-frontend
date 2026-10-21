import { createContext, type ReactNode, useContext, useState } from "react";
import type { Session } from "@/domain/session/Session";
import type { SessionStore } from "@/domain/session/SessionStore";

type SessionHandle = {
	session: Session;
	restart: () => void;
};

const SessionContext = createContext<SessionHandle | null>(null);

export function SessionProvider({
	store,
	children,
}: {
	store: SessionStore;
	children: ReactNode;
}) {
	const [session, setSession] = useState(() => {
		const loaded = store.load();
		store.save(loaded);
		return loaded;
	});

	const keep = (next: Session) => {
		store.save(next);
		setSession(next);
	};
	const restart = () => keep(session.startingOver());

	return (
		<SessionContext.Provider value={{ session, restart }}>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const handle = useContext(SessionContext);
	if (handle === null) {
		throw new Error("useSession needs a SessionProvider");
	}
	return handle;
}
