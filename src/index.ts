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
     * @param {Path} path The path you'll choose.
     * @returns {ContentDef["paths"][Path]["valueType"]} A `single` value.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path): ContentDef["paths"][Path]["valueType"];

    /**
     * Get a whole `array`.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @returns {ContentDef["paths"][Path]["valueType"][]} An `array`.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path): ContentDef["paths"][Path]["valueType"][];

    /**
     * Get an `array` value.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @param {number} index The index of the value (`-1` to get the last one).
     * @returns {ContentDef["paths"][Path]["valueType"]} An `array` value.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, index: number): ContentDef["paths"][Path]["valueType"];

    /**
     * Get a whole `dictionary`.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @returns {Dictionary<ContentDef["paths"][Path]["valueType"]>} A `dictionary`.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path): Dictionary<ContentDef["paths"][Path]["valueType"]>;

    /**
     * Get a `dictionary` value.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @param {string} key The key of the value.
     * @returns {ContentDef["paths"][Path]["valueType"]} A `dictionary` value.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, key: string): ContentDef["paths"][Path]["valueType"];

    get(path: any, location?: any): any {
        if (typeof location === "number")
            path += "[" + location + "]"; // Array value.
        else if (typeof location === "string")
            path += "/" + location; // Dictionary value.
        // Otherwise, it's the same for a single value, an array or a dictionary.

        return this.internal.getData(path);
    }

    /**
     * Set a `single` value.
     * @template Path A path leading to a `single` value.
     * @param {Path} path The path you'll choose.
     * @param {ContentDef["paths"][Path]["valueType"]} data Some data to set.
     * @memberof TypedJsonDB
     */
    set<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path, data: ContentDef["paths"][Path]["valueType"]): void;

    /**
     * Set a whole `array`.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @param {ContentDef["paths"][Path]["valueType"][]} data An `array` to set.
     * @memberof TypedJsonDB
     */
    set<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: ContentDef["paths"][Path]["valueType"][]): void;

    /**
     * Set a whole `dictionary`.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @param {Dictionary<ContentDef["paths"][Path]["valueType"]>} data A `dictionary` to set.
     * @memberof TypedJsonDB
     */
    set<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: Dictionary<ContentDef["paths"][Path]["valueType"]>): void;

    set(path: any, data: any): void {
        this.internal.push(path, data);
    }

    /**
     * Push a value in an `array`.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @param {ContentDef["paths"][Path]["valueType"]} data Some data to set.
     * @param {number} [index] The index of the value (omit it to append at the end).
     * @memberof TypedJsonDB
     */
    push<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: ContentDef["paths"][Path]["valueType"], index?: number): void;

    /**
     * Push a value in a `dictionary`.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @param {ContentDef["paths"][Path]["valueType"]} data Some data to set.
     * @param {string} [key] The key of the value.
     * @memberof TypedJsonDB
     */
    push<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: ContentDef["paths"][Path]["valueType"], key: string): void;

    push(path: any, data: any, location?: any): void {
        if (typeof location === "number")
            path += "[" + location + "]"; // Array value.
        else if (typeof location === "string")
            path += "/" + location; // Dictionary value.
        else
            path += "[]"; // End of the array.

        this.internal.push(path, data, true);
    }

    /**
     * Merge some data with a `single` value.
     * @template Path A path leading to a `single`.
     * @param {Path} path The path you'll choose.
     * @param {Partial<ContentDef["paths"][Path]["valueType"]>} data Some data to set.
     * @throws If no data exists at the given path.
     * @memberof TypedJsonDB
     */
    merge<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>): void;

    /**
    * Merge some data with an `array` value.
    * @template Path A path leading to an `array`.
    * @param {Path} path The path you'll choose.
    * @param {Partial<ContentDef["paths"][Path]["valueType"]>} data Some data to set.
    * @param {number} index The index of the value (`-1` to get the last one).
    * @throws If no data exists at the given path.
    * @memberof TypedJsonDB
    */
    merge<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>, index: number): void;

    /**
    * Merge some data with a `dictionary` value.
    * @template Path A path leading to a `dictionary`.
    * @param {Path} path The path you'll choose.
    * @param {Partial<ContentDef["paths"][Path]["valueType"]>} data Some data to set.
    * @param {string} [key] The key of the value.
    * @throws If no data exists at the given path.
    * @memberof TypedJsonDB
    */
    merge<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>, key: string): void;

    merge(path: any, data: any, location?: any): void {
        if (typeof location === "number")
            path += "[" + location + "]"; // Array value.
        else if (typeof location === "string")
            path += "/" + location; // Dictionary value.
        // Otherwise, single value.

        if (!this.internal.exists(path))
            throw new Error("You tried to merge with unexisting data. The resulting type would be undefined.");

        this.internal.push(path, data, false);
    }

    /**
     * Check if a `single` value exists at the given path.
     * @template Path A path leading to a `single` value.
     * @param {Path} path The path you'll choose.
     * @returns {boolean} The result of the check.
     * @memberof TypedJsonDB
     */
    exists<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path): boolean;

    /**
     * Check if a whole `array` exists at the given path.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @returns {boolean} The result of the check.
     * @memberof TypedJsonDB
     */
    exists<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path): boolean;

    /**
     * Check if an `array` value exists at the given path.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @param {number} index The index of the value (`-1` to check the last one).
     * @returns {boolean} The result of the check.
     * @memberof TypedJsonDB
     */
    exists<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, index: number): boolean;

    /**
     * Check if a whole `dictionary` exists at the given path.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @returns {boolean} The result of the check.
     * @memberof TypedJsonDB
     */
    exists<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path): boolean;

    /**
     * Check if a `dictionary` value exists at the given path.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @param {string} key The key of the value.
     * @returns {boolean} The result of the check.
     * @memberof TypedJsonDB
     */
    exists<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, key: string): boolean;

    exists(path: any, location?: any): any {
        if (typeof location === "number")
            path += "[" + location + "]"; // Array value.
        else if (typeof location === "string")
            path += "/" + location; // Dictionary value.
        // Otherwise, it's the same for a single value, an array or a dictionary.

        return this.internal.exists(path);
    }

    /**
     * Delete a `single` value.
     * @template Path A path leading to a `single` value.
     * @param {Path} path The path you'll choose.
     * @memberof TypedJsonDB
     */
    delete<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path): void;

    /**
     * Delete a whole `array`.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @memberof TypedJsonDB
     */
    delete<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path): void;

    /**
     * Delete an `array` value.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @param {number} index The index of the value (`-1` to delete the last one).
     * @memberof TypedJsonDB
     */
    delete<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, index: number): void;

    /**
     * Delete a whole `dictionary`.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @memberof TypedJsonDB
     */
    delete<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path): void;

    /**
     * Delete a `dictionary` value.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @param {string} key The key of the value.
     * @memberof TypedJsonDB
     */
    delete<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, key: string): void;

    delete(path: any, location?: any): any {
        if (typeof location === "number")
            path += "[" + location + "]"; // Array value.
        else if (typeof location === "string")
            path += "/" + location; // Dictionary value.
        // Otherwise, it's the same for a single value, an array or a dictionary.

        return this.internal.delete(path);
    }

    /**
     * Reload the database from the file.
     * @memberof TypedJsonDB
     */
    reload(): void {
        this.internal.reload();
    }

    /**
     * Manually load the database (automatically done when the first `get()` is called).
     * @memberof TypedJsonDB
     */
    load(): void {
        this.internal.load();
    }

    /**
    * Manually save the database.
    * @param {boolean} [force] If true, database will be saved even if not loaded.
    * @memberof TypedJsonDB
    */
    save(force?: boolean): void {
        this.internal.save(force);
    }

    helpMeRemember = {
        singles: {
            /**
             * Don't call this method. It's only purpose is for the developer to get an autocomplete list of paths to single values.
             */
            hintPlease<Path extends PathsOfType<ContentDef["paths"], "single">>(_autocomplete: Path): void { }
        },
        arrays: {
            /**
             * Don't call this method. It's only purpose is for the developer to get an autocomplete list of paths to arrays.
             */
            hintPlease<Path extends PathsOfType<ContentDef["paths"], "array">>(_autocomplete: Path): void { }
        },
        dictionaries: {
            /**
             * Don't call this method. It's only purpose is for the developer to get an autocomplete list of paths to dictionaries.
             */
            hintPlease<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(_autocomplete: Path): void { }
        }
    };
}