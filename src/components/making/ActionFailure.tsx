import { Alert, AlertTitle } from "@/components/ui/alert";

export function ActionFailure({
	failed,
	message,
}: {
	failed: boolean;
	message: string;
}) {
	let content = null;
	if (failed) {
		content = (
			<Alert variant="destructive">
				<AlertTitle>{message}</AlertTitle>
			</Alert>
		);
	}
	return content;
}
