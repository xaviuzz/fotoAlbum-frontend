import { usePhotos } from "@/api/ApiContext";
import type { Photos, PhotosAnswer } from "@/api/endpoints/Photos";
import { EmptyNotice } from "@/components/EmptyNotice";
import { FailureNotice } from "@/components/FailureNotice";
import { LoadingNotice } from "@/components/LoadingNotice";
import { PhotoThumbnails } from "@/components/making/photos/PhotoThumbnails";
import { RejectedFiles } from "@/components/making/photos/RejectedFiles";
import { UploadButton } from "@/components/making/photos/UploadButton";
import { UploadFailure } from "@/components/making/photos/UploadFailure";
import { useUpload } from "@/components/making/photos/useUpload";
import { ReadingView } from "@/components/ReadingView";
import { useReading } from "@/lib/useReading";

type ListedPhotos = Extract<PhotosAnswer, { status: "ok" }>;

const listPhotos = (photos: Photos) => photos.list();
const hasNoPhotos = (ok: ListedPhotos) => ok.photos.length === 0;
const showPhotos = (ok: ListedPhotos) => <PhotoThumbnails photos={ok.photos} />;

export function PhotoTray() {
	const photos = usePhotos();
	const [reading, setReading] = useReading(photos, listPhotos);
	const { uploading, uploadFailed, rejected, upload } = useUpload(
		photos,
		setReading,
	);

	return (
		<aside
			aria-label="Mis fotos"
			className="flex h-full min-h-0 flex-col gap-3"
		>
			<h2 className="text-lg font-semibold">Mis fotos</h2>
			<div className="min-h-0 flex-1 overflow-y-auto">
				<ReadingView
					reading={reading}
					loading={<LoadingNotice label="Cargando fotos" />}
					failed={<FailureNotice message="No se pudieron cargar las fotos" />}
					empty={<EmptyNotice message="Aún no hay fotos" />}
					isEmpty={hasNoPhotos}
					loaded={showPhotos}
				/>
			</div>
			<RejectedFiles rejected={rejected} />
			<UploadFailure failed={uploadFailed} />
			<UploadButton uploading={uploading} onChosen={upload} />
		</aside>
	);
}
