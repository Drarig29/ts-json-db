export interface Restaurant {
    name: string
    chef: string,
    memberCount: number,
    turnOver: number
}

export interface DbContent {
    '/login': {
        data: {
            username: string,
            password: string
        }
    }

    '/restaurants': {
        data: Restaurant[]
    }
}