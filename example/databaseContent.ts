import { ContentBase, Dictionary } from "../src";

export interface Restaurant {
    name: string
    chef: string,
    memberCount: number,
    turnOver: number
}

export interface Login {
    username: string,
    password: string
}

export interface ContentDef extends ContentBase {
    paths: {
        '/login': {
            entryType: "single",
            valueType: Login
        },
        '/restaurants': {
            entryType: "array",
            valueType: Restaurant
        },
        '/teams': {
            entryType: "dictionary",
            valueType: string
        }
    }
}