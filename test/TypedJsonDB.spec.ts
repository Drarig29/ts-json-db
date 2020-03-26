import TypedJsonDB from "../src/TypedJsonDB";
import { DbContent, Restaurant } from "./databaseContent";

var assert = require("assert");

describe("TypedJsonDB tests", () => {
    it("should initialize well", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        assert(db);
    });

    it("should set a single object", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let data = { username: "foo", password: "bar" };
        db.set("/login", data);
        assert(db.internalDB.getData("/login") === data);
    });

    it("should set an array", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let restaurant: Restaurant = { chef: "foo", name: "bar", memberCount: 10, turnOver: 10000 }
        db.setArray("/restaurants", [restaurant]);
        assert(db.internalDB.getData("/restaurants")[0] === restaurant);
    });

    it("should set a dictionary", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let data = { test1: "foo", test2: "bar" };
        db.setDictionary("/teams", data);
        assert(db.internalDB.getData("/teams")["test1"] === data.test1);
    });
});