import type { ReactNode } from "react";
import { Navigate } from "react-router";
import type { UserAlbumAnswer } from "@/api/endpoints/UserAlbums";
import { FailureNotice } from "@/components/FailureNotice";
import { LoadingNotice } from "@/components/LoadingNotice";
import { UserAlbumContext } from "@/contexts/UserAlbumContext";
import type { PresentedAlbum } from "@/domain/album/PresentedAlbum";
import type { Reading } from "@/lib/useReading";

type Showing = {
	children: ReactNode;
	pathname: string;
	adopt: (userAlbum: PresentedAlbum) => void;
};

interface GateStanding {
	show(showing: Showing): ReactNode;
}

class PendingStanding implements GateStanding {
	show() {
		return <LoadingNotice label="Cargando álbum" />;
	}
}

class FailedStanding implements GateStanding {
	show() {
		return <FailureNotice message="No se pudo cargar el álbum" />;
	}
}

class AnsweredStanding implements GateStanding {
	private readonly userAlbum: PresentedAlbum | null;
	private readonly belongsAt: string;

	constructor(userAlbum: PresentedAlbum | null, belongsAt: string) {
		this.userAlbum = userAlbum;
		this.belongsAt = belongsAt;
	}

	show({ children, pathname, adopt }: Showing) {
		let shown = children;
		if (pathname !== this.belongsAt) {
			shown = <Navigate to={this.belongsAt} replace />;
		}
		return (
			<UserAlbumContext.Provider value={{ userAlbum: this.userAlbum, adopt }}>
				{shown}
			</UserAlbumContext.Provider>
		);
	}
}

export function standingOf(reading: Reading<UserAlbumAnswer>): GateStanding {
	let standing: GateStanding = new FailedStanding();
	if (reading === "loading") {
		standing = new PendingStanding();
	} else if (reading.status === "ok") {
		standing = new AnsweredStanding(reading.userAlbum, "/confeccion");
	} else if (reading.code === "USER_ALBUM_NOT_FOUND") {
		standing = new AnsweredStanding(null, "/");
	}
	return standing;
}
