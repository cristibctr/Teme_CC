import {IncomingMessage, ServerResponse} from "http";
import {getRequestBody} from "../util/request-data";
import {User} from "../entity/user.dto";
import {Anime} from "../entity/anime.dto";
import {AnimeEntry} from "../entity/anime-entry.dto";
import {StatusCodes} from "http-status-codes";

export async function addAnimeToUserList(req: IncomingMessage, res: ServerResponse) {
    let body = await getRequestBody(req);
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        let theAnime = await Anime.findOne(body.id);
        if (theAnime) {
            let entry = await AnimeEntry.findOne({
                where: {
                    user,
                    anime: theAnime
                }
            });
            if (entry) {
                res.writeHead(StatusCodes.CONFLICT, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    message: "User already has anime in list."
                }));
                return;
            }
            let newEntry = new AnimeEntry();
            newEntry.anime = theAnime;
            newEntry.user = user;
            newEntry.status = body.status || "Plan to watch";
            newEntry.episodesWatched = body.episodesWatched || 0;
            await newEntry.save();
            if (newEntry) {
                res.writeHead(StatusCodes.CREATED, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify(newEntry));
                return;
            }
            res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                message: "Could not add anime to list."
            }));
            return;
        }
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Bad anime id."
        }));
        return;
    }
    res.writeHead(StatusCodes.BAD_REQUEST, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Bad user id."
    }));
}

export async function addSpecificAnimeToUserList(req: IncomingMessage, res: ServerResponse) {
    let body = await getRequestBody(req);
    let newEntry = await AnimeEntry.findOne(req.url?.split("/")[4]);
    if (!Number.isInteger(Number(req.url?.split("/")[4]))) {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Invalid anime entry id."
        }));
        return;
    }
    if (newEntry) {
        res.writeHead(StatusCodes.CONFLICT, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Anime entry already exists."
        }));
        return;
    }
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        let anime = await Anime.findOne(body.id);
        if (anime) {
            let entry = await AnimeEntry.findOne({
                where: {
                    user,
                    anime
                }
            });
            if (entry) {
                res.writeHead(StatusCodes.CONFLICT, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    message: "User already has anime in list."
                }));
                return;
            }
            newEntry = new AnimeEntry();
            newEntry.user = user;
            newEntry.anime = anime;
            newEntry.id = Number(req.url?.split("/")[4]);
            newEntry.status = body.status || "Plan to watch";
            newEntry.episodesWatched = body.episodesWatched || 0;
            await newEntry.save();
            res.writeHead(StatusCodes.CREATED, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(newEntry));
            return;
        }
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Invalid anime id."
        }));
        return;
    }
    res.writeHead(StatusCodes.BAD_REQUEST, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Invalid user id."
    }));
}

export async function getUserAnimeList(req: IncomingMessage, res: ServerResponse) {
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        let animeList = await user.animeList;
        res.writeHead(StatusCodes.OK, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify(animeList));
        return;
    }
    res.writeHead(StatusCodes.NOT_FOUND, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Invalid user id."
    }));
}

export async function getUserAnimeListEntry(req: IncomingMessage, res: ServerResponse) {
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        let animeEntry = await AnimeEntry.findOne({
            where: {
                user,
                id: req.url?.split("/")[4]
            }
        });
        if (animeEntry) {
            res.writeHead(StatusCodes.OK, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(animeEntry));
            return;
        }
        res.writeHead(StatusCodes.NOT_FOUND, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Invalid anime entry id."
        }));
        return;
    }
    res.writeHead(StatusCodes.NOT_FOUND, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Invalid user id."
    }));
}

export async function updateUserAnimeListEntry(req: IncomingMessage, res: ServerResponse) {
    let body = await getRequestBody(req);
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        let entry = await AnimeEntry.findOne({
            where: {
                user,
                id: req.url?.split("/")[4]
            }
        });
        if (entry) {
            if (body.episodesWatched) {
                entry.episodesWatched = body.episodesWatched;
            }
            if (body.status) {
                entry.status = body.status;
            }
            await entry.save();
            res.writeHead(StatusCodes.OK, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(entry));
            return;
        }
        res.writeHead(StatusCodes.NOT_FOUND, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Invalid anime entry id."
        }));
        return;
    }
    res.writeHead(StatusCodes.NOT_FOUND, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Invalid user id."
    }));
}

export async function deleteUserAnimeListEntry(req: IncomingMessage, res: ServerResponse) {
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        let entry = await AnimeEntry.findOne({
            where: {
                user,
                id: req.url?.split("/")[4]
            }
        });
        if (entry) {
            await entry.remove();
            res.writeHead(StatusCodes.OK, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(entry));
            return;
        }
        res.writeHead(StatusCodes.NOT_FOUND, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Invalid anime entry id."
        }));
        return;
    }
    res.writeHead(StatusCodes.NOT_FOUND, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Invalid user id."
    }));
}
