import { Game } from "src/gamecore/game";
import { ThrowElementAction } from "./throw.element.action";

export class PicaPlayerActionManager  {
    constructor(protected game: Game) {
    }

    public executeElementActions(tag: string, data: any, userid?: number) {
        const action = this.createElementAction(tag, data, userid);
        if (action) action.executeAction();
    }

    createElementAction(tag: string, data: any, userid?: number) {
        switch (tag) {
            case "throwElement":
                return new ThrowElementAction(this.game, data, userid);
            default:
                //
        }
    }
}
