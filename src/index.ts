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
     *
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

    single = {
        get: <Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path): ContentDef["paths"][Path]["valueType"] => {
            return this.internal.getData(path);
        },
        set: <Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path, data: ContentDef["paths"][Path]["valueType"]): void => {
            this.internal.push(path, data, true);
        },
        merge: <Path extends PathsOfType<ContentDef["paths"], "single">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>): void => {
            if (!this.internal.exists(path)) 
                throw new Error("You tried to merge with unexisting data (single). The resulting type wouldn't be defined.");

            this.internal.push(path, data, false);
        }
    }

    array = {
        get: <Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path): ContentDef["paths"][Path]["valueType"][] => {
            return this.internal.getData(path);
        },
        set: <Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: ContentDef["paths"][Path]["valueType"][]): void => {
            this.internal.push(path, data, true);
        },
        value: {
            get: <Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, index?: number): ContentDef["paths"][Path]["valueType"] => {
                if (index === undefined)
                    return this.internal.getData(`${path}[-1]`);
                else
                    return this.internal.getData(`${path}[${index}]`);
            },
            push: <Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: ContentDef["paths"][Path]["valueType"], index?: number): void => {
                if (index === undefined)
                    return this.internal.push(`${path}[]`, data, true);
                else
                    return this.internal.push(`${path}[${index}]`, data, true);
            },
            merge: <Path extends PathsOfType<ContentDef["paths"], "array">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>, index: number): void => {
                const dataPath = `${path}[${index}]`;
                if (!this.internal.exists(dataPath)) 
                    throw new Error("You tried to merge with unexisting data (array). The resulting type wouldn't be defined.");

                return this.internal.push(dataPath, data, false);
            }
        }
    }

    dictionary = {
        get: <Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path): Dictionary<ContentDef["paths"][Path]["valueType"]> => {
            return this.internal.getData(path);
        },
        set: <Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: Dictionary<ContentDef["paths"][Path]["valueType"]>): void => {
            this.internal.push(path, data, true);
        },
        value: {
            get: <Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, key: string): ContentDef["paths"][Path]["valueType"] => {
                return this.internal.getData(`${path}/${key}`);
            },
            push: <Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: ContentDef["paths"][Path]["valueType"], key: string): void => {
                return this.internal.push(`${path}/${key}`, data, true);
            },
            merge: <Path extends PathsOfType<ContentDef["paths"], "dictionary">>(path: Path, data: Partial<ContentDef["paths"][Path]["valueType"]>, key: string): void => {
                const dataPath = `${path}/${key}`;
                if (!this.internal.exists(dataPath)) 
                    throw new Error("You tried to merge with unexisting data (dictionary). The resulting type wouldn't be defined.");

                return this.internal.push(dataPath, data, false);
            }
        }
    }
}