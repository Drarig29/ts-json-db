import { JsonDB, FindCallback } from "node-json-db";
import { DataError } from "node-json-db/dist/lib/Errors";

/**
 * The possible entry types for the json database.
 */
type EntryType = "single" | "array" | "dictionary";

/**
 * Get the key of an object as a string.
 */
type GetKey<T> = Extract<keyof T, string>;

/**
 * Creates a dictionary (JS object) which maps a string to the given type.
 */
export type Dictionary<V> = { [key: string]: V };

/**
 * The base structure of the json database.
 */
export type ContentBase = {
    [root in "paths"]: {
        [path: string]: {
            entryType: EntryType,
            valueType: any
        }
    }
};

type EntriesOfType<T, U extends EntryType> = { [Key in keyof T]: T[Key] extends { entryType: U } ? Key : never }[keyof T];

/**
 * Typed wrapper around the JsonDB. Use the internal database field to use non-typed functions.
 */
export default class TypedJsonDB<ContentDef extends ContentBase> {

    /**
     * The encapsulated actual JSON database.
     *
     * @type {JsonDB}
     * @memberof TypedDatabase
     */
    public internal: JsonDB;
    
    /**
     * Creates an instance of TypedJsonDB.
     * @param {string} filename Where to save the database.
     * @param {ContentInstance} contentInstance
     * @param {boolean} [saveOnPush] Save the database at each push command into the json file.
     * @param {boolean} [humanReadable] The json file will be easily readable by a human.
     * @param {string} [separator] What to use as a separator.
     * @memberof TypedJsonDB
     */
    constructor(filename: string, saveOnPush?: boolean, humanReadable?: boolean, separator?: string) {
        this.internal = new JsonDB(filename, saveOnPush, humanReadable, separator);
    }

    single = {
        get: <Path extends EntriesOfType<ContentDef["paths"], "single">>(path: Path): ContentDef["paths"][Path]["valueType"] => {
            return null;
        }
    }
    
    array = {
        get: <Path extends EntriesOfType<ContentDef["paths"], "array">>(path: Path): ContentDef["paths"][Path]["valueType"] => {
            return null;
        }
    }
    
    dictionary = {
        get: <Path extends EntriesOfType<ContentDef["paths"], "dictionary">>(path: Path): ContentDef["paths"][Path]["valueType"] => {
            return null;
        }
    }
}