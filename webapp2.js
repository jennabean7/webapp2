var http = require('http');
var url = require('url');
var port = process.env.PORT || 3000;

const fs = require('fs')
const MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb://jbean03_db_user:4JFxS5zGtTYVwRDA@ac-kcfncmb-shard-00-00.aedupsh.mongodb.net:27017,ac-kcfncmb-shard-00-01.aedupsh.mongodb.net:27017,ac-kcfncmb-shard-00-02.aedupsh.mongodb.net:27017/?ssl=true&replicaSet=atlas-zr2gwz-shard-0&authSource=admin&appName=assignment10"

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  urlObj = url.parse(req.url,true)
  if (urlObj.pathname == "/home") 
  {
     res.write("<h2>Zip Code Lookup</h2>");
     s = "<form method='get' action='/process'>" +
         "Enter a town name or zip code: <input type='text' name='id'><br /><input type='submit'></form>"
     res.write(s)
     res.end()
  }
  else if (urlObj.pathname == "/process") {
    id = urlObj.query.id

    if(isNaN(id[0])){
        MongoClient.connect(mongoURL, function(err, db){
            if(err){
                return console.log(err);
            }
            var dbo = db.db("assignment10");
            result = dbo.collection('places').find({town: id})
            console.log(result)
            res.write(result)
            res.end()
        })
    } else{
        MongoClient.connect(mongoURL, function(err, db){
            if(err){
                return console.log(err);
            }
            var dbo = db.db("assignment10");
            result = dbo.collection('places').find({zips: {$all: [id]}})
            console.log(result)
            res.write(result)
            res.end()
        })
    }
  }
}).listen(port);