# Query String to JSON

![](https://img.shields.io/circleci/project/github/neha-saggam/qs-to-json.svg) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/7798c697c4e14194aec01811ea8c69f7)](https://www.codacy.com/app/neha-saggam/qs-to-json?utm_source=github.com&utm_medium=referral&utm_content=neha-saggam/qs-to-json&utm_campaign=Badge_Grade) ![](https://img.shields.io/codacy/coverage/7798c697c4e14194aec01811ea8c69f7.svg)

Library to parse given _decoded_ query string and create a JSON object.

## Installation

Install qs-to-json using [`npm`](https://www.npmjs.com/):

```bash
npm install --save-dev qs-to-json
```

## Example

**NOTE:** : qs-to-json currently does not decode the query string. Make sure you pass decoded queryString.

1.  Convert "&a=1&b=2" to a JSON object:

```javascript
import queryStringToJSON from "qs-to-json";

const queryString = "&a=1&b=2";
const json = queryStringToJSON(queryString);
console.log(json);
```

Output would be the following:

```json
{
  "a": "1",
  "b": "2"
}
```

2.  Convert "&a[]=1&a[]=2" to a JSON object:

```javascript
import queryStringToJSON from "qs-to-json";

const queryString = "&a[]=1&a[]=2";
const json = queryStringToJSON(queryString);
console.log(json);
```

Output would be the following:

```json
{
  "a": ["1", "2"]
}
```

2.  Convert "a.name=Nick&b.name=John" to a JSON object:

```javascript
import queryStringToJSON from "qs-to-json";

const queryString = "a.name=Nick&b.name=John";
const json = queryStringToJSON(queryString);
console.log(json);
```

Output would be the following:

```json
{
  "a": { "name": "Nick" },
  "b": { "name": "John" }
}
```

## Playground

[Demo](https://neha-saggam.github.io/qs-to-json-gh-pages/)

## Contributing

We accept pull requests :D

## License

qs-to-json is [MIT licensed](./LICENSE).
