var http = require('http');
var url = require('url');
var port = process.env.PORT || 3000;

const fs = require('fs')
const MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb+srv://jbean03_db_user:4JFxS5zGtTYVwRDA@assignment10.aedupsh.mongodb.net/?appName=assignment10"

let collection = null;

async function main() {
    try{
        MongoClient.connect(url, function(err, db){
            if(err){
                return console.log(err);
            }
            var dbo = db.db("assignment10");
            var collection = dbo.collection("places");

            buildPage(collection);
        })
    } catch (err){
        return console.log(err)
    }
}

function buildPage(collection){
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        urlObj = url.parse(req.url,true)
        if (urlObj.pathname == "/") 
        {
            res.write("<h2>Zip Code Lookup</h2>");
            s = "<form method='get' action='/process'>" +
                "Enter a town name or zip code: <input type='text' name='id'><br /><input type='submit'></form>"
            res.write(s)
            res.end()
        }
        else if (urlObj.pathname == "/process") {
            id = urlObj.query.id
            if(!id){
                res.end("No search value.")
                return
            }
            if(!collection){
                res.end("Not connected to database.")
                return
            }
            if(isNaN(id[0])){
                result = collection.find({town: id}).toArray(function(err, item){
                    if(err){
                        return console.log(err);
                    }
                    console.log(JSON.stringify(item))
                    res.write(JSON.stringify(item))
                    res.end()
                })
            } else{
                result = collection.find({zips: {$all: [id]}}).toArray(function(err, item){
                    if(err){
                        return console.log(err);
                    }
                    console.log(JSON.stringify(item))
                    res.write(JSON.stringify(item))
                    res.end()
                })
            }
        } else {
            res.end("Invalid path.")
        }
    }).listen(port);
}
