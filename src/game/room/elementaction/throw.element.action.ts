import { Game } from "gamecore";
import { BaseDataConfigManager } from "picaWorker";
import { Logger } from "utils";
export class ThrowElementAction {
    public actionTag: string = "push";
    constructor(private game: Game, private data: any, private userid: number) {

    }
    public executeAction() {
        this.getActionData().then((element) => {
            if (!element || !element.animationDisplay || !element.animations) {
                return Logger.getInstance().warn("Failed to execute action plus. element can't find");
            }
            this.game.renderPeer.throwElement(this.userid, this.data.targetId, element.animationDisplay, element.animations);
        });
    }

    getActionData() {
        // return (<any> this.game.configManager).getItemBaseByID("IF0000255");
        const configManager = (<BaseDataConfigManager> this.game.configManager);
        const item = configManager.getItemBaseByID(this.data.id);
        if (!item) {
            return;
        }
        return configManager.checkDynamicElementPI({ sn: item.sn, itemid: this.data.id, serialize: item.serializeString });
    }
}
