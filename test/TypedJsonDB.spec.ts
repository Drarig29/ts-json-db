import TypedJsonDB from "../src";
import { ContentDef, Restaurant } from "./databaseContent";

var assert = require("assert");

describe("TypedJsonDB tests", () => {
    it("should get single values", () => {
        let db = new TypedJsonDB<ContentDef>("config.json");
        db.single.get("/login");
    });
});