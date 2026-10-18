import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAlbums } from "@/api/ApiContext";
import {
	AlbumMaking,
	type AlbumMakingReading,
} from "@/components/making/AlbumMaking";

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
		<main aria-label="Confección" className="flex flex-col gap-4 p-6">
			<AlbumMaking reading={reading} />
		</main>
	);
}
