import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { KeyboardListener } from "../../game/keyboard.manager";
import { op_client } from "pixelpai_proto";
import IActor = op_client.IActor;
import { DragonbonesModel } from "../display/dragonbones.model";

// ME 我自己
export class Actor extends Player implements KeyboardListener {
    constructor(data: IActor, protected mElementManager: IElementManager) {
        super(mElementManager);
        const dbModel = new DragonbonesModel(data);
        this.load(dbModel);
        this.createDisplay();
    }

    onKeyDown(keys: number[]): void {
        // TODO
        const len: number = keys.length;
        let horizontalSpeed: number = 0;
        let verticalSpeed: number = 0;
        for (let i: number = 0; i < len; i++) {
            const key: number = keys[i];
            switch (key) {
                case 37:
                    horizontalSpeed += 10;
                    break;
                case 38:
                    verticalSpeed += 10;
                    break;
                case 39:
                    horizontalSpeed -= 10;
                    break;
                case 40:
                    verticalSpeed -= 10;
                    break;
            }
        }
    }

    onKeyUp(keys: number[]): void {
        // TODO
    }
}
