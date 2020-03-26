import { ContentBase } from "../src/TypedJsonDB";

export interface Restaurant {
    name: string
    chef: string,
    memberCount: number,
    turnOver: number
}

export interface DbContent extends ContentBase {
    singles: {
        '/login': {
            username: string,
            password: string
        }
    },
    arrays: {
        '/restaurants': Restaurant[]
    }
}