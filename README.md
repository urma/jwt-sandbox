# JWT Sandbox
Sample REST API which leverages JWT authentication with JWT header validation, to prevent abuse via known vulnerable algorithms,
overriding of public key URIs and similar issues.

## Usage
Running the application is done via `npm start`:
```
$ NODE_ENV=development npm start

> jwt-workspace@1.0.0 start /home/cabox/workspace
> node $(pwd)

{"message":"Listening on http://0.0.0.0:3000/","level":"info"}
```
Please notice the application logs to the console by default. Logging to files or other sources currently requires changing the `winston` transports configuration in the `index.js` script.

### Configuration
Configuration is done via `node-config`, with the default values listed in the provided `config/default.json` file. Those should be overriden in the appropriate environment files, according to `NODE_ENV` value when the application is run.

### Token Generation
Arbitrary tokens can be generated and signed using the configuration parameters by submitting a POST request to `/login`. For example:
```
$ curl -d 'username=someuser&uid=12345' http://localhost:3000/login
{"payload":{"username":"someuser","uid":"12345"},"jwt":"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNvbWV1c2VyIiwidWlkIjoiMTIzNDUiLCJpYXQiOjE1MzMwMTQyNDZ9.uwjaosr5iZvEQFvsU826pSqX6LqmFGuQG0L0OZBS7-9okUR220eyac0mfsi3es0Bd7ZkPEhbYkWeMM9s07KAWw"}
```

`jq` can be used to make the output more readable and to extract individual attributes of the JSON document returned. For example:
```
$ curl -s -d 'username=someuser&uid=12345' http://localhost:3000/login | jq .
{
  "jwt": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNvbWV1c2VyIiwidWlkIjoiMTIzNDUiLCJpYXQiOjE1MzMwMTQ0NTZ9.Y8QlsgVXO8jVn7IsRZxXTaCwwBA-Mu24tv34ZxVI6Kl5xayUK3-y_OE8D1zgFNuTxZoMi1wP
aDPBuazQH4T8uw",
  "payload": {
    "uid": "12345",
    "username": "someuser"
  }
}
```
Extraction of the `jwt` attribute for usage in an `Authorization` header:
```
$ curl -s -d 'username=someuser&uid=12345' http://localhost:3000/login | jq -r .jwt
eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNvbWV1c2VyIiwidWlkIjoiMTIzNDUiLCJpYXQiOjE1MzMwMTQ1NDh9.sC6O-orX7p7eCGcK3EYI7ITBDA0paXurZ77Pc2BuOxomYAkQG56zGT2-zHF8xnksqLqgiq_YNSGxjydcGV_gaQ
```

### JWT Validation
Authentication is done via the `Authorization` header, which must be provided using a bearer token. Any token generated via `/login` should be considered valid because it will be using the same algorithm and shared key for signing. For example:
```
$ curl -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InNvbWV1c2VyIiwidWlkIjoiMTIzNDUiLCJpYXQiOjE1MzMwMTQ1NDh9.sC6O-orX7p7eCGc
K3EYI7ITBDA0paXurZ77Pc2BuOxomYAkQG56zGT2-zHF8xnksqLqgiq_YNSGxjydcGV_gaQ' http://localhost:3000/some/path
{"user":{"username":"someuser","uid":"12345","iat":1533014548}}
```
Both JWT generation and verification can be bundled in a single command to confirm signing and validation are working as expected:
```
$ curl -H "Authorization: Bearer $(curl -s -d 'username=someuser&uid=12345' http://localhost:3000/login | jq -r .jwt)" http://localhost:3000/some/path
{"user":{"username":"someuser","uid":"12345","iat":1533014776}}
```
