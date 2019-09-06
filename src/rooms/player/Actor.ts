import { Player } from "./player";
import { IElementManager } from "../element/element.manager";
import { KeyboardListener } from "../../game/keyboard.manager";
import { op_client, op_def } from "pixelpai_proto";
import IActor = op_client.IActor;
import { DragonbonesModel } from "../display/dragonbones.model";

// ME 我自己
export class Actor extends Player implements KeyboardListener {
    constructor(id: number, protected mElementManager: IElementManager) {
        super(id, mElementManager);
        const dbModel = new DragonbonesModel(0);
        this.load(dbModel);
        // this.createDisplay();
    }

    onKeyDown(keys: number[]): void {
        // TODO
    }

    onKeyUp(keys: number[]): void {
        // TODO
    }
}
