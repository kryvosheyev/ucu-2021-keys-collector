# ucu-2021-keys-collector

run 
docker-compose up

# Crawler 


# Parser
to send command to parser API:
POST http://3.142.70.26:4001/parser/download-and-parse-file
or locally POST http://parser_1/parser/download-and-parse-file
body example: {
  "fileHash": "xxxxx5",
  "fileUrl": "github.xxxxx",
  "project": "github.xxxx",
  "language": "java"
}

Parser has its mongoDb.
Parser will check if "fileHash" was processed before. 
If "fileHash" was not processed before, then it dowload  "fileUrl" and look for keys.
If it finds a key, it will send it to all the URLs in /parser/config.js 
{  secondaries: [ {   name:'storage_one', ... }, {  name:'streamer_one',}  ] }
Parser can send collected keys to any number of databases and streamers.
Parser will do at-least-once-delivery, with smart health checks, exponential back-off, gradual recovery, independent batch retry.

Parser will send this message to secondaries:
{
    "keys": [{
        "uuid": "uuidv4()",
        "detectedAt": "UTILS.KievTimeNow()",
        "fileHash": "fileHash",
        "project": "project",
        "fileUrl": "fileUrl",
        "language": "language",
        "service": "aws",
        "found": {
           "API": "JHUGFHFH",
           "SECRET": "secret"
          }
    }]
}

# Storage
Inside the "storage" services, exactly-once devivery mode is implemented with idepotency base on the "uuid" property.
To see collected keys:
GET  http://3.142.70.26:5001/collected-keys/get-all
or locally GET http://storage_1:5001/collected-keys/get-all

To see statistics:
GET  http://3.142.70.26:5001/stats/get
or locally GET http://storage_1:5001/stats/get

# Streamer

