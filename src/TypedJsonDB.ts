import { JsonDB, FindCallback } from "node-json-db";
import { DataError } from "node-json-db/dist/lib/Errors";

type EntryType = "singles" | "arrays" | "dictionaries";
type Dictionary<V> = { [key: string]: V };

type AllUnionKeys<T> = T extends any ? keyof T : never;

export type ContentBase = {
    [path in EntryType]: any;
};

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

    /**
     * Creates an instance of TypedJsonDB.
     * @param {string} filename Where to save the database.
     * @param {boolean} [saveOnPush] Save the database at each push command into the json file.
     * @param {boolean} [humanReadable] The json file will be easily readable by a human.
     * @param {string} [separator] What to use as a separator.
     * @memberof TypedJsonDB
     */
    constructor(filename: string, saveOnPush?: boolean, humanReadable?: boolean, separator?: string) {
        this.internalDB = new JsonDB(filename, saveOnPush, humanReadable, separator);
    }

    /**
     * Push initial data when it doesn't exist.
     * @param path 
     * @param initialValue 
     */
    pushIfNotExists(path: string, initialValue: any): void {
        if (!this.internalDB.exists(path)) {
            this.internalDB.push(path, initialValue);
        }
    }

    /**
     * Get data from database.
     * @param path 
     * @returns null if not found.
     */
    get(path: string): any {
        if (this.internalDB.exists(path)) {
            return this.internalDB.getData(path);
        }

        return null;
    }

    /**
     * Check for existing datapath
     * @param dataPath
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

    delete<Path extends AllUnionKeys<ContentDef["singles"] | ContentDef["arrays"] | ContentDef["dictionaries"]>>(path: Path) {
        this.internalDB.delete(path.toString());
    }

    set<Path extends keyof ContentDef["singles"]>(path: Path, data: ContentDef["singles"][Path], override?: boolean) {
        this.internalDB.push(path.toString(), data, override);
    }

    arraySet<Path extends keyof ContentDef["arrays"]>(path: Path, data: ContentDef["arrays"][Path][], override?: boolean) {
        this.internalDB.push(path.toString(), data, override);
    }

    arrayPush<Path extends keyof ContentDef["arrays"]>(path: Path, data: ContentDef["arrays"][Path], override?: boolean) {
        this.internalDB.push(`${path.toString()}[]`, data, override);
    }

    arrayPushAt<Path extends keyof ContentDef["arrays"]>(path: Path, index: number, data: ContentDef["arrays"][Path], override?: boolean) {
        this.internalDB.push(`${path.toString()}[${index}]`, data, override);
    }

    arrayGet<Path extends keyof ContentDef["arrays"]>(path: Path): ContentDef["arrays"][Path] | null {
        return this.get(path.toString());
    }

    arrayGetAt<Path extends keyof ContentDef["arrays"]>(path: Path, index: number): ContentDef["arrays"][Path] | null {
        return this.get(`${path.toString()}[${index}]`);
    }

    dictionarySet<Path extends keyof ContentDef["dictionaries"]>(path: Path, data: Dictionary<ContentDef["dictionaries"][Path]>, override?: boolean) {
        this.internalDB.push(path.toString(), data, override);
    }

    dictionaryPush<Path extends keyof ContentDef["dictionaries"]>(path: Path, property: string, data: ContentDef["dictionaries"][Path], override?: boolean) {
        if (!property.match(/^[^\/[]+\/?$/)) {
            throw new DataError("You can't set a complex property. The return type wouldn't be correct. Use the internal database.", 99);
        }

        this.internalDB.push(`${path.toString()}/${property}`, data, override);
    }

    dictionaryGet<Path extends keyof ContentDef["dictionaries"]>(path: Path): ContentDef["dictionaries"][Path] | null {
        return this.get(path.toString());
    }

    dictionaryGetAt<Path extends keyof ContentDef["dictionaries"]>(path: Path, property: string): ContentDef["dictionaries"][Path] | null {
        if (!property.match(/^[^\/[]+\/?$/)) {
            throw new DataError("You can't set a complex property. The return type wouldn't be correct. Use the internal database.", 99);
        }

        return this.get(`${path.toString()}/${property}`);
    }
}