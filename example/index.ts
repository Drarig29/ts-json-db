import TypedJsonDB from "../src";
import { ContentDef, Login, Restaurant } from "./databaseContent";
import { assert } from "console";

let db = new TypedJsonDB<ContentDef>("config.json");
let login: Login = { username: "user", password: "pass" };

db.single.set("/login", login);
db.single.merge("/login", { username: "user1" });
assert(db.single.get("/login").username == "user1");

let restaurant: Restaurant = { chef: "hello", memberCount: 2, name: "foo", turnOver: 10 };
db.array.set("/restaurants", [restaurant, restaurant]);
assert(db.array.get("/restaurants")[0].chef == restaurant.chef);

db.array.value.push("/restaurants", restaurant);
assert(db.array.get("/restaurants")[2].chef == restaurant.chef);
assert(db.array.value.get("/restaurants").chef == restaurant.chef);
assert(db.array.value.get("/restaurants", 2).chef == restaurant.chef);

db.array.value.merge("/restaurants", { name: "12" }, 1)
assert(db.array.value.get("/restaurants", 1).name == "12");

db.dictionary.set("/teams", { test: "coucou" });
assert(db.dictionary.get("/teams").test == "coucou");

db.dictionary.value.push("/teams", "mydata", "here");
assert(db.dictionary.value.get("/teams", "here") == "mydata");
db.dictionary.value.merge("/teams", "merged", "here");
assert(db.dictionary.value.get("/teams", "here") == "merged");

assert(db.exists("/teams", ""));