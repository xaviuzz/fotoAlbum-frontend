import { useEffect, useState } from "react";
import { usePhotos } from "@/api/ApiContext";
import type { Photo, PhotosAnswer, RejectedFile } from "@/api/endpoints/Photos";
import { PhotoThumbnails } from "@/components/making/PhotoThumbnails";
import { RejectedFiles } from "@/components/making/RejectedFiles";
import { UploadButton } from "@/components/making/UploadButton";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

type Reading = "loading" | PhotosAnswer;

export function PhotoTray() {
	const photos = usePhotos();
	const [reading, setReading] = useState<Reading>("loading");
	const [uploading, setUploading] = useState(false);
	const [uploadFailed, setUploadFailed] = useState(false);
	const [rejected, setRejected] = useState<RejectedFile[]>([]);

	useEffect(() => {
		let isCurrent = true;
		setReading("loading");
		photos.list().then((answer) => {
			if (isCurrent) {
				setReading(answer);
			}
		});
		return () => {
			isCurrent = false;
		};
	}, [photos]);

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

	let content = (
		<Alert variant="destructive">
			<AlertTitle>No se pudieron cargar las fotos</AlertTitle>
		</Alert>
	);
	if (reading === "loading") {
		content = (
			<p
				role="status"
				aria-label="Cargando fotos"
				className="text-muted-foreground"
			>
				Cargando…
			</p>
		);
	} else if (reading.status === "ok" && reading.photos.length === 0) {
		content = (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Aún no hay fotos</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);
	} else if (reading.status === "ok") {
		content = <PhotoThumbnails photos={reading.photos} />;
	}

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
			<div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
			<RejectedFiles rejected={rejected} />
			{uploadError}
			<UploadButton uploading={uploading} onChosen={upload} />
		</aside>
	);
}

function append(current: Reading, added: Photo[]): Reading {
	let next = current;
	if (current !== "loading" && current.status === "ok") {
		next = { status: "ok", photos: [...current.photos, ...added] };
	}
	return next;
}
