import * as Chance from "chance";

export default class Helpers {
    static readonly MAX_ID: number = Math.pow(2, 31);
    static genId(): number {
        return new Chance().natural({
            min: 10000,
            max: Helpers.MAX_ID
        });
    }
}
