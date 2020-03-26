import { JsonDB } from "node-json-db";

interface ContentBase {
    [route: string]: any
}

/**
 * Typed wrapper around the JsonDB.
 */
export default class TypedJsonDB<ContentDef extends ContentBase> {

    /**
     * The encapsulated actual JSON database.
     *
     * @type {JsonDB}
     * @memberof TypedDatabase
     */
    internalDB: JsonDB;

    constructor(filename: string, saveOnPush?: boolean, humanReadable?: boolean, separator?: string) {
        this.internalDB = new JsonDB(filename, saveOnPush, humanReadable, separator);
    }

    get<Path extends keyof ContentDef>(path: Path): ContentDef[Path]['data'] {
        return null;
    }
}