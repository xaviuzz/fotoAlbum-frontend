import { HealthMark } from "@/components/layout/HealthMark";

export function Header() {
	return (
		<header className="flex items-center gap-2 border-b p-4">
			<h1 className="text-xl font-semibold">fotoAlbum</h1>
			<HealthMark />
		</header>
	);
}
