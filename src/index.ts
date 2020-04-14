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
export class TypedJsonDB<ContentDef extends ContentBase> {

    /**
     * The encapsulated actual JSON database.
     * @private
     * @type {JsonDB}
     * @memberof TypedDatabase
     */
    private internal: JsonDB;

    /**
     * Throw exceptions if the data is not found.
     *
     * @private
     * @type {boolean}
     * @memberof TypedJsonDB
     */
    private throwIfNotFound: boolean;

    /**
     * Creates an instance of TypedJsonDB.
     * @param {string} filename Where to save the database.
     * @param {boolean} [throwIfNotFound] Throw exceptions if the data is not found. (default: `true`)
     * @param {boolean} [saveOnPush] Save the database at each push command into the json file. (default: `true`)
     * @param {boolean} [humanReadable] The json file will be easily readable by a human. (default: `false`)
     * @param {string} [separator] What to use as a separator. (default: `'/'`)
     * @memberof TypedJsonDB
     */
    constructor(filename: string, throwIfNotFound: boolean = true, saveOnPush: boolean = true, humanReadable: boolean = false, separator: string = '/') {
        this.internal = new JsonDB(filename, saveOnPush, humanReadable, separator);
        this.throwIfNotFound = throwIfNotFound || true;
    }

    /**
     * Updates the path if it's an array or a dictionary.
     * @private
     * @param {*} path The base path to be updated.
     * @param {*} location The location (index or key).
     * @param {boolean} arrayEnd Whether to add `[]` at the end of the path for an array.
     * @returns The updated path.
     * @memberof TypedJsonDB
     */
    private updatePath(path: any, location: any, arrayEnd: boolean): string {
        if (typeof location === "number")
            path += "[" + location + "]"; // Array value.
        else if (typeof location === "string")
            path += "/" + location; // Dictionary value.
        else if (arrayEnd)
            path += "[]"; // Array end.

        return path;
    }

    /**
     * Get a `single` value.
     * @template Path A path leading to a `single` value.
     * @param {Path} path The path you'll choose.
     * @returns {ContentDef["paths"][Path]["valueType"]} A `single` value or `null` if not found.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path): ContentDef["paths"][Path]["valueType"] | null;

    /**
     * Get a whole `array`.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @returns {ContentDef["paths"][Path]["valueType"][]} An `array` or `null` if not found.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path): ContentDef["paths"][Path]["valueType"][] | null;

    /**
     * Get an `array` value.
     * @template Path A path leading to an `array`.
     * @param {Path} path The path you'll choose.
     * @param {number} index The index of the value (`-1` to get the last one).
     * @returns {ContentDef["paths"][Path]["valueType"]} An `array` value or `null` if not found.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, index: number): ContentDef["paths"][Path]["valueType"] | null;

    /**
     * Get a whole `dictionary`.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @returns {Dictionary<ContentDef["paths"][Path]["valueType"]>} A `dictionary` or `null` if not found.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path): Dictionary<ContentDef["paths"][Path]["valueType"]> | null;

    /**
     * Get a `dictionary` value.
     * @template Path A path leading to a `dictionary`.
     * @param {Path} path The path you'll choose.
     * @param {string} key The key of the value.
     * @returns {ContentDef["paths"][Path]["valueType"]} A `dictionary` value or `null` if not found.
     * @memberof TypedJsonDB
     */
    get<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, key: string): ContentDef["paths"][Path]["valueType"] | null;

    get(path: any, location?: any): any {
        path = this.updatePath(path, location, false);

        if (!this.throwIfNotFound) {
            let result = null;
            try { result = this.internal.getData(path); } catch (error) { }
            return result;
        }

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
     * @param {string} key The key of the value.
     * @memberof TypedJsonDB
     */
    push<Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: ContentDef["paths"][Path]["valueType"], key: string): void;

    push(path: any, data: any, location?: any): void {
        path = this.updatePath(path, location, true);
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
        path = this.updatePath(path, location, false);
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
        path = this.updatePath(path, location, false);
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
        path = this.updatePath(path, location, false);
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