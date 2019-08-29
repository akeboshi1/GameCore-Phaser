import {Player} from "./player";
import {IElementManager} from "../element/element.manager";

// ME 我自己
export class Actor extends Player {
    constructor(protected mElementManager: IElementManager) {
        super(mElementManager);
    }
}
