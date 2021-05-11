import { BaseConfigData } from "gamecore";
import { IElement } from "picaStructure";

export class Element2Config extends BaseConfigData {
    private elements: Map<string, IElement> = new Map();
    get(id: string): IElement {
        return this.elements.get(id);
    }

    parseJson(json) {
        const sheet1: IElement[] = json["Sheet1"];
        for (const temp of sheet1) {
            this.elements.set(temp.id, temp);
        }
    }
}
