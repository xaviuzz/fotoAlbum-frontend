import { UserIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Session } from "@/domain/session/Session";

type SessionAvatarProps = ComponentProps<"button"> & {
	session: Session;
};

export function SessionAvatar({ session, ...buttonProps }: SessionAvatarProps) {
	return (
		<Button
			variant="ghost"
			size="icon"
			className="ml-auto rounded-full"
			aria-label="Sesión anónima"
			{...buttonProps}
		>
			<Avatar role="img" style={{ backgroundColor: session.avatarColor() }}>
				<AvatarFallback className="bg-transparent text-white">
					<UserIcon />
				</AvatarFallback>
			</Avatar>
		</Button>
	);
}
