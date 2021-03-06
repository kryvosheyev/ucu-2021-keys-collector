# ucu-2021-keys-collector

### run 
docker-compose up

# Crawler 


# Parser
to send command to parser API:
POST http://3.142.70.26:4001/parser/download-and-parse-file  

or locally POST http://parser_1/parser/download-and-parse-file  
```javascript
body example: {
  "fileHash": "xxxxx5",
  "fileUrl": "github.xxxxx",
  "project": "github.xxxx",
  "language": "java"
}
```

Parser has its mongoDb.

Parser will check if "fileHash" was processed before. 

If "fileHash" was not processed before, then it dowload  "fileUrl" and look for keys.

If it finds a key, it will send it to all the URLs in /parser/config.js 
```javascript
secondaries: [
        {   name:'storage_one',
            baseUrl:'http://storage_1:5001',
            healthCheckUrl:'/health',
            sendCollectedKeysUrl: '/collected-keys/create'
        },
        {   name:'streamer_one',
            baseUrl:'http://streamer_1:6001',
            healthCheckUrl:'/health',
            sendCollectedKeysUrl: '/send-collected-keys'
        },
        {   name:'streamer_two',
            baseUrl:'http://streamer_2:6002',
            healthCheckUrl:'/health',
            sendCollectedKeysUrl: '/send-collected-keys'
        }
    ]
```
### All secondaries must have GET /health endpoint
Just return status 200, it will be enough. Response body is ignored.

Parser can send collected keys to any number of databases and streamers.

Parser will do at-least-once-delivery, with smart health checks, exponential back-off, gradual recovery, independent batch retry.

Parser will send a message to secondaries, example:
```javascript
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
```

# Storage
Inside the "storage" services, exactly-once delivery mode is implemented with idempotency based on the "uuid" property.

### To see collected keys:

GET  http://3.142.70.26:5001/collected-keys/get-all

or locally GET http://storage_1:5001/collected-keys/get-all



### To see statistics:

GET  http://3.142.70.26:5001/stats/get

or locally GET http://storage_1:5001/stats/get

# Streamer


# Interesting reading
https://medium.com/swlh/aws-access-keys-leak-in-github-repository-and-some-improvements-in-amazon-reaction-cc2e20e89003
