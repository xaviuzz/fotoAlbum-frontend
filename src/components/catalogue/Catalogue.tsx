import type { AlbumsAnswer } from "@/api/endpoints/Albums";
import { AlbumRow } from "@/components/catalogue/AlbumRow";
import { EmptyNotice } from "@/components/EmptyNotice";
import { FailureNotice } from "@/components/FailureNotice";
import { LoadingNotice } from "@/components/LoadingNotice";
import { ReadingView } from "@/components/ReadingView";

export type CatalogueReading = "loading" | AlbumsAnswer;

type Albums = Extract<AlbumsAnswer, { status: "ok" }>;

const hasNoAlbums = (ok: Albums) => ok.albums.length === 0;
const showAlbums = (ok: Albums) => <AlbumRow albums={ok.albums} />;

export function Catalogue({ reading }: { reading: CatalogueReading }) {
	return (
		<ReadingView
			reading={reading}
			loading={<LoadingNotice label="Cargando álbumes" />}
			failed={<FailureNotice message="No se pudo cargar el catálogo" />}
			empty={<EmptyNotice message="El catálogo está vacío" />}
			isEmpty={hasNoAlbums}
			loaded={showAlbums}
		/>
	);
}
