import { Alert, AlertTitle } from "@/components/ui/alert";

export function FailureNotice({ message }: { message: string }) {
	return (
		<Alert variant="destructive">
			<AlertTitle>{message}</AlertTitle>
		</Alert>
	);
}
