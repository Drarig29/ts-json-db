import { ContentBase, Dictionary, ContentInstance } from "../src";

export interface Restaurant {
    name: string
    chef: string,
    memberCount: number,
    turnOver: number
}

export const contentInstance: ContentInstance = {
    '/login': "singles",
    '/restaurants': "arrays",
    '/teams': "dictionaries"
};

export interface ContentDef extends ContentBase {
    singles: {
        '/login': {
            parentEntryType: "singles",
            dataType: {
                username: string,
                password: string
            }
        }
    },
    arrays: {
        '/restaurants': {
            parentEntryType: "arrays",
            baseType: Restaurant,
            dataType: Restaurant[]
        }
    },
    dictionaries: {
        '/teams': {
            parentEntryType: "dictionaries",
            baseType: string,
            dataType: Dictionary<string>
        }
    }
}