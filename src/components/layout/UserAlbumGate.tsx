import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { useUserAlbums } from "@/api/ApiContext";
import type { UserAlbums } from "@/api/endpoints/UserAlbums";
import { standingOf } from "@/components/layout/GateStanding";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import { useReading } from "@/lib/useReading";

const getUserAlbum = (userAlbums: UserAlbums) => userAlbums.get();

export function UserAlbumGate({ children }: { children: ReactNode }) {
	const userAlbums = useUserAlbums();
	const { pathname } = useLocation();
	const [reading, setReading] = useReading(userAlbums, getUserAlbum);

	const adopt = (userAlbum: PresentedAlbum) =>
		setReading({ status: "ok", userAlbum });

	const standing = standingOf(reading);
	return <>{standing.show({ children, pathname, adopt })}</>;
}
