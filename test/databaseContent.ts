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

export interface Login {
    username: string,
    password: string
}

export interface ContentDef extends ContentBase {
    paths: {
        '/login': {
            entryType: "single",
            baseType: Login,
            dataType: Login
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