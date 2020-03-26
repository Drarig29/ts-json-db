import { JsonDB } from "node-json-db";

export interface RestypedBase {
    [route: string]: any
}

export interface RestypedRoute {
    data: any
}

export default function TypedDatabase<APIDef extends RestypedBase>() {
    return {
        get: function <Path extends keyof APIDef>(path: Path) {
            return null;
        }
    }
}