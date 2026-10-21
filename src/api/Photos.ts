import type { ApiAnswer } from "@/api/ApiAnswer";
import type { CallSender } from "@/api/CallSender";
import type { components } from "@/api/schema";

export type Photo = components["schemas"]["Photo"];
export type RejectedFile = components["schemas"]["RejectedFile"];

export type PhotosAnswer = ApiAnswer<{ photos: Photo[] }>;

export type UploadAnswer = ApiAnswer<{
	photos: Photo[];
	rejected: RejectedFile[];
}>;

export class Photos {
	private readonly sender: CallSender;

	constructor(sender: CallSender) {
		this.sender = sender;
	}

	list(): Promise<PhotosAnswer> {
		return this.sender.send(
			(client, header) => client.POST("/photo.list", { body: { header } }),
			(body) => ({ photos: body.photos }),
		);
	}

	upload(files: File[]): Promise<UploadAnswer> {
		return this.sender.send(
			(client, header) =>
				client.POST("/photo.upload", {
					body: { ...header, files: [] },
					bodySerializer: () => this.formOf(header, files),
				}),
			(body) => ({ photos: body.photos, rejected: body.rejected }),
		);
	}

	private formOf(header: { callId: string; sessionId: string }, files: File[]) {
		const form = new FormData();
		form.append("callId", header.callId);
		form.append("sessionId", header.sessionId);
		for (const file of files) {
			form.append("files", file);
		}
		return form;
	}
}
