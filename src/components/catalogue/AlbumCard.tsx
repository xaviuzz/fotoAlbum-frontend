import { useState } from "react";
import { useNavigate } from "react-router";
import { useUserAlbums } from "@/api/ApiContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUserAlbum } from "@/contexts/UserAlbumContext";
import type { PresentedAlbum } from "@/lib/PresentedAlbum";

export function AlbumCard({
	album,
	onFailure,
}: {
	album: PresentedAlbum;
	onFailure: () => void;
}) {
	const userAlbums = useUserAlbums();
	const { adopt } = useCurrentUserAlbum();
	const navigate = useNavigate();
	const [isCreating, setIsCreating] = useState(false);

	const create = async () => {
		setIsCreating(true);
		const answer = await userAlbums.create(album.reference);
		if (answer.status === "ok") {
			adopt(answer.userAlbum);
			navigate("/confeccion");
		} else {
			onFailure();
			setIsCreating(false);
		}
	};

	return (
		<button
			type="button"
			className="w-full text-left disabled:opacity-50"
			disabled={isCreating}
			onClick={create}
		>
			<Card className="h-full">
				<CardHeader>
					<CardTitle>{album.commercialName}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col">
					<span>{album.albumSizeLabel()}</span>
					<span>{album.pageCount} páginas</span>
					<span>{album.bindingLabel()}</span>
				</CardContent>
			</Card>
		</button>
	);
}
