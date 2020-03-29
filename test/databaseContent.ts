import { ContentBase, Dictionary, ContentInstance } from "../src";

export interface Restaurant {
    name: string
    chef: string,
    memberCount: number,
    turnOver: number
}

export const contentInstance: ContentInstance = {
    '/login': "single",
    '/restaurants': "array",
    '/teams': "dictionary"
};

export interface ContentDef extends ContentBase {
    paths: {
        '/login': {
            entryType: "single",
            dataType: {
                username: string,
                password: string
            }
        },
        '/restaurants': {
            entryType: "array",
            baseType: Restaurant,
            dataType: Restaurant[]
        },
        '/teams': {
            entryType: "dictionary",
            baseType: string,
            dataType: Dictionary<string>
        }
    }
}