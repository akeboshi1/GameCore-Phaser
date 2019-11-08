import * as Chance from "chance";

export default class Helpers {
    static genId(): number {
        return new Chance().natural({
            min: 10000,
            max: Number.MAX_VALUE
        });
    }
}
