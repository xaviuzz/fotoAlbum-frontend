import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAlbums } from "@/api/ApiContext";
import {
	AlbumMaking,
	type AlbumMakingReading,
} from "@/components/making/AlbumMaking";
import { PhotoTray } from "@/components/making/PhotoTray";

export function MakingPage() {
	const { reference = "" } = useParams();
	const albums = useAlbums();
	const [reading, setReading] = useState<AlbumMakingReading>("loading");

	useEffect(() => {
		let isCurrent = true;
		setReading("loading");
		albums.get(reference).then((answer) => {
			if (isCurrent) {
				setReading(answer);
			}
		});
		return () => {
			isCurrent = false;
		};
	}, [albums, reference]);

	return (
		<main
			aria-label="Confección"
			className="flex h-[calc(100svh-4rem)] gap-4 p-6"
		>
			<div className="w-1/4 min-w-0">
				<PhotoTray />
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-4">
				<AlbumMaking reading={reading} />
			</div>
		</main>
	);
}
