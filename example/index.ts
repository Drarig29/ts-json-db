import TypedJsonDB from "../src";
import { ContentDef, Restaurant } from "./databaseContent";

let db = new TypedJsonDB<ContentDef>("config.json");
db.single.get("/login");