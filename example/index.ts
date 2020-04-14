import { TypedJsonDB } from "../src";
import { ContentDef, Login, Restaurant } from "./databaseContent";
import { assert } from "console";

let db = new TypedJsonDB<ContentDef>("config.json");
let login: Login = { username: "user", password: "pass" };

db.set("/login", login);
db.merge("/login", { username: "user1" });
let l = db.get("/login");
assert(l && l.username == "user1");

let restaurant: Restaurant = { chef: "hello", memberCount: 2, name: "foo", turnOver: 10 };
db.set("/restaurants", [restaurant, restaurant]);
let rs = db.get("/restaurants");
assert(rs && rs[0].chef == restaurant.chef);

db.push("/restaurants", restaurant);
rs = db.get("/restaurants");
assert(rs && rs[2].chef == restaurant.chef);

let r = db.get("/restaurants", -1);
assert(r && r.chef == restaurant.chef);

r = db.get("/restaurants", 2);
assert(r && r.chef == restaurant.chef);

db.merge("/restaurants", { name: "12" }, 1)
r = db.get("/restaurants", 1);
assert(r && r.name == "12");

db.set("/teams", { test: "coucou" });
let t = db.get("/teams");
assert(t && t.test == "coucou");

db.push("/teams", "mydata", "here");
assert(db.get("/teams", "here") == "mydata");
db.merge("/teams", "merged", "here");
assert(db.get("/teams", "here") == "merged");

assert(db.exists("/teams", ""));