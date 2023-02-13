// A very basic web server in node.js
// Stolen from: Node.js for Front-End Developers by Garann Means (p. 9-10)

var port = 8000
var serverUrl = "127.0.0.1"

var http = require("http")
var path = require("path")
var fs = require("fs")
var checkMimeType = true

console.log("Starting web server at " + serverUrl + ":" + port)

http
  .createServer(function (req, res) {
    var now = new Date()

    var filename = req.url || "index.html"
    var ext = path.extname(filename)
    var localPath = __dirname
    var validExtensions = {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".txt": "text/plain",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".png": "image/png",
      ".woff": "application/font-woff",
      ".woff2": "application/font-woff2",
      ".json": "text/json",
      ".ico": "image/x-icon",
    }

    var validMimeType = true
    var mimeType = validExtensions[ext]
    if (checkMimeType) {
      validMimeType = validExtensions[ext] != undefined
    }

    if (validMimeType) {
      localPath += filename
      fs.exists(localPath, function (exists) {
        if (exists) {
          console.log("Serving file: " + localPath)
          getFile(localPath, res, mimeType)
        } else {
          console.log("File not found: " + localPath)
          res.writeHead(404)
          res.end()
        }
      })
    } else {
      console.log(
        "Invalid file extension detected: " + ext + " (" + filename + ")"
      )
    }
  })
  .listen(port, serverUrl)

function getFile(localPath, res, mimeType) {
  fs.readFile(localPath, function (err, contents) {
    if (!err) {
      res.setHeader("Content-Length", contents.length)
      if (mimeType != undefined) {
        res.setHeader("Content-Type", mimeType)
      }
      res.statusCode = 200
      res.end(contents)
    } else {
      res.writeHead(500)
      res.end()
    }
  })
}

var myHeaders = new Headers()
myHeaders.append("apikey", "")

var requestOptions = {
  method: "GET",
  redirect: "follow",
  headers: myHeaders,
}

const getExchangeRates = () => {
  fetch(
    "https://api.apilayer.com/exchangerates_data/latest?symbols=GBP,USD,BRL,CAD,JPY,EUR,COP,NGN,GHS,AUD,CNY,EGP&base=GBP",
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => storeData(result))
    .catch((error) => console.log("error", error))

  const storeData = (data) => {
    fs.writeFileSync(`exchange_rates.json`, JSON.stringify(data))
    console.log("values updated")
  }
}

getExchangeRates()
setInterval(getExchangeRates, 3600000)
