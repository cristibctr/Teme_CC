import {IncomingMessage} from "http";

export async function getRequestBody(req: IncomingMessage) {
    const buffers = []
    for await (const chunk of req) {
        buffers.push(chunk);
    }
    try {
        return JSON.parse(Buffer.concat(buffers).toString());
    } catch (e) {
        return {};
    }
}