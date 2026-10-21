import { type Dispatch, type SetStateAction, useState } from "react";
import type {
	Photo,
	Photos,
	PhotosAnswer,
	RejectedFile,
} from "@/api/endpoints/Photos";
import type { Reading } from "@/lib/useReading";

type SetReading = Dispatch<SetStateAction<Reading<PhotosAnswer>>>;

export function useUpload(photos: Photos, setReading: SetReading) {
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

	return { uploading, uploadFailed, rejected, upload };
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
