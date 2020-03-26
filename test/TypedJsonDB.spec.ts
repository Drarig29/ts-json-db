import TypedJsonDB from "../src/TypedJsonDB";
import { DbContent, Restaurant } from "../src/db-content";

var assert = require('assert');

describe('TypedJsonDB tests', function () {
    it('should initialize well', function () {
        let db = new TypedJsonDB<DbContent>("config.json");
        assert(db);
    });
});