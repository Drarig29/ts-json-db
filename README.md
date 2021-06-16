# ts-json-db

A Node.js database using JSON file as storage. The result of requests are **typed**!

It's a wrapper around [node-json-db](https://github.com/Belphemur/node-json-db) which does the main job about the "database". This package is inspired by [RESTyped](https://github.com/rawrmaan/restyped) and its autocomplete and type checks.

![Demo](https://i.imgur.com/q3uLHJW.gif)

[![npm](https://img.shields.io/npm/v/ts-json-db.svg)](https://www.npmjs.com/package/ts-json-db)
[![Downloads](https://img.shields.io/npm/dt/ts-json-db.svg)](https://www.npmjs.com/package/ts-json-db)

## Installation

Add `ts-json-db` to your existing Node.js project.

```bash
npm install ts-json-db
```

## Usage

```typescript
import TypedJsonDB, { ContentBase, Dictionary } from "ts-json-db";

interface Restaurant {
    name: string
    chef: string,
    memberCount: number,
    turnOver: number
}

interface Login {
    username: string,
    password: string
};

interface ContentDef extends ContentBase {
    paths: {
        '/login': {
            entryType: "single",
            valueType: Login
        },
        '/restaurants': {
            entryType: "array",
            valueType: Restaurant
        },
        '/teams': {
            entryType: "dictionary",
            valueType: string
        }
    }
}

let db = new TypedJsonDB<ContentDef>("config.json");
let result = db.get("/login");

console.log(result);
```

You can see in the `example` folder to find usage examples.