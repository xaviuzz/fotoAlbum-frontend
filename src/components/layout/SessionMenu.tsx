import { useState } from "react";
import { RestartDialog } from "@/components/layout/RestartDialog";
import { SessionAvatar } from "@/components/layout/SessionAvatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/contexts/SessionContext";

export function SessionMenu() {
	const { session, restart } = useSession();
	const [isAsking, setIsAsking] = useState(false);

	function askToRestart() {
		setIsAsking(true);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SessionAvatar session={session} />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuGroup>
						<DropdownMenuItem onSelect={askToRestart}>
							Volver a empezar
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<RestartDialog
				open={isAsking}
				onOpenChange={setIsAsking}
				onConfirm={restart}
			/>
		</>
	);
}
