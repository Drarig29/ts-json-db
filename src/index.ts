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
            baseType?: any,
            dataType: any
        }
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
    internalDB: JsonDB;
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
        this.internalDB = new JsonDB(filename, saveOnPush, humanReadable, separator);
        this.contentInstance = contentInstance;
    }

    /**
     * Ensures that the object key is simple to get the good return type.
     *
     * @param {string} key The object key to check.
     * @throws {DataError} when the object key is complex.
     * @memberof TypedJsonDB
     */
    ensureSimpleKey(key: string | null): void {
        if (!key) {
            throw new DataError("You have to give a key where to push.", 98);
        }

        if (!key.match(/^[^\/[]+\/?$/)) {
            throw new DataError("You can't set a complex object key. The return type wouldn't be correct. Use the internal database.", 99);
        }
    }

    /**
     * Push initial data when it doesn't exist.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {ContentDef["paths"][Path]["dataType"]} initialValue The initial value to set.
     * @memberof TypedJsonDB
     */
    pushIfNotExists<Path extends GetKey<ContentDef["paths"]>>(path: Path, initialValue: ContentDef["paths"][Path]["dataType"]): void {
        if (!this.internalDB.exists(path)) {
            this.internalDB.push(path, initialValue);
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
     * @returns {*}
     * @memberof TypedJsonDB
     */
    secureGet(path: string): any {
        if (this.internalDB.exists(path)) {
            return this.internalDB.getData(path);
        }

        return null;
    }

    /**
     * Gets a given value of an array or a dictionary. By default, gets the last element of an array.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {(string | number)} key The key where to find the data (optional for arrays, mandatory for dictionaries).
     * @returns {ContentDef["paths"][Path]["baseType"]} The wanted value, typed.
     * @memberof TypedJsonDB
     */
    getAt<Path extends GetKey<ContentDef["paths"]>>(path: Path, key?: string | number): ContentDef["paths"][Path]["baseType"] {
        switch (this.contentInstance[path]) {
            case "single":
                throw new DataError("Please use the get() method. You can't get a single object at a given key.", 97);
            case "array":
                if (key) {
                    return this.secureGet(`${path}[${key}]`);
                } else {
                    return this.secureGet(`${path}[-1]`); // Get the last object by default.
                }
            case "dictionary":
                this.ensureSimpleKey(key ? key.toString() : null);
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
        return this.internalDB.exists(path);
    }

    /**
     * Find all specific entry in an array / object.
     * @param rootPath Base dataPath from where to start searching
     * @param callback Method to filter the result and find the wanted entry. Receive the entry and its index.
     */
    filter<T, Path extends GetKey<ContentDef["paths"]>>(rootPath: Path, callback: FindCallback): T[] | undefined {
        return this.internalDB.filter<T>(rootPath, callback);
    }

    /**
     * Find a specific entry in an array / object.
     * @param rootPath Base dataPath from where to start searching
     * @param callback Method to filter the result and find the wanted entry. Receive the entry and its index.
     */
    find<T, Path extends GetKey<ContentDef["paths"]>>(rootPath: Path, callback: FindCallback): T | undefined {
        return this.internalDB.find<T>(rootPath, callback);
    }

    /**
     * Deletes the data at the given path.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @memberof TypedJsonDB
     */
    delete<Path extends GetKey<ContentDef["paths"]>>(path: Path): void {
        this.internalDB.delete(path);
    }

    /**
     * Sets data at the given path.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {ContentDef["paths"][Path]["dataType"]} data Some data to set.
     * @param {boolean} [overwrite] Whether to overwrite data at the given path. If false, data will be merged.
     * @memberof TypedJsonDB
     */
    set<Path extends GetKey<ContentDef["paths"]>>(path: Path, data: ContentDef["paths"][Path]["dataType"], overwrite?: boolean): void {
        this.internalDB.push(path, data, overwrite);
    }

    /**
     * 
     *
     * @template Path A path from any entry type (same behavior as set() for single objects).
     * @param {Path} path The user specified path to data.
     * @param {(string | number)} key The key where to push the data (optional for single objects and arrays, mandatory for dictionaries).
     * @param {boolean} [overwrite] Whether to overwrite data at the given path. If false, data will be merged.
     * @memberof TypedJsonDB
     */
    push<Path extends GetKey<ContentDef["paths"]>>(path: Path, data: ContentDef["paths"][Path]["baseType"], key?: string | number, overwrite?: boolean): void {
        switch (this.contentInstance[path]) {
            case "single":
                this.internalDB.push(path, data, overwrite);
                break;
            case "array":
                if (key) {
                    this.internalDB.push(`${path}[${key}]`, data, overwrite);
                } else {
                    this.internalDB.push(`${path}[]`, data, overwrite);
                }
                break;
            case "dictionary":
                this.ensureSimpleKey(key ? key.toString() : null);
                this.internalDB.push(`${path}/${key}`, data, overwrite);
                break;
        }
    }
}