import {IncomingMessage, ServerResponse} from "http";
import {User} from "../entity/user.dto";
import {StatusCodes} from "http-status-codes";
import {getRequestBody} from "../util/request-data";


export async function createUser(req: IncomingMessage, res: ServerResponse) {
    let body = await getRequestBody(req);
    if (body.name) {
        let newUser = new User();
        newUser.name = body.name;
        await newUser.save();
        if (newUser) {
            res.writeHead(StatusCodes.CREATED, {});
            res.end(JSON.stringify(newUser));
            return;
        }
        res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Could not create new user."
        }));
        return;
    }
    res.writeHead(StatusCodes.BAD_REQUEST, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Parameters required were not provided."
    }));
}

export async function createSpecificUser(req: IncomingMessage, res: ServerResponse) {
    let body = await getRequestBody(req);
    if (!Number.isInteger(Number(req.url?.split("/")[2]))) {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Invalid user id."
        }));
        return;
    }
    if (!body.name) {
        res.writeHead(StatusCodes.BAD_REQUEST, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "Parameters required were not provided."
        }));
        return;
    }
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        res.writeHead(StatusCodes.CONFLICT, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify({
            message: "User already exists."
        }));
        return;
    }
    user = new User();
    user.id = Number(req.url?.split("/")[2]);
    user.name = body.name;
    await user.save();
    res.writeHead(StatusCodes.CREATED, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(user));
}

export async function getAllUsers(req: IncomingMessage, res: ServerResponse) {
    let users = await User.find();
    res.writeHead(StatusCodes.OK, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(users));
}

export async function getUser(req: IncomingMessage, res: ServerResponse) {
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        await user.animeList;
        res.writeHead(StatusCodes.OK, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify(user));
        return;
    }
    res.writeHead(StatusCodes.NOT_FOUND, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Invalid user id."
    }));
}

export async function updateUser(req: IncomingMessage, res: ServerResponse) {
    let body = await getRequestBody(req);
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        if (body.name) {
            user.name = body.name;
        }
        await user.save();
        res.writeHead(StatusCodes.OK, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify(user));
        return;
    }
    res.writeHead(StatusCodes.NOT_FOUND, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Invalid user id."
    }));
}

export async function deleteUser(req: IncomingMessage, res: ServerResponse) {
    let user = await User.findOne(req.url?.split("/")[2]);
    if (user) {
        let entries = await user.animeList;
        if (entries.length != 0) {
            res.writeHead(StatusCodes.METHOD_NOT_ALLOWED, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify({
                message: "User cannot be deleted while his list is not empty."
            }));
            return;
        }
        await user.remove();
        res.writeHead(StatusCodes.OK, {
            "Content-Type": "application/json"
        });
        res.end(JSON.stringify(user));
        return;
    }
    res.writeHead(StatusCodes.NOT_FOUND, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify({
        message: "Invalid user id."
    }));
}