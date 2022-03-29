import {IncomingMessage, ServerResponse} from "http";
import {createAnime, createSpecificAnime, deleteAnime, getAllAnime, getAnime, updateAnime} from "../controllers/anime";
import {StatusCodes} from "http-status-codes";
import {methodNotAllowed} from "../util/basic-responses";

export async function animeRouter(req: IncomingMessage, res: ServerResponse) {
    let pathEntries = req.url?.split("/") || [];
    console.log(pathEntries);
    if (req.method == "POST") {
        if (pathEntries.length == 2) {
            createAnime(req, res);
            return;
        } else if (pathEntries.length == 3) {
            createSpecificAnime(req, res);
            return;
        }
    } else if (req.method == "GET") {
        if (pathEntries.length == 2) {
            getAllAnime(req, res);
            return;
        } else if (pathEntries.length == 3) {
            getAnime(req, res);
            return;
        }
    } else if (req.method == "PUT") {
        if (pathEntries.length == 2) {
            methodNotAllowed(req, res);
            return;
        } else if (pathEntries.length == 3) {
            updateAnime(req, res);
            return;
        }
    } else if (req.method == "DELETE") {
        if (pathEntries.length == 2) {
            methodNotAllowed(req, res);
            return;
        } else if (pathEntries.length == 3) {
            deleteAnime(req, res);
            return;
        }
    }
    res.writeHead(StatusCodes.BAD_REQUEST, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Bad path/verb used."
    }));
}