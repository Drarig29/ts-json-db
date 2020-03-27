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
        db.arraySet("/restaurants", [restaurant]);
        assert(db.internalDB.getData("/restaurants")[0] === restaurant);
    });

    it("should push to an array", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let restaurant: Restaurant = { chef: "eheh", name: "hello", memberCount: 8, turnOver: 2000 }
        db.arrayPush("/restaurants", restaurant);
        assert(db.internalDB.getData("/restaurants[-1]") === restaurant);
    });

    it("should push and retrieve in an array at a given position", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let restaurant: Restaurant = { chef: "eheh", name: "hello", memberCount: 8, turnOver: 2000 }
        db.arrayPushAt("/restaurants", 2, restaurant);
        assert(db.arrayGetAt("/restaurants", 2) === restaurant);
    });

    it("should set a dictionary", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let data = { test1: "foo", test2: "bar" };
        db.dictionarySet("/teams", data);
        assert(db.internalDB.getData("/teams")["test1"] === data.test1);
    });

    it("should push an object in a dictionary", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        db.dictionaryPush("/teams", "test1", "coucou");
        assert(db.internalDB.getData("/teams/test1") === "coucou");
    });

    it("should push an object in a dictionary", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        db.dictionaryPush("/teams", "test2", "coucou");
        assert(db.dictionaryGetAt("/teams", "test2") === "coucou");
    });

    it("should delete anything", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        db.delete("/restaurants");
        assert(!db.exists("/restaurants"));
    });
});