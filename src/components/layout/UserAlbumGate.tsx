import { type ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { useUserAlbums } from "@/api/ApiContext";
import type { UserAlbumAnswer } from "@/api/endpoints/UserAlbums";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { UserAlbumContext } from "@/contexts/UserAlbumContext";
import type { PresentedAlbum } from "@/lib/PresentedAlbum";

type UserAlbumReading = "loading" | UserAlbumAnswer;

export function UserAlbumGate({ children }: { children: ReactNode }) {
	const userAlbums = useUserAlbums();
	const { pathname } = useLocation();
	const [reading, setReading] = useState<UserAlbumReading>("loading");

	useEffect(() => {
		let isCurrent = true;
		setReading("loading");
		userAlbums.get().then((answer) => {
			if (isCurrent) {
				setReading(answer);
			}
		});
		return () => {
			isCurrent = false;
		};
	}, [userAlbums]);

	const adopt = (userAlbum: PresentedAlbum) =>
		setReading({ status: "ok", userAlbum });

	let content = (
		<Alert variant="destructive">
			<AlertTitle>No se pudo cargar el álbum</AlertTitle>
		</Alert>
	);
	let userAlbum: PresentedAlbum | null = null;
	let belongsAt = "/";
	let isAnswered = false;
	if (reading === "loading") {
		content = (
			<p
				role="status"
				aria-label="Cargando álbum"
				className="text-muted-foreground"
			>
				Cargando…
			</p>
		);
	} else if (reading.status === "ok") {
		userAlbum = reading.userAlbum;
		belongsAt = "/confeccion";
		isAnswered = true;
	} else if (reading.code === "USER_ALBUM_NOT_FOUND") {
		isAnswered = true;
	}
	if (isAnswered) {
		let shown = children;
		if (pathname !== belongsAt) {
			shown = <Navigate to={belongsAt} replace />;
		}
		content = (
			<UserAlbumContext.Provider value={{ userAlbum, adopt }}>
				{shown}
			</UserAlbumContext.Provider>
		);
	}
	return content;
}
