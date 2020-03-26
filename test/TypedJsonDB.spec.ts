import TypedJsonDB from "../src/TypedJsonDB";
import { DbContent, Restaurant } from "./databaseContent";

var assert = require('assert');

describe('TypedJsonDB tests', function () {
    it('should initialize well', function () {
        let db = new TypedJsonDB<DbContent>("config.json");
        assert(db);
    });
});