import * as http from "http";
import * as router from "./routes";
import {createConnection, getConnectionOptions} from "typeorm";

getConnectionOptions().then(async conOpts => {
    const conn = await createConnection(conOpts);
    let server = http.createServer(async (req, res) => {
        router.route(req, res);
    });

    server.listen(3212, "0.0.0.0", () => {
        console.log("listening");
    });

});
