import type { RejectedFile } from "@/api/endpoints/Photos";
import { rejectionReasonOf } from "@/lib/rejectionReason";

export function RejectedFiles({ rejected }: { rejected: RejectedFile[] }) {
	let content = null;
	if (rejected.length > 0) {
		const items = [];
		for (const file of rejected) {
			items.push(
				<li key={file.name}>
					{file.name}: {rejectionReasonOf(file.code)}
				</li>,
			);
		}
		content = (
			<ul className="flex flex-col gap-1 text-sm text-destructive">{items}</ul>
		);
	}
	return content;
}
