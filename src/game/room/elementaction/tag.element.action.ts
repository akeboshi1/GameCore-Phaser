import { EventType } from "structure";
import { ElementBaseAction } from "./element.base.action";

export class TAGElementAction extends ElementBaseAction {
    public actionTag: string = "TQ_PKT_tag";
    public executeAction() {
        const data = this.getActionData();
        if (data) {
            switch (data.type) {
                case "mine":
                    this.executeMine();
                    break;
                case "crop":
                    this.executeCrop();
                    break;
            }
        }
    }

    private executeMine() {
        // const data = { weaponID: "5f912f98c4486f3a23bd2eb4", animator: "crafting" };
        const data = { weaponID: "5f912fc1f1d58a7199b745f0", animator: "crafting" };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, undefined, data);
    }

    private executeCrop() {
        const data = { weaponID: "5f912fc1f1d58a7199b745f0", animator: "crafting" };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, undefined, data);
    }
}
