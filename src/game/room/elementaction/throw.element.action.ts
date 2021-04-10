import { Game } from "gamecore";
import { Logger } from "utils";
export class ThrowElementAction {
    public actionTag: string = "push";
    constructor(private game: Game, private data: any, private userid: number) {

    }
    public executeAction() {
        const element = this.getActionData();
        if (!element || !element.animationDisplay || !element.animations) {
            return Logger.getInstance().warn("Failed to execute action plus. element can't find");
        }
        this.game.renderPeer.throwElement(this.userid, this.data.targetId, element.animationDisplay, element.animations);
    }

    getActionData() {
        // return (<any> this.game.configManager).getItemBaseByID("IF0000255");
        return (<any> this.game.configManager).getItemBaseByID(this.data.id);
    }
}
