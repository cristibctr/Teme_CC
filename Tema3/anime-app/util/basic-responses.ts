import {IncomingMessage, ServerResponse} from "http";
import {StatusCodes} from "http-status-codes";

export async function methodNotAllowed(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(StatusCodes.METHOD_NOT_ALLOWED, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Method shouldn't be invoked over this resource."
    }));
}