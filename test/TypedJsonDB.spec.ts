import TypedJsonDB from "../src/TypedJsonDB";
import { DbContent, Restaurant } from "./databaseContent";

var assert = require("assert");

describe("TypedJsonDB tests", () => {
    it("should initialize well", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        assert(db);
    });

    it("should push the given data", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let data = { username: "foo", password: "bar" };
        db.push("/login", data);
        assert(db.internalDB.getData("/login") === data);
    });

    it("should be the same type", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let data = { username: "foo", password: "bar" };
        db.push("/login", data);
        let result = db.get("/login");
        assert(typeof result === typeof data);
    })

    it("should push an array", () => {
        let db = new TypedJsonDB<DbContent>("config.json");
        let restaurant: Restaurant = {
            chef: "foo",
            memberCount: 5,
            name: "bar",
            turnOver: 10000
        }
        db.push("/restaurants", [restaurant]);
        let result = db.get("/restaurants")[0];
        assert(result === restaurant);
    });
});