import type { Client } from "openapi-fetch";
import type { ApiAnswer } from "@/api/rpc/ApiAnswer";
import type { ApiErrorCode } from "@/api/rpc/ApiErrorCode";
import type { components, paths } from "@/api/schema";
import type { Session } from "@/lib/Session";

type ErrorBody = components["schemas"]["ErrorBody"];
type CallHeader = ReturnType<Session["callHeader"]>;
type Sending<Body> = (
	client: Client<paths>,
	header: CallHeader,
) => Promise<{ data?: { body: Body } }>;

export class CallSender {
	private readonly client: Client<paths>;
	private readonly session: Session;

	constructor(client: Client<paths>, session: Session) {
		this.client = client;
		this.session = session;
	}

	async send<OkBody extends object, Ok extends object>(
		sending: Sending<OkBody | ErrorBody>,
		readOk: (body: OkBody) => Ok,
	): Promise<ApiAnswer<Ok>> {
		let answer: ApiAnswer<Ok> = this.failure("INTERNAL_ERROR");
		try {
			const header = this.session.callHeader(crypto.randomUUID());
			const reply = await sending(this.client, header);
			const body = reply.data?.body;
			if (body) {
				answer = this.answerOf(body, readOk);
			}
		} catch {
			answer = this.failure("INTERNAL_ERROR");
		}
		return answer;
	}

	private answerOf<OkBody extends object, Ok extends object>(
		body: OkBody | ErrorBody,
		readOk: (body: OkBody) => Ok,
	): ApiAnswer<Ok> {
		let answer: ApiAnswer<Ok> = this.failure("INTERNAL_ERROR");
		if (this.isError(body)) {
			answer = this.failure(body.code);
		} else {
			answer = { status: "ok", ...readOk(body) };
		}
		return answer;
	}

	private isError(body: object): body is ErrorBody {
		return "code" in body;
	}

	private failure(code: ApiErrorCode): { status: "error"; code: ApiErrorCode } {
		return { status: "error", code };
	}
}
