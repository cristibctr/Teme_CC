const http = require('http');
const axios = require('axios');
const dbConnect = require('./dbConnect');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;
var db

const server = http.createServer((req, res) => {
    console.log('request ', req.url);
    var urlObj = url.parse(req.url, true);
    var queryObject = urlObj.query;
    if(urlObj.pathname === "/api/apps")
    {
        if(req.method === "GET")
        {
            var apps = []
            page = queryObject.page == null ? undefined : queryObject.page * 5
            query = queryObject.page == null ? 'SELECT id, name, company, downloads FROM applications' : `SELECT id, name, company, downloads FROM applications limit 5 offset ?`
            db.serialize(()=>{
                db.each(query, [page] , (err, row) => {
                    if(err){
                        console.log(err.message)
                    }
                    apps.push(row)
                }, () => {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(apps))
                })
            })
        }
        else if(req.method === "POST")
        {
            //Create user and return user profile link
            var data = ''
            req.on('data', (chunk) => {
                data += chunk
            })
            req.on('end', () => {
                app = JSON.parse(data)
                if (typeof app === 'object' && !Array.isArray(app) && app !== null && app.name !== undefined && app.version !== undefined && app.company !== undefined)
                {
                    query = `INSERT INTO applications (name, version, company
                        ${"app_hash" in app ? ', app_hash' : ''}
                        ${"includes_ads" in app ? ', includes_ads' : ''}
                        ${"downloads" in app ? ', downloads' : ''}) VALUES (?, ?, ?
                        ${"app_hash" in app ? ', ?' : ''}
                        ${"includes_ads" in app ? ', ?' : ''}
                        ${"downloads" in app ? ', ?' : ''})`
                    db.run(query, [app.name, app.version, app.company, app.app_hash, app.includes_ads, app.downloads], function(err) {
                        if(err){
                            if(err.message.includes('UNIQUE'))
                            {
                                res.writeHead(409, {'Content-Type': 'application/json'});
                                res.end(`{"field" : "name", "message" : "duplicate"}`)
                            }
                            else{
                                console.log(err.message)
                                res.statusCode = 500
                                res.end()
                            }
                        }
                        else{
                            //res.statusCode = 201
                            res.writeHead(201, {'Location': `/api/apps/${this.lastID}`})
                            res.end()
                        }
                    })

                }
                else{
                    res.statusCode = 400
                    res.end()
                }
            })
        }
        else{
            res.writeHead(405, {'Content-Type': 'text/html'});
            res.end("Method not allowed")
        }
    }

    // /api/apps/:id
    appNr = req.url.split('/')[3]
    if(urlObj.pathname.includes("/api/apps") && !isNaN(appNr) )
    {
        if(req.method === "GET")
        {
            db.get('SELECT * FROM applications WHERE id = ?', [appNr], (err, row) => {
                if(err){
                    console.log(err.message)
                }
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(row))
            })
        }
    }
});

server.listen(port, hostname, () => {
    db = dbConnect.getConnection()
    console.log(`Server running at http://${hostname}:${port}/`)
})

process.on('SIGINT', () => {
    dbConnect.closeConnection(db)
    server.close()
})
