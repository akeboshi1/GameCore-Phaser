import {Player} from "./player";
import {IElementManager} from "../element/element.manager";
import {KeyboardListener} from "../../game/keyboard.manager";

// ME 我自己
export class Actor extends Player implements KeyboardListener {
    constructor(protected mElementManager: IElementManager) {
        super(mElementManager);
    }

    onKeyDown(keys: number[]): void {
        // TODO
    }

    onKeyUp(keys: number[]): void {
        // TODO
    }
}
