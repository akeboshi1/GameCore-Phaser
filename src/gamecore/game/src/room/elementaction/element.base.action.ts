import { Game } from "../../game";
import { ISprite } from "structure";
export class ElementBaseAction {

    public data: ISprite;
    public game: Game;
    public actionTag: string;
    public userid: number;
    constructor(game: Game, data: ISprite, userid?: number) {
        this.data = data;
        this.game = game;
        this.userid = userid;
    }
    public executeAction() {

    }

    destroy() {
        this.game = undefined;
        this.data = undefined;
    }
    getActionData(actionName?: string) {
        const data = this.data;
        const tag = actionName || this.actionTag;
        if (data && data.attrs) {
            const attrs = data.attrs;
            for (const att of attrs) {
                if (att.key === tag) {
                    return att.value ;
                }
            }
        }
        return undefined;
    }
}
