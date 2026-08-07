var http = require('http');
var url = require('url');
var port = process.env.PORT || 3000;

const fs = require('fs')
const MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb+srv://jbean03_db_user:4JFxS5zGtTYVwRDA@assignment10.aedupsh.mongodb.net/?appName=assignment10"

let collection = null;

async function main() {
    try{
        const client = new MongoClient(mongoURL);
        await client.connect()
        dbo = client.db("assignment10")
        collection = dbo.collection("places");
        buildPage()
    } catch (err){
        return console.log(err)
    }
}

function buildPage(){
    http.createServer(async function (req, res) {
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
            try{
                if(isNaN(id[0])){
                    result = await collection.find({town: id}).toArray()
                } else {
                    result = await collection.find({zips: {$all: [id]}}).toArray()
                }
                console.log(item[i].town + "zip: " + item[i].zips)
                res.write(item[i].town + "zip: " + item[i].zips)
                res.end()
            } catch(err){
                console.log(err)
                res.end()
            }
        } else {
            res.end("Invalid path.")
        }
    }).listen(port);
}

main();
