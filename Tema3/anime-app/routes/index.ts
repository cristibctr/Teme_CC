import * as http from "http"
import {StatusCodes} from "http-status-codes"
import {usersRouter} from "./users"
import {animeRouter} from "./anime";

export function route(req: http.IncomingMessage, res: http.ServerResponse) {
    if (req.url?.startsWith("/users")) {
        usersRouter(req, res);
    } else if (req.url?.startsWith("/anime")) {
        animeRouter(req, res);
    } else if (req.url == "/" && req.method == "GET") {
        res.writeHead(StatusCodes.OK, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify([
            {
                "route": "/users",
                "methods": [
                    "GET", "POST"
                ]
            },
            {
                "route": "/users/{userId}",
                "methods": [
                    "GET", "PUT", "DELETE"
                ]
            },
            {
                "route": "/users/{userId}/anime",
                "methods": [
                    "GET", "POST"
                ]
            },
            {
                "route": "/users/{userId}/anime/{animeId}",
                "methods": [
                    "GET", "PUT", "DELETE"
                ]
            },
            {
                "route": "/anime",
                "methods": [
                    "GET", "POST"
                ]
            },
            {
                "route": "/anime/{animeId}",
                "methods": [
                    "GET", "PUT", "DELETE"
                ]
            }
        ]));
    } else {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            "message": "No such address available."
        }));
    }
}