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
 * The base structure for an entry.
 */
type EntryBase<T extends EntryType, U, V> = {
    entryType: T,
    baseType: U,
    dataType: V
};

/**
 * The structure for an entry of type "single".
 */
type SingleEntry<T> = EntryBase<"single", T, T>;

/**
 * The structure for an entry of type "array".
 */
type ArrayEntry<T> = EntryBase<"array", T, T[]>;

/**
 * The structure for an entry of type "dictionary".
 */
type DictionaryEntry<T> = EntryBase<"dictionary", T, Dictionary<T>>;

/**
 * The base structure of the json database.
 */
export type ContentBase = {
    [root in "paths"]: {
        [path: string]: SingleEntry<any> | ArrayEntry<any> | DictionaryEntry<any>
    }
};

/**
 * Used for runtime "type checking". Didn't find another solution.
 */
export interface ContentInstance {
    [path: string]: EntryType
}

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
    internal: JsonDB;
    contentInstance: ContentInstance;

    /**
     * Creates an instance of TypedJsonDB.
     * @param {string} filename Where to save the database.
     * @param {ContentInstance} contentInstance
     * @param {boolean} [saveOnPush] Save the database at each push command into the json file.
     * @param {boolean} [humanReadable] The json file will be easily readable by a human.
     * @param {string} [separator] What to use as a separator.
     * @memberof TypedJsonDB
     */
    constructor(filename: string, contentInstance: ContentInstance, saveOnPush?: boolean, humanReadable?: boolean, separator?: string) {
        this.internal = new JsonDB(filename, saveOnPush, humanReadable, separator);
        this.contentInstance = contentInstance;
    }

    /**
     * Ensures that the object key is simple to get the good return type.
     *
     * @param {(string | null)} key The object key to check.
     * @throws {DataError} when the object key is complex.
     * @memberof TypedJsonDB
     */
    ensureSimpleDictionaryKey(key: string | null): void {
        if (key === null) {
            throw new DataError("You must give the key where to push in the dictionary.", 98);
        }

        if (!key.match(/^[^\/[]+\/?$/)) {
            throw new DataError("You can't set a complex dictionary key. The return type wouldn't be correct. Use the internal database.", 99);
        }
    }

    /**
     * Push full initial data when it doesn't exist.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {ContentDef["paths"][Path]["dataType"]} initialValue The initial value to set.
     * @memberof TypedJsonDB
     */
    pushIfNotExists<Path extends GetKey<ContentDef["paths"]>>(path: Path, initialValue: ContentDef["paths"][Path]["dataType"]): void {
        if (!this.internal.exists(path)) {
            this.internal.push(path, initialValue);
        }
    }

    /**
     * Gets the full data at a given path (not a given value of an array or a dictionary).
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @returns {ContentDef["paths"][Path]["dataType"]} The wanted value, typed.
     * @memberof TypedJsonDB
     */
    get<Path extends GetKey<ContentDef["paths"]>>(path: Path): ContentDef["paths"][Path]["dataType"] {
        return this.secureGet(path);
    }

    /**
     * A raw data getter, which checks for the existance of data before getting it.
     *
     * @param {string} path The user specified path to data. Autocomplete not available.
     * @returns {*} The wanted value, not typed.
     * @memberof TypedJsonDB
     */
    secureGet(path: string): any {
        if (this.internal.exists(path)) {
            return this.internal.getData(path);
        }

        return null;
    }

    /**
     * A secure version of push() which can throw if data doesn't exist before pushing.
     *
     * @param {string} path The user specified path to data.
     * @param {*} data Some data to push.
     * @param {boolean} [overwrite] Whether to overwrite data at the given path. If false, data will be merged (default = true).
     * @param {boolean} [throwIfNotExists] Whether to throw an error if data doesn't exist (default = false).
     * @throws {DataError} if data doesn't exist at the specified path.
     * @memberof TypedJsonDB
     */
    securePush(path: string, data: any, overwrite: boolean, throwIfNotExists: boolean): void {
        if (!throwIfNotExists || this.internal.exists(this.removeEmptySquareBrackets(path))) {
            this.internal.push(path, data, overwrite);
        } else {
            throw new DataError("You must push the data once before being able to merge it.", 96);
        }
    }

    /**
     * Removes empty square brackets from a path, so that the exists() function finds the path.
     *
     * @param {string} path The user specified path to data.
     * @returns {string}
     * @memberof TypedJsonDB
     */
    removeEmptySquareBrackets(path: string): string {
        return path.replace(/(\/[^[]+)\[\]$/, "$1");
    }

    /**
     * Gets a given value of an array or a dictionary. By default, gets the last element of an array.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {(string | number)} key The key where to find the data (optional for arrays, required for dictionaries).
     * @returns {ContentDef["paths"][Path]["baseType"]} The wanted value, typed.
     * @memberof TypedJsonDB
     */
    getAt<Path extends GetKey<ContentDef["paths"]>>(path: Path, key?: string | number): ContentDef["paths"][Path]["baseType"] {
        switch (this.contentInstance[path]) {
            case "single":
                throw new DataError("Please use the get() method. You can't get a single object at a given key.", 97);
            case "array":
                if (key === undefined) {
                    return this.secureGet(`${path}[-1]`); // Get the last object by default.
                } else {
                    return this.secureGet(`${path}[${key}]`);
                }
            case "dictionary":
                this.ensureSimpleDictionaryKey(key === undefined ? null : key.toString());
                return this.secureGet(`${path}/${key}`);
        }
    }

    /**
     * Check if data exists at the given path.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @returns {boolean} Whether data exists.
     * @memberof TypedJsonDB
     */
    exists<Path extends GetKey<ContentDef["paths"]>>(path: Path): boolean {
        return this.internal.exists(path);
    }

    /**
     * Find all specific entry in an array / object.
     * @param rootPath Base dataPath from where to start searching
     * @param callback Method to filter the result and find the wanted entry. Receive the entry and its index.
     */
    filter<T, Path extends GetKey<ContentDef["paths"]>>(rootPath: Path, callback: FindCallback): T[] | undefined {
        return this.internal.filter<T>(rootPath, callback);
    }

    /**
     * Find a specific entry in an array / object.
     * @param rootPath Base dataPath from where to start searching
     * @param callback Method to filter the result and find the wanted entry. Receive the entry and its index.
     */
    find<T, Path extends GetKey<ContentDef["paths"]>>(rootPath: Path, callback: FindCallback): T | undefined {
        return this.internal.find<T>(rootPath, callback);
    }

    /**
     * Deletes the data at the given path.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @memberof TypedJsonDB
     */
    delete<Path extends GetKey<ContentDef["paths"]>>(path: Path): void {
        this.internal.delete(path);
    }

    /**
     * Sets full data at the given path.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {ContentDef["paths"][Path]["dataType"]} data Some data to set.
     * @param {boolean} [overwrite] Whether to overwrite data at the given path. If false, data will be merged (true by default).
     * @memberof TypedJsonDB
     */
    set<Path extends GetKey<ContentDef["paths"]>>(path: Path, data: ContentDef["paths"][Path]["dataType"], overwrite?: boolean): void {
        this.internal.push(path, data, overwrite);
    }

    /**
     * Pushes data at the given path.
     *
     * @template Path A path from any entry type (same behavior as set() for single objects).
     * @param {Path} path The user specified path to data.
     * @param {ContentDef["paths"][Path]["baseType"]} data Some data to push.
     * @param {(string | number)} key The key where to push the data (optional for single objects and arrays, required for dictionaries).
     * @param {boolean} [overwrite] Whether to overwrite data at the given path. If false, data will be merged (default = true).
     * @param {boolean} [throwIfNotExists] Whether to throw an error if data doesn't exist (default = false).
     * @memberof TypedJsonDB
     */
    push<Path extends GetKey<ContentDef["paths"]>>(path: Path, data: ContentDef["paths"][Path]["baseType"], key?: string | number, overwrite: boolean = true, throwIfNotExists: boolean = false): void {
        switch (this.contentInstance[path]) {
            case "single":
                this.securePush(path, data, overwrite, throwIfNotExists);
                break;
            case "array":
                if (key === undefined) {
                    this.securePush(`${path}[]`, data, overwrite, throwIfNotExists);
                } else {
                    this.securePush(`${path}[${key}]`, data, overwrite, throwIfNotExists);
                }
                break;
            case "dictionary":
                this.ensureSimpleDictionaryKey(key === undefined ? null : key.toString());
                this.securePush(`${path}/${key}`, data, overwrite, throwIfNotExists);
                break;
        }
    }

    /**
     * Merges data at the given path. Data must already exist at the given path to ensure the right database structure is followed.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {Partial<ContentDef["paths"][Path]["baseType"]>} data Some data to merge.
     * @param {(string | number)} key The key where to push the data (optional for single objects, required for arrays and dictionaries).
     * @throws {DataError} if data doesn't exist at the specified path.
     * @memberof TypedJsonDB
     */
    merge<Path extends GetKey<ContentDef["paths"]>>(path: Path, data: Partial<ContentDef["paths"][Path]["baseType"]>, key?: string | number): void {
        switch (this.contentInstance[path]) {
            case "single":
                this.securePush(path, data, false, true);
                break;
            case "array":
                if (key === undefined) throw new DataError("You must give the index where to push in the array.", 95);
                this.securePush(`${path}[${key}]`, data, false, true);
                break;
            case "dictionary":
                this.ensureSimpleDictionaryKey(key === undefined ? null : key.toString());
                this.securePush(`${path}/${key}`, data, false, true);
                break;
        }
    }
}