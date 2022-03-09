const sqlite3 = require('sqlite3').verbose()
const fs = require("fs")

const dataSql = fs.readFileSync("./applications.sql").toString()
const dataArr = dataSql.toString().split(");")

module.exports = {
    getConnection: function () {
        var db = new sqlite3.Database(':memory:', (err)=>{
            if(err){
                console.log(err.message)
            }
            console.log('connected to the sqlite db')
        })
        db.serialize(() => {
            db.run("PRAGMA foreign_keys=OFF;")
            db.run("BEGIN TRANSACTION;")
            dataArr.forEach(query => {
                if (query) {
                    query += ");"
                    db.run(query, err => {
                        if (err && !err.message.includes('UNIQUE') ) console.log(err.message)
                    })
                }
              })
            db.run("COMMIT;");
        })
        return db
    },
    closeConnection: function(db) {
        db.close((err)=>{
            if(err){
                console.log(err.message)
            }
            console.log("closed db connection.")
        })
    }
}