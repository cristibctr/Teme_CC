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
    appNr = req.url.split('/')[3]
    if(urlObj.pathname === "/api/apps")
    {
        var methods = {
            "GET": appsGET,
            "PUT": appsPUT,
            "DELETE": appsDELETE,
            "POST": appsPOST,
            "OPTIONS": OPTIONS
        }
        if(req.method in methods)
            methods[req.method](res, req, appNr, methods);
        else{
            res.writeHead(405, {'Content-Type': 'text/html'})
            res.end("Method not allowed")
        }
    }
    // /api/apps/:id
    else if(urlObj.pathname.includes("/api/apps") && !isNaN(appNr) )
    {
        var methods = {
            "GET": appsIdGET,
            "PUT": appsIdPUT,
            "DELETE": appsIdDELETE,
            "OPTIONS": OPTIONS
        }
        console.log(req.method)
        if(req.method in methods)
            methods[req.method](res, req, appNr, methods);
        else{
            res.writeHead(405, {'Content-Type': 'text/html'})
            res.end("Method not allowed")
        }
    }
    else{
        res.statusCode = 404
        res.end()
    }
});

function appsIdGET(res, req, appNr, methods = {}){
    db.get('SELECT * FROM applications WHERE id = ?', [appNr], (err, row) => {
        if(err){
            console.log(err.message)
            res.statusCode = 500
            res.end()
            return
        }
        if(row == undefined)
        {
            res.statusCode = 404
            res.end()
            return
        }
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(row))
    })
}

function appsIdPUT(res, req, appNr, methods = {}){
    var data = ''
    req.on('data', (chunk) => {
        data += chunk
    })
    req.on('end', () => {
        app = JSON.parse(data)
        if (typeof app === 'object' && !Array.isArray(app) && app !== null && app.name !== undefined && app.version !== undefined && app.company !== undefined)
        {
            db.get('SELECT * FROM applications WHERE name = ?', [app.name], (err, row) => {
                if(err){
                    console.log(err.message)
                }
                if(row != undefined && row.id != appNr)
                {
                    res.writeHead(409, {'Content-Type': 'application/json'});
                    res.end(`{"field" : "name", "message" : "duplicate"}`)
                    return
                }
                db.run("DELETE FROM applications WHERE id=?", [appNr], function(err) {
                    if(err){
                        console.log(err.message)
                        res.statusCode = 500
                        res.end()
                        return
                    }
                    if(this.changes == 0)
                    {
                        res.statusCode = 404
                        res.end()
                        return
                    }
                    var query = `INSERT INTO applications (id, name, version, company
                        ${"app_hash" in app ? ', app_hash' : ''}
                        ${"includes_ads" in app ? ', includes_ads' : ''}
                        ${"downloads" in app ? ', downloads' : ''}) VALUES ( ?, ?, ?, ?
                        ${"app_hash" in app ? ', ?' : ''}
                        ${"includes_ads" in app ? ', ?' : ''}
                        ${"downloads" in app ? ', ?' : ''})`
                    var queryArr = [appNr, app.name, app.version, app.company, app.app_hash, app.includes_ads, app.downloads]
                    queryArr = queryArr.filter(function( element ) {
                        return element !== undefined;
                        });
                    db.run(query, queryArr, (err) => {
                        if(err){
                            if(err.message.includes("UNIQUE"))
                            {
                                res.writeHead(409, {'Content-Type': 'application/json'});
                                res.end(`{"field" : "name", "message" : "duplicate"}`)
                                return
                            }
                            console.log(err.message)
                            res.statusCode = 500
                            res.end()
                            return
                        }
                        res.statusCode = 200
                        res.end()
                    })
                })
            })
        }
        else{
            res.writeHead(400, {'Content-Type': 'text/html'});
            res.end(`wrong format`)
        }
    })
}

function appsIdDELETE(res, req, appNr, methods = {}){
    db.run(`DELETE FROM applications WHERE id=?`, [appNr], (err) =>{
        if(err){
            console.log(err.message)
            res.statusCode = 500
            res.end()
            return
        }
        res.statusCode = 200
        res.end()
    })
}

function OPTIONS(res, req, appNr, methods){
    res.writeHead(200, {'Content-Type': 'text/html', 'Allow': Object.keys(methods).join(', ')})
    res.end('', 'utf-8')
}

function appsGET(res, req, appNr, methods){
    var urlObj = url.parse(req.url, true);
    var queryObject = urlObj.query;
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

function appsPOST(res, req, appNr, methods){
    var data = '';
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
            var queryArr = [app.name, app.version, app.company, app.app_hash, app.includes_ads, app.downloads]
            queryArr = queryArr.filter(function( element ) {
                    return element !== undefined;
                    });
            db.run(query, queryArr, function(err) {
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

function appsPUT(res, req, appNr, methods){
    var data = ''
    req.on('data', (chunk) => {
        data += chunk
    })
    req.on('end', () => {
        apps = JSON.parse(data)
        if(!Array.isArray(apps))
        {
            res.writeHead(400, {'Content-Type': 'text/html'});
            res.end(`wrong format`)
            return
        }
        for(var app of apps){
            if(app.name == undefined || app.version == undefined || app.company == undefined)
            {
                console.log(app)
                res.writeHead(400, {'Content-Type': 'text/html'});
                res.end(`wrong format`)
                return
            }
        }
        db.serialize(() => {
            db.run('DELETE FROM applications', (err) => {
                if(err){
                    console.log(err.message)
                    res.statusCode = 500
                    res.end()
                    return
                }
            })
            for(var app of apps){
                var query = `INSERT INTO applications (name, version, company
                    ${"app_hash" in app ? ', app_hash' : ''}
                    ${"includes_ads" in app ? ', includes_ads' : ''}
                    ${"downloads" in app ? ', downloads' : ''}) VALUES (?, ?, ?
                    ${"app_hash" in app ? ', ?' : ''}
                    ${"includes_ads" in app ? ', ?' : ''}
                    ${"downloads" in app ? ', ?' : ''})`
                var queryArr = [app.name, app.version, app.company, app.app_hash, app.includes_ads, app.downloads]
                queryArr = queryArr.filter(function( element ) {
                        return element !== undefined;
                        });
                db.run(query, queryArr, (err) => {
                    if(err){
                        console.log(err.message)
                        res.statusCode = 500
                        res.end()
                        return
                    }
                })
            }
            res.statusCode = 200
            res.end()
        })
    })
}

function appsDELETE(res, req, appNr, methods){
    db.run(`DELETE FROM applications`, (err) =>{
        if(err){
            console.log(err.message)
            res.statusCode = 500
            res.end()
            return
        }
        res.statusCode = 200
        res.end()
    })
}

server.listen(port, hostname, () => {
    db = dbConnect.getConnection()
    console.log(`Server running at http://${hostname}:${port}/`)
})

process.on('SIGINT', () => {
    dbConnect.closeConnection(db)
    server.close()
})
