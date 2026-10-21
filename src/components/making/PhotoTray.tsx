import { useState } from "react";
import { usePhotos } from "@/api/ApiContext";
import type {
	Photo,
	Photos,
	PhotosAnswer,
	RejectedFile,
} from "@/api/endpoints/Photos";
import { EmptyNotice } from "@/components/EmptyNotice";
import { FailureNotice } from "@/components/FailureNotice";
import { LoadingNotice } from "@/components/LoadingNotice";
import { PhotoThumbnails } from "@/components/making/PhotoThumbnails";
import { RejectedFiles } from "@/components/making/RejectedFiles";
import { UploadButton } from "@/components/making/UploadButton";
import { ReadingView } from "@/components/ReadingView";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { type Reading, useReading } from "@/lib/useReading";

type ListedPhotos = Extract<PhotosAnswer, { status: "ok" }>;

const listPhotos = (photos: Photos) => photos.list();
const hasNoPhotos = (ok: ListedPhotos) => ok.photos.length === 0;
const showPhotos = (ok: ListedPhotos) => <PhotoThumbnails photos={ok.photos} />;

export function PhotoTray() {
	const photos = usePhotos();
	const [reading, setReading] = useReading(photos, listPhotos);
	const [uploading, setUploading] = useState(false);
	const [uploadFailed, setUploadFailed] = useState(false);
	const [rejected, setRejected] = useState<RejectedFile[]>([]);

	const upload = async (files: File[]) => {
		setUploading(true);
		setUploadFailed(false);
		setRejected([]);
		const answer = await photos.upload(files);
		if (answer.status === "ok") {
			setRejected(answer.rejected);
			setReading((current) => append(current, answer.photos));
		} else {
			setUploadFailed(true);
		}
		setUploading(false);
	};

	let uploadError = null;
	if (uploadFailed) {
		uploadError = (
			<Alert variant="destructive">
				<AlertTitle>No se pudieron subir las fotos</AlertTitle>
			</Alert>
		);
	}

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
			{uploadError}
			<UploadButton uploading={uploading} onChosen={upload} />
		</aside>
	);
}

function append(
	current: Reading<PhotosAnswer>,
	added: Photo[],
): Reading<PhotosAnswer> {
	let next = current;
	if (current !== "loading" && current.status === "ok") {
		next = { status: "ok", photos: [...current.photos, ...added] };
	}
	return next;
}
