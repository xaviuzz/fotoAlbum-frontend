import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export function EmptyNotice({ message }: { message: string }) {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>{message}</EmptyTitle>
			</EmptyHeader>
		</Empty>
	);
}
