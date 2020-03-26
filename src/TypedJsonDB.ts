import { JsonDB } from "node-json-db";

interface RestypedBase {
    [route: string]: any
}

interface RestypedRoute {
    data: any
}

/**
 * Typed wrapper around the JsonDB.
 */
export default class TypedJsonDB<APIDef extends RestypedBase> {

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

    get<Path extends keyof APIDef>(path: Path): APIDef[Path]['data'] {
        return null;
    }
}