import { UserIcon } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="ml-auto rounded-full"
						aria-label="Sesión anónima"
					>
						<Avatar
							role="img"
							style={{ backgroundColor: session.avatarColor() }}
						>
							<AvatarFallback className="bg-transparent text-white">
								<UserIcon />
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuGroup>
						<DropdownMenuItem onSelect={() => setIsAsking(true)}>
							Volver a empezar
						</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</DropdownMenu>
			<AlertDialog open={isAsking} onOpenChange={setIsAsking}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Volver a empezar?</AlertDialogTitle>
						<AlertDialogDescription>
							Se olvidará el álbum elegido y empezarás con una sesión nueva.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={restart}>Confirmar</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
