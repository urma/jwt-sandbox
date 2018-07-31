# JWT Sandbox
Sample REST API which leverages JWT authentication with JWT header validation, to prevent abuse via known vulnerable algorithms,
overriding of public key URIs and similar issues.

## Usage
Authentication is done via the `Authorization` header, which must be provided using a bearer token. For example:

```
curl -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.xx8s0Df1oQuuf_kta-ank5CiAJ-Fo_RAjFKc_ZPkWwrvpi1ka2rjXm7y9PoNugB0VksHWLjYsfkfIuuXgQOdqQ' http://localhost:3000/some/path
```
