import {Player} from "./player";
import {IElementManager} from "../element/element.manager";
import {KeyboardListener} from "../../game/keyboard.manager";
import {op_client} from "pixelpai_proto";
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
    }

    onKeyUp(keys: number[]): void {
        // TODO
    }
}
