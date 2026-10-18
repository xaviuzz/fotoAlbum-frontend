import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "@/session/SessionContext";

export function SessionGate({ children }: { children: ReactNode }) {
	const { session } = useSession();
	const { pathname } = useLocation();
	const belongsAt = session.path();

	let content = children;
	if (pathname !== belongsAt) {
		content = <Navigate to={belongsAt} replace />;
	}
	return content;
}
