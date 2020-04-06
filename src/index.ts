import { JsonDB, FindCallback } from "node-json-db";

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

type PathsOfType<T, U extends EntryType> = { [Key in keyof T]: T[Key] extends { entryType: U } ? Key : never }[GetKey<T>];

/**
 * Typed wrapper around the JsonDB. Use the internal database field to use non-typed functions.
 */
export default class TypedJsonDB<ContentDef extends ContentBase> {

    /**
     * The encapsulated actual JSON database.
     * @type {JsonDB}
     * @memberof TypedDatabase
     */
    private internal: JsonDB;

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

    /**
     * Get a `single` value.
     * @template Path A path leading to a `single` value.
     * @param {Path} path The path where to get data.
     * @returns {ContentDef["paths"][Path]["valueType"]} A `single` value.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path): ContentDef["paths"][Path]["valueType"];

    /**
     * Get a whole `array`.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path where to get data.
     * @returns {ContentDef["paths"][Path]["valueType"][]} An `array`.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path): ContentDef["paths"][Path]["valueType"][];

    /**
     * Get an `array` value.
     * @template Path A path leading to an `array` value.
     * @param {Path} path The path where to get data.
     * @param {number} index The index of the value (`-1` to get the last one).
     * @returns {ContentDef["paths"][Path]["valueType"]} An `array` value.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, index: number): ContentDef["paths"][Path]["valueType"];

    /**
     * Get a whole `dictionary`.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path where to get data.
     * @returns {Dictionary<ContentDef["paths"][Path]["valueType"]>} A `dictionary`.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path): Dictionary<ContentDef["paths"][Path]["valueType"]>;

    /**
     * Get a `dictionary` value.
     * @template Path A path leading to a `dictionary` value.
     * @param {Path} path The path where to get data.
     * @param {string} key The key of the value.
     * @returns {ContentDef["paths"][Path]["valueType"]} A `dictionary` value.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, key: string): ContentDef["paths"][Path]["valueType"];

    get(path: any, location?: any): any {
        if (typeof location === "number")
            path += "[" + location + "]";
        else if (typeof location === "string")
            path += "/" + location;

        return this.internal.getData(path);
    }

    set<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path, data: ContentDef["paths"][Path]["valueType"]): void;
    set<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: ContentDef["paths"][Path]["valueType"][]): void;
    set<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: Dictionary<ContentDef["paths"][Path]["valueType"]>): void;
    set(path: any, data: any): void {
        this.internal.push(path, data);
    }

    push<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: ContentDef["paths"][Path]["valueType"], index?: number): void;
    push<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: ContentDef["paths"][Path]["valueType"], key: string): void;
    push(path: any, data: any, location: any): void {
        if (typeof location === "number")
            path += "[" + location + "]";
        else if (typeof location === "string")
            path += "/" + location;
        else
            path += "[]";

        this.internal.push(path, data, true);
    }

    merge<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>): void;
    merge<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>, index: number): void;
    merge<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>, key: string): void;
    merge(path: any, data: any, location?: any): void {
        if (typeof location === "number")
            path += "[" + location + "]";
        else if (typeof location === "string")
            path += "/" + location;

        this.internal.push(path, data, false);
    }

    exists<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path): boolean;
    exists<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, index: number): boolean;
    exists<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, key: string): boolean;
    exists(path: any, location?: any): any {
        if (typeof location === "number")
            return this.internal.exists(`${path}[${location}]`);

        if (typeof location === "string")
            return this.internal.exists(`${path}/${location}`);

        return this.internal.exists(path);
    }

    // exists(dataPath: string): boolean;
    // filter<T>(rootPath: string, callback: FindCallback): T[] | undefined;
    // find<T>(rootPath: string, callback: FindCallback): T | undefined;
    // delete(dataPath: string): void;
    // resetData(data: any): void;
    // reload(): void;
    // load(): void;
    // save(force?: boolean): void;

    helpMeRemember!: {
        singles: {
            hintPlease<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path): void;
        },
        arrays: {
            hintPlease<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path): void;
        },
        dictionaries: {
            hintPlease<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path): void;
        }
    };
}