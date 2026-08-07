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
            firstIDchar = id.slice(0,1).toUpperCase();
            restID = id.slice(1).toLowerCase();
            formattedID = firstIDchar + restID
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
                    firstIDchar = id.slice(0,1).toUpperCase();
                    restID = id.slice(1).toLowerCase();
                    formattedID = firstIDchar + restID
                    result = await collection.find({town: formattedID}).toArray()
                } else {
                    result = await collection.find({zips: {$all: [id]}}).toArray()
                }

                if(result.length === 0){
                    "Invalid town or zip code."
                    return;
                } else{
                    for(const item of result){
                        res.write(item.town + " zip code(s): " + item.zips)
                    }
                    res.end()
                }

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