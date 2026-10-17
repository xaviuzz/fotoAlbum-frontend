import type { HealthCheck } from "@/api/HealthCheck";
import { HealthMark } from "@/components/HealthMark";

export function Header({ healthCheck }: { healthCheck: HealthCheck }) {
	return (
		<header className="flex items-center gap-2 border-b p-4">
			<h1 className="text-xl font-semibold">fotoAlbum</h1>
			<HealthMark healthCheck={healthCheck} />
		</header>
	);
}
