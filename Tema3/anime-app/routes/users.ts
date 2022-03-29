import {IncomingMessage, ServerResponse} from "http"
import {StatusCodes} from "http-status-codes";
import {createSpecificUser, createUser, deleteUser, getAllUsers, getUser, updateUser} from "../controllers/users";
import {
    addAnimeToUserList,
    addSpecificAnimeToUserList,
    deleteUserAnimeListEntry,
    getUserAnimeList,
    getUserAnimeListEntry,
    updateUserAnimeListEntry
} from "../controllers/anime-entry";
import {methodNotAllowed} from "../util/basic-responses";

export async function usersRouter(req: IncomingMessage, res: ServerResponse) {
    let pathEntries = req.url?.split("/") || [];
    console.log(pathEntries);
    if (req.method == "POST") {
        if (pathEntries.length == 2) {
            createUser(req, res);
            return;
        } else if (pathEntries.length == 3) {
            createSpecificUser(req, res);
            return;
        } else if (pathEntries.length == 4 && pathEntries[3] == "anime") {
            addAnimeToUserList(req, res);
            return;
        } else if (pathEntries.length == 5 && pathEntries[3] == "anime") {
            addSpecificAnimeToUserList(req, res);
            return;
        }
    } else if (req.method == "GET") {
        if (pathEntries.length == 2) {
            getAllUsers(req, res);
            return;
        } else if (pathEntries.length == 3) {
            getUser(req, res);
            return;
        } else if (pathEntries.length == 4 && pathEntries[3] == "anime") {
            getUserAnimeList(req, res);
            return;
        } else if (pathEntries.length == 5 && pathEntries[3] == "anime") {
            getUserAnimeListEntry(req, res);
            return;
        }
    } else if (req.method == "PUT") {
        if (pathEntries.length == 2) {
            methodNotAllowed(req, res);
            return;
        } else if (pathEntries.length == 3) {
            updateUser(req, res);
            return;
        } else if (pathEntries.length == 4 && pathEntries[3] == "anime") {
            methodNotAllowed(req, res);
            return;
        } else if (pathEntries.length == 5 && pathEntries[3] == "anime") {
            updateUserAnimeListEntry(req, res);
            return;
        }
    } else if (req.method == "DELETE") {
        if (pathEntries.length == 2) {
            methodNotAllowed(req, res);
            return;
        } else if (pathEntries.length == 3) {
            deleteUser(req, res);
            return;
        } else if (pathEntries.length == 4 && pathEntries[3] == "anime") {
            methodNotAllowed(req, res);
            return;
        } else if (pathEntries.length == 5 && pathEntries[3] == "anime") {
            deleteUserAnimeListEntry(req, res);
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