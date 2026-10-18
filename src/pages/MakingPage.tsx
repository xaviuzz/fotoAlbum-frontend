import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
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
			<Link to="/" className="text-primary underline">
				Volver al catálogo
			</Link>
		</main>
	);
}
