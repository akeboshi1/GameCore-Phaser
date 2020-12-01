import { Element } from "../element/element";
import { ISprite } from "../display/sprite/sprite";
import { Handler } from "utils";
import { Game } from "gamecore";
export class ElementBaseAction {

    public data: ISprite;
    public game: Game;
    public actionTag: string;
    constructor(game: Game, data: ISprite) {
        this.data = data;
        this.game = game;
    }
    public executeAction() {

    }

    destroy() {
        this.game = undefined;
        this.data = undefined;
    }
    getActionData() {
        const data = this.data;
        const tag = this.actionTag;
        if (data && data.attrs) {
            const attrs = data.attrs;
            for (const att of attrs) {
                if (att.key === tag) {
                    const actjson = att.value ? JSON.parse(att.value) : null;
                    return actjson;
                }
            }
        }
        return undefined;
    }
}