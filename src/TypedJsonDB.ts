import { JsonDB } from "node-json-db";

type EntryType = "singles" | "arrays" | "dictionaries";
type Dictionary<V> = { [key: string]: V };

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

    set<Path extends keyof ContentDef["singles"]>(path: Path, data: ContentDef["singles"][Path]) {
        this.internalDB.push(path.toString(), data);
    }

    setArray<Path extends keyof ContentDef["arrays"]>(path: Path, data: ContentDef["arrays"][Path][]) {
        this.internalDB.push(path.toString(), data);
    }

    setDictionary<Path extends keyof ContentDef["dictionaries"]>(path: Path, data: Dictionary<ContentDef["dictionaries"][Path]>) {
        this.internalDB.push(path.toString(), data);
    }
}