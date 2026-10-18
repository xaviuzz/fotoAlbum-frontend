import { useEffect, useState } from "react";
import { useAlbums } from "@/api/ApiContext";
import {
	Catalogue,
	type CatalogueReading,
} from "@/components/catalogue/Catalogue";

export function HomePage() {
	const albums = useAlbums();
	const [reading, setReading] = useState<CatalogueReading>("loading");

	useEffect(() => {
		let isCurrent = true;
		albums.list().then((answer) => {
			if (isCurrent) {
				setReading(answer);
			}
		});
		return () => {
			isCurrent = false;
		};
	}, [albums]);

	return (
		<main
			aria-label="Catálogo"
			className="flex flex-col items-center gap-6 p-6"
		>
			<h2 className="text-2xl font-semibold">Elige un álbum</h2>
			<Catalogue reading={reading} />
		</main>
	);
}
