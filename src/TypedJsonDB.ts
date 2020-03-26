import { JsonDB } from "node-json-db";

interface ContentBase {
    [route: string]: any
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
     * Get the wanted typed data.
     * @template Path A path from the database definition.
     * @param {Path} path The always valid path, specified by the user.
     * @returns {ContentDef[Path]} The wanted data, with the good type.
     * @memberof TypedJsonDB
     */
    get<Path extends keyof ContentDef>(path: Path): ContentDef[Path] {
        return this.internalDB.getData(path.toString());
    }

    /**
     * Push data to database.
     * @template Path A path from the database definition.
     * @param {Path} path The always valid path, specified by the user.
     * @param {ContentDef[Path]} data
     * @param {boolean} [override] Whether to override the data. If false, the existing data will be merged.
     * @memberof TypedJsonDB
     */
    push<Path extends keyof ContentDef>(path: Path, data: ContentDef[Path], override?: boolean): void {
        this.internalDB.push(path.toString(), data, override);
    }

    /**
     * Check if data exists at the given path.
     * @template Path A path from the database definition.
     * @param {Path} path The always valid path, specified by the user.
     * @returns {boolean}
     * @memberof TypedJsonDB
     */
    exists<Path extends keyof ContentDef>(path: Path): boolean {
        return this.internalDB.exists(path.toString());
    }

    /**
     * Delete data at the given path.
     * @template Path A path from the database definition.
     * @param {Path} path The always valid path, specified by the user.
     * @memberof TypedJsonDB
     */
    delete<Path extends keyof ContentDef>(path: Path): void {
        this.internalDB.delete(path.toString());
    }
}