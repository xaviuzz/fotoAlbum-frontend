import { useAlbums } from "@/api/ApiContext";
import type { Albums } from "@/api/endpoints/Albums";
import { Catalogue } from "@/components/catalogue/Catalogue";
import { useReading } from "@/lib/useReading";

const listAlbums = (albums: Albums) => albums.list();

export function HomePage() {
	const albums = useAlbums();
	const [reading] = useReading(albums, listAlbums);

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
