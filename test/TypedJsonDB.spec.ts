import TypedJsonDB from "../src";
import { ContentDef, Restaurant, contentInstance } from "./databaseContent";

var assert = require("assert");

describe("TypedJsonDB tests", () => {
    it("should initialize well", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        assert(db);
    });

    it("should set a single object", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        let data = { username: "foo", password: "bar" };
        db.set("/login", data);
        assert(db.internalDB.getData("/login") === data);
    });

    it("should set an array", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        let restaurant: Restaurant = { chef: "foo", name: "bar", memberCount: 10, turnOver: 10000 }
        db.set("/restaurants", [restaurant]);
        assert(db.internalDB.getData("/restaurants")[0] === restaurant);
    });

    it("should set a dictionary", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        let data = { test1: "foo", test2: "bar" };
        db.set("/teams", data);
        assert(db.internalDB.getData("/teams")["test1"] === data.test1);
    });

    it("should push to an array", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        let restaurant: Restaurant = { chef: "eheh", name: "hello", memberCount: 8, turnOver: 2000 }
        db.push("/restaurants", restaurant);
        assert(db.internalDB.getData("/restaurants[-1]") === restaurant);
    });

    it("should push and retrieve in an array at a given position", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        let restaurant: Restaurant = { chef: "eheh", name: "hello", memberCount: 8, turnOver: 2000 }
        db.push("/restaurants", restaurant, 2);
        assert(db.getAt("/restaurants", 2) === restaurant);
    });

    it("should push an object in a dictionary", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        db.push("/teams", "value", "key");
        assert(db.internalDB.getData("/teams/key") === "value");
    });

    it("should push an object in a dictionary and get it properly", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        db.push("/teams", "value", "key");
        assert(db.getAt("/teams", "key") === "value");
    });

    it("should delete anything", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        db.delete("/restaurants");
        assert(!db.exists("/restaurants"));
    });

    it("should push if not exists", () => {
        let db = new TypedJsonDB<ContentDef>("config.json", contentInstance);
        let restaurant: Restaurant = { chef: "eheh", name: "hello", memberCount: 8, turnOver: 2000 }
        db.delete("/restaurants");
        assert(!db.getAt("/restaurants"));
        db.push("/restaurants", restaurant);
        assert(db.getAt("/restaurants") === restaurant);
    });
});