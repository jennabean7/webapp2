var http = require('http');
var url = require('url');
var port = process.env.PORT || 3000;

const fs = require('fs')
const MongoClient = require('mongodb').MongoClient;
const mongoURL = "mongodb+srv://jbean03_db_user:4JFxS5zGtTYVwRDA@assignment10.aedupsh.mongodb.net/?appName=assignment10"

let collection = null;

// ASYNC main function connects to db
async function main() {
    try{
        // Instantiate the client, then connect using await
        const client = new MongoClient(mongoURL);
        await client.connect()
        dbo = client.db("assignment10")
        collection = dbo.collection("places");
        // Build the page
        buildPage()
    } catch (err){
        return console.log(err)
    } // END try/catch
} // END main

// buildPage displays the info on the page
function buildPage(){
    // Create the server, using an async function inside 
    http.createServer(async function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        urlObj = url.parse(req.url,true)

        // '/' is the home page
        if (urlObj.pathname == "/") 
        {
            // Display the form
            res.write("<h2>Zip Code Lookup</h2>");
            s = "<form method='get' action='/process'>" +
                "Enter a town name or zip code: <input type='text' name='id'><br /><input type='submit'></form>"
            res.write(s)
            res.end()
        }
        else if (urlObj.pathname == "/process") {
            idIsTown = false;
            // Get the ID 
            id = urlObj.query.id
            // If ID is empty (no search value), display 'error' message
            if(!id){
                res.end("No search value.")
                return
            } 

            try{
                // If the first letter is not a number, assume user has entered town name
                if(isNaN(id[0])){
                    idIsTown = true;
                    // Make sure the first letter of the town name is capital to avoid db errors
                    firstIDchar = id.slice(0,1).toUpperCase();
                    restID = id.slice(1).toLowerCase();
                    formattedID = firstIDchar + restID
                    // Search for the associated zip codes w/await
                    result = await collection.find({town: formattedID}).toArray()
                } else {
                    // Otherwise, assume user entered a zip code and search for associated town
                    result = await collection.find({zips: {$all: [id]}}).toArray()
                } // END if/else

                // If no results, display 'error'
                if(result.length === 0){
                    res.end("Invalid town or zip code.")
                    return;
                } else{
                    // Display the results 
                    res.write("<h2>Results for " + id + ": </h2>")
                    for(const item of result){
                        if(idIsTown){
                            res.write("Zip code(s): " + item.zips + "<br>")
                            console.log("Zip code(s): " + item.zips)
                        } else{
                            res.write("Town: " + item.town + "<br>")
                            console.log("Town: " + item.town)
                        }
                    } // END for 
                    res.end()
                } // END if/else
            } catch(err){
                // log any errors
                console.log(err)
                res.end()
            }
        } else {
            // no other valid paths
            res.end("Invalid path.")
        }
    }).listen(port);
}

// Run the app
main();