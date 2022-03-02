var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var globalT;
var log_file = fs.createWriteStream('api.log', { flags: 'a' });

http.createServer(function (request, response) {
    console.log('request ', request.url);

    var filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './index.html';
        fs.readFile(filePath, function(error, content){
            response.writeHead(200, { 'Content-Type':  'text/html'});
            response.end(content, 'utf-8');
        })
        return
    }

    if(filePath.includes(".css"))
    {
        fs.readFile(filePath, function(error, content){
            response.writeHead(200, { 'Content-Type':  'text/css'});
            response.end(content, 'utf-8');
        })
        return
    }

    if(filePath.includes(".png"))
    {
        var s = fs.createReadStream(filePath);
        s.on('open', function () {
            response.setHeader('Content-Type', 'image/png');
            s.pipe(response);
        });
        s.on('error', function () {
            response.setHeader('Content-Type', 'text/plain');
            response.statusCode = 404;
            response.end('Not found');
        });
        return
    }

    if (filePath == './metrics' && request.method == "GET") {
        filePath = './metrics.html';
        fs.readFile(filePath, function(error, content){
            response.writeHead(200, { 'Content-Type':  'text/html'});
            response.end(content, 'utf-8');
        })
        return
    }

    if (filePath == './api/metrics' && request.method == "GET") {
        response.setHeader('Content-Type', 'application/json');
        var datesArr = [], apiLatency = new Map(), apiLatencyNr = new Map(), hours = {}, errPerHour = {};
        for(var i = 0; i < 24; i ++)
            hours[i] = 0;
        fs.readFile("api.log", "utf8", (err, data) => {
            data.split(/\r?\n/).forEach(line => {
                parsedLogs = parseLogs(line)
                if(parsedLogs.length == 1) return;
                datesArr.push(parsedLogs[1]);

                msLatency = +parsedLogs[3].split(" ")[1]
                if(!apiLatency.has(parsedLogs[2].trim())) {
                    apiLatency.set(parsedLogs[2].trim(), 0);
                    apiLatencyNr.set(parsedLogs[2].trim(), 0);
                }
                apiLatency.set(parsedLogs[2].trim(), apiLatency.get(parsedLogs[2].trim()) + msLatency);
                apiLatencyNr.set(parsedLogs[2].trim(), apiLatencyNr.get(parsedLogs[2].trim()) + 1);
                
                var today = new Date();
                today.setHours(0);
                today.setMinutes(0);
                today.setSeconds(0);
                logDate = new Date(parsedLogs[1].trim());
                if(!errPerHour.hasOwnProperty(parsedLogs[2].trim())) {
                    errPerHour[parsedLogs[2].trim()] = {}
                    Object.assign(errPerHour[parsedLogs[2].trim()], hours)
                }
                if(!parsedLogs[4].includes("200") && logDate >= today) {
                    errPerHour[parsedLogs[2].trim()][logDate.getHours()] += 1;
                }
            })
            for(api of apiLatency.keys())
            {
                apiLatency.set(api, (apiLatency.get(api) / apiLatencyNr.get(api)))
            }
            var reqPerH = averagePerHour(datesArr)
            var tAvg = timeAverage(datesArr)
            // console.log(errPerHour)
            // console.log(apiLatency)
            // console.log(tAvg)
            // console.log(reqPerH)
            var jsonResponse = {
                api_latency: Object.fromEntries(apiLatency),
                req_per_hour: Object.fromEntries(reqPerH),
                api_errors: errPerHour,
                time_avg: tAvg
            }
            response.end(JSON.stringify(jsonResponse), 'utf-8');
        })
        return
    }
    
    if(filePath == "./api" && request.method == "GET")
    {
        globalT = performance.now();
        fs.readFile("auth.env", (err, data) => {
            if(err) console.error(err);
            else
            {
                catFacts(data, response);
            }
        })
        return
    }
    
    response.statusCode = 404;
    response.end('Not found');

    // var mimeTypes = {
    //     '.html': 'text/html',
    //     '.js': 'text/javascript',
    //     '.css': 'text/css',
    //     '.json': 'application/json',
    //     '.png': 'image/png',
    //     '.jpg': 'image/jpg',
    //     '.gif': 'image/gif',
    //     '.svg': 'image/svg+xml',
    //     '.wav': 'audio/wav',
    //     '.mp4': 'video/mp4',
    //     '.woff': 'application/font-woff',
    //     '.ttf': 'application/font-ttf',
    //     '.eot': 'application/vnd.ms-fontobject',
    //     '.otf': 'application/font-otf',
    //     '.wasm': 'application/wasm'
    // };

}).listen(8001);
console.log('Server running at http://127.0.0.1:8001/');

function catFacts(authToken, response)
{
    var options = {
        hostname: 'cat-fact.herokuapp.com',
        port: 443,
        path: '/facts',
        method: 'GET'
    }
    
    var req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        
        var body = '';

        res.on('data', chunk => {
            body = body + chunk;
        })

        res.on('end', () => {
            var today = new Date();
            var time = today.toISOString();
            log_file.write("> " + time + " | " + options.hostname + " | " + String(performance.now() - globalT) + " milliseconds " + " | " + "Status " + String(res.statusCode) + " | " + JSON.stringify(options) + " | " + body.replace(/(\r\n|\n|\r)/gm, "") + "\n")
            if(String(res.statusCode) != "200") return
            responseJSON = JSON.parse(body);
            var text = responseJSON[Math.floor(Math.random() * 5)].text;
            console.log(text);
            globalT = performance.now();
            imageQuery(authToken, text, response);
        })
    })
    req.on('error', error => {
        console.error(error)
    })
    req.end()
}

function imageQuery(authToken, text, response)
{
    var options = {
        hostname: 'api.pexels.com',
        port: 443,
        path: '/v1/search?query=people&per_page=11',
        method: 'GET',
        headers : {"Authorization" : authToken}
    }
    
    var optWithoutToken = JSON.parse(JSON.stringify(options))
    optWithoutToken.headers.Authorization = ""

    var req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(`Requests remaining this month: ${res.headers["x-ratelimit-remaining"]}`)
        
        var body = '';

        res.on('data', chunk => {
            body = body + chunk;
        })

        res.on('end', () => {
            var today = new Date();
            var time = today.toISOString();
            log_file.write("> " + time + " | " + options.hostname + " | " + String(performance.now() - globalT) + " milliseconds " + " | " + "Status " + String(res.statusCode) + " | " + JSON.stringify(optWithoutToken) + " | " + body.replace(/(\r\n|\n|\r)/gm, "") + "\n")
            if(String(res.statusCode) != "200") return
            responseJSON = JSON.parse(body);
            var image_url = responseJSON.photos[Math.floor(Math.random() * 10)].src.medium
            globalT = performance.now();
            combineImage(image_url, text, response)
        })
    })
    req.on('error', error => {
        console.error(error)
    })
    req.end()
}

function combineImage(image_url, text, response)
{
    var path = '/image?image_url=' + encodeURIComponent(image_url) + '&text=' + encodeURIComponent(text) + '&overlay_color=#0000008e&text_color=#ffffffff&text_size=16';
    var options = {
        hostname: 'textoverimage.moesif.com',
        port: 443,
        path: path,
        method: 'GET'
    }
    data = {
        "image_url": image_url,
        "text" : text,
        "overlay_color": "#0000008e",
        "text_color": "#ffffffff",
        "text_size": 16
    }
    var fileName = "file" + crypto.createHash('md5').update(text + String(Math.floor(Math.random() * 1000))).digest('hex') + ".png";
    var file = fs.createWriteStream(fileName);

    var req = https.get(options, res => {
        res.pipe(file);
        res.on('end', ()=>{
            //return "/" + fileName
            var today = new Date();
            var time = today.toISOString();
            log_file.write("> " + time + " | " + options.hostname + " | " + String(performance.now() - globalT) + " milliseconds " + " | " + "Status " + String(res.statusCode) + " | " + JSON.stringify(data) + "\n")
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(JSON.stringify({"status" : "success", "combined_path" : "/" + fileName}), 'utf-8');
        })
    })
    req.on('error', error => {
        console.error(error)
    })
    req.end()
}

function parseLogs(logs)
{
    return logs.split(/[>|\|]/);
}

function timeAverage(dateArrayStr)
{
    var totalSum = 0;
    for(var i = 0; i < dateArrayStr.length-1; i++)
    {
        firstDate = new Date(dateArrayStr[i].trim())
        secondDate = new Date(dateArrayStr[i+1].trim())
        totalSum += secondDate - firstDate
    }
    return totalSum / (dateArrayStr.length - 1)
}

function averagePerHour(dateArrayStr)
{
    var totalPerHour = new Map();
    for(var i = dateArrayStr.length-1; i > 0; i--)
    {
        firstDate = new Date(dateArrayStr[i-1].trim())
        secondDate = new Date(dateArrayStr[i].trim())
        if(!sameDay(firstDate, secondDate)) break;
        if(firstDate.getHours() != secondDate.getHours()) {
            continue;
        }
        if(!totalPerHour.has(firstDate.getHours())) totalPerHour.set(firstDate.getHours(), 1)
        totalPerHour.set(firstDate.getHours(), totalPerHour.get(firstDate.getHours()) + 1);
    }
    return totalPerHour
}

function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }