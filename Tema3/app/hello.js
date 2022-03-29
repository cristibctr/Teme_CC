let http = require('http');

const HTTP_OK   = 200;
const PORT      = 80;

console.log(`INFO\tStarting server which will listen at port ${PORT}...`);

http.createServer((req, res) => {
    let address = req.socket.address();
    console.log(`INFO\tGot connection from (${address.address}, ${address.port})`);

    res.writeHead(HTTP_OK, {
        'Content-Type': 'text/html'
    });

    res.end(`
    <!DOCTYPE html>
    <html>
        <head>
            <title>Whoa! You found me!</title>
        </head>

        <body style="background-color: black">
            <h1 style="color: white" align="center">Hello, whoever you are!</h1>
        </body>
    </html>
    `);
}).listen(PORT);
