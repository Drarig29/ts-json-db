import TypedJsonDB from "../src";
import { ContentDef, Login, Restaurant } from "./databaseContent";
import { assert } from "console";

let db = new TypedJsonDB<ContentDef>("config.json");
let login: Login = { username: "user", password: "pass" };

db.set("/login", login);
db.merge("/login", { username: "user1" });
assert(db.get("/login").username == "user1");

let restaurant: Restaurant = { chef: "hello", memberCount: 2, name: "foo", turnOver: 10 };
db.set("/restaurants", [restaurant, restaurant]);
assert(db.get("/restaurants")[0].chef == restaurant.chef);

db.push("/restaurants", restaurant);
assert(db.get("/restaurants")[2].chef == restaurant.chef);
assert(db.get("/restaurants", -1).chef == restaurant.chef);
assert(db.get("/restaurants", 2).chef == restaurant.chef);

db.merge("/restaurants", { name: "12" }, 1)
assert(db.get("/restaurants", 1).name == "12");

db.set("/teams", { test: "coucou" });
assert(db.get("/teams").test == "coucou");

db.push("/teams", "mydata", "here");
assert(db.get("/teams", "here") == "mydata");
db.merge("/teams", "merged", "here");
assert(db.get("/teams", "here") == "merged");

assert(db.exists("/teams", ""));