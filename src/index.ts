import { JsonDB, FindCallback } from "node-json-db";
import { DataError } from "node-json-db/dist/lib/Errors";

/**
 * The possible entry types for the json database.
 */
type EntryType = "singles" | "arrays" | "dictionaries";

/**
 * Creates a dictionary (JS object) which maps a string to the given type.
 */
export type Dictionary<V> = { [key: string]: V };

/**
 * Gets all the keys from a union of objects.
 * @see https://stackoverflow.com/a/52221718/3970387
 */
type AllUnionKeys<T> = T extends any ? keyof T : never;

type ObjKeyOf<T> = T extends object ? keyof T : never
type KeyOfKeyOf<T> = ObjKeyOf<T> | { [K in keyof T]: ObjKeyOf<T[K]> }[keyof T]
type StripNever<T> = Pick<T, { [K in keyof T]: [T[K]] extends [never] ? never : K }[keyof T]>;
type Lookup<T, K> = T extends any ? K extends keyof T ? T[K] : never : never

type GetKey<T> = Extract<keyof T, string>;

/**
 * Flattens all the second levels into the first level of an object.
 * @see https://github.com/Microsoft/TypeScript/issues/31192#issuecomment-488391189
 */
type Flatten<T> = T extends object ? StripNever<{ [K in KeyOfKeyOf<T>]:
    Exclude<K extends keyof T ? T[K] : never, object> |
    { [P in keyof T]: Lookup<T[P], K> }[keyof T]
}> : T

/**
 * The base structure of the json database.
 */
export type ContentBase = {
    [entry in EntryType]: {
        [path: string]: {
            parentEntryType: entry,
            baseType?: any,
            dataType: any
        }
    };
};

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
    instance: ContentInstance;

    /**
     * Creates an instance of TypedJsonDB.
     * @param {string} filename Where to save the database.
     * @param {boolean} [saveOnPush] Save the database at each push command into the json file.
     * @param {boolean} [humanReadable] The json file will be easily readable by a human.
     * @param {string} [separator] What to use as a separator.
     * @memberof TypedJsonDB
     */
    constructor(filename: string, instance: ContentInstance, saveOnPush?: boolean, humanReadable?: boolean, separator?: string) {
        this.internalDB = new JsonDB(filename, saveOnPush, humanReadable, separator);
        this.instance = instance;
    }

    /**
     * Ensures that the object key is simple to get the good return type.
     *
     * @param {string} key The object key to check.
     * @throws {DataError} when the object key is complex.
     * @memberof TypedJsonDB
     */
    ensureSimpleKey(key: string | undefined): void {
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
     * @template Flattened The flattened ContentDef, to get the dataType.
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {*} initialValue The initial value to set.
     * @memberof TypedJsonDB
     */
    pushIfNotExists<Flattened extends Flatten<ContentDef>, Path extends GetKey<Flattened>>(path: Path, initialValue: Flattened[Path]["dataType"]): void {
        if (!this.internalDB.exists(path.toString())) {
            this.internalDB.push(path.toString(), initialValue);
        }
    }

    /**
     * Gets the full data at a given path (not a given value of an array or a dictionary).
     *
     * @template Flattened The flattened ContentDef, to get the dataType.
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @returns {Flattened[Path]["dataType"]} The wanted value, typed.
     * @memberof TypedJsonDB
     */
    get<Flattened extends Flatten<ContentDef>, Path extends GetKey<Flattened>>(path: Path): Flattened[Path]["dataType"] {
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
     * @template Flattened The flattened ContentDef, to get the dataType.
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {(string | number)} key The key where to find the data (optional for arrays, mandatory for dictionaries).
     * @returns {Flattened[Path]["baseType"]} The wanted value, typed.
     * @memberof TypedJsonDB
     */
    getAt<Flattened extends Flatten<ContentDef>, Path extends GetKey<Flattened>>(path: Path, key?: string | number): Flattened[Path]["baseType"] {
        switch (this.instance[path]) {
            case "singles":
                throw new DataError("Please use the get() method. You can't get a single object at a given key.", 97);
            case "arrays":
                if (key) {
                    return this.secureGet(`${path}[${key}]`);
                } else {
                    return this.secureGet(`${path}[-1]`); // Get the last object by default.
                }
            case "dictionaries":
                this.ensureSimpleKey(key?.toString());
                return this.secureGet(`${path.toString()}/${key}`);
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
    exists<Path extends AllUnionKeys<ContentDef["singles"] | ContentDef["arrays"] | ContentDef["dictionaries"]>>(path: Path): boolean {
        return this.internalDB.exists(path.toString());
    }

    /**
     * Find all specific entry in an array / object.
     * @param rootPath Base dataPath from where to start searching
     * @param callback Method to filter the result and find the wanted entry. Receive the entry and its index.
     */
    filter<T, Path extends AllUnionKeys<ContentDef["singles"] | ContentDef["arrays"] | ContentDef["dictionaries"]>>(rootPath: Path, callback: FindCallback): T[] | undefined {
        return this.internalDB.filter<T>(rootPath.toString(), callback);
    }

    /**
     * Find a specific entry in an array / object.
     * @param rootPath Base dataPath from where to start searching
     * @param callback Method to filter the result and find the wanted entry. Receive the entry and its index.
     */
    find<T, Path extends AllUnionKeys<ContentDef["singles"] | ContentDef["arrays"] | ContentDef["dictionaries"]>>(rootPath: Path, callback: FindCallback): T | undefined {
        return this.internalDB.find<T>(rootPath.toString(), callback);
    }

    /**
     * Deletes the data at the given path.
     *
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @memberof TypedJsonDB
     */
    delete<Path extends AllUnionKeys<ContentDef["singles"] | ContentDef["arrays"] | ContentDef["dictionaries"]>>(path: Path) {
        this.internalDB.delete(path.toString());
    }

    /**
     * Sets data at the given path.
     *
     * @template Flattened The flattened ContentDef, to get the dataType.
     * @template Path A path from any entry type.
     * @param {Path} path The user specified path to data.
     * @param {Flattened[Path]["dataType"]} data Some data to set.
     * @param {boolean} [overwrite] Whether to overwrite data at the given path. If false, data will be merged.
     * @memberof TypedJsonDB
     */
    set<Flattened extends Flatten<ContentDef>, Path extends GetKey<Flattened>>(path: Path, data: Flattened[Path]["dataType"], overwrite?: boolean) {
        this.internalDB.push(path, data, overwrite);
    }

    /**
     * 
     *
     * @template Flattened The flattened ContentDef, to get the dataType.
     * @template Path A path from any entry type (same behavior as set() for single objects).
     * @param {Path} path The user specified path to data.
     * @param {Flattened[Path]["baseType"]} data Some data to add to an array or a dictionary.
     * @param {(string | number)} key The key where to push the data (optional for single objects and arrays, mandatory for dictionaries).
     * @param {boolean} [overwrite] Whether to overwrite data at the given path. If false, data will be merged.
     * @memberof TypedJsonDB
     */
    push<Flattened extends Flatten<ContentDef>, Path extends GetKey<Flattened>>(path: Path, data: Flattened[Path]["baseType"], key?: string | number, overwrite?: boolean) {
        switch (this.instance[path]) {
            case "singles":
                this.internalDB.push(path, data, overwrite);
                break;
            case "arrays":
                if (key) {
                    this.internalDB.push(`${path}[${key}]`, data, overwrite);
                } else {
                    this.internalDB.push(`${path}[]`, data, overwrite);
                }
                break;
            case "dictionaries":
                this.ensureSimpleKey(key?.toString());
                this.internalDB.push(`${path.toString()}/${key}`, data, overwrite);
                break;
        }
    }
}