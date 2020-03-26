export interface Restaurant {
    name: string
    chef: string,
    memberCount: number,
    turnOver: number
}

export interface DbContent {
    '/login': {
        username: string,
        password: string
    }

    '/restaurants': Restaurant[]
}