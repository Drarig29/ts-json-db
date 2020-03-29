# ts-json-db

[![NPM](https://nodei.co/npm/ts-json-db.png?downloads=true&stars=true)](https://nodei.co/npm/ts-json-db/)

A Node.js database using JSON file as storage. The result of requests are **typed**!

It's a wrapper around [node-json-db](https://github.com/Belphemur/node-json-db) which does the main job about the "database". This package is inspired by [RESTyped](https://github.com/rawrmaan/restyped) and its autocomplete and type checks.

![tst](https://i.imgur.com/kj5F2uS.gif)

## Installation
Add `ts-json-db` to your existing Node.js project.
```bash
npm install ts-json-db
```

## Example Usage

```typescript
import TypedJsonDB, { ContentBase, ContentInstance, Dictionary } from "ts-json-db";

const contentInstance: ContentInstance = {
    '/login': "single",
    '/restaurants': "array",
    '/teams': "dictionary"
};

interface Restaurant {
    name: string
    chef: string,
    memberCount: number,
    turnOver: number
}

interface ContentDef extends ContentBase {
    paths: {
        '/login': {
            entryType: "single",
            dataType: {
                username: string,
                password: string
            }
        },
        '/restaurants': {
            entryType: "array",
            baseType: Restaurant,
            dataType: Restaurant[]
        },
        '/teams': {
            entryType: "dictionary",
            baseType: string,
            dataType: Dictionary<string>
        }
    }
}

let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
let result = db.get("/login");

console.log(result);
```

You can see the Mocha tests to find usage examples.

## Reason of choices

Mainly, I had to do two things I didn't find a better solution for:

- The need for a root level `paths` (spelled correctly) property in the content definition (`ContentBase`). In fact, without this, VS Code wasn't able to autocomplete the paths for all methods' first parameter. (I don't know why.)

- The need for a type definition `ContentBase` **and** an instance definition `ContentInstance`. The instance definition is needed to be able to check types (in `push()` and `getAt()`) at runtime. I could have created a method for each type (`single`, `array`, `dictionary`), but I didn't want to complexify the syntax too much.

For a `single` object, you only need to specify `dataType`. For an `array` or a `dictionary`, you need both `baseType` and `dataType`.

For a `dictionary`, you must use my implementation of generic `Dictionary<T>` (or the same). Otherwise, it won't work.