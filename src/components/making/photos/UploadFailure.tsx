import { Alert, AlertTitle } from "@/components/ui/alert";

export function UploadFailure({ failed }: { failed: boolean }) {
	let content = null;
	if (failed) {
		content = (
			<Alert variant="destructive">
				<AlertTitle>No se pudieron subir las fotos</AlertTitle>
			</Alert>
		);
	}
	return content;
}
