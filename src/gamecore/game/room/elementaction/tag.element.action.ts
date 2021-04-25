
import { EventType } from "structure";
import { ElementBaseAction } from "./element.base.action";

export class TAGElementAction extends ElementBaseAction {
    public actionTag: string = "TQ_PKT_tag";
    public executeAction() {
        const value = this.getActionData();
        const data = value ? JSON.parse(value) : undefined;
        if (data) {
            switch (data.type) {
                case "mine":
                    this.executeMine(data);
                    break;
                case "crop":
                    this.executeCrop(data);
                    break;
                case "pick":
                    this.executeCollect(data);
                    break;
                case "openchest":
                    this.executeOpenChest(data);
                    break;
            }
        }
    }

    private executeMine(data: any) {
        const tempdata = { weaponID: "5f912f98c4486f3a23bd2eb4", animation: "mining", times: data.repeat };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.userid, this.data.id, tempdata);
    }

    private executeCrop(data: any) {
        const tempdata = { weaponID: "5f912fc1f1d58a7199b745f0", animation: "crafting", times: data.repeat };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.userid, this.data.id, tempdata);
    }
    private executeCollect(data: any) {
        const tempdata = { animation: "collect", times: data.repeat };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.userid, this.data.id, tempdata);
    }
    private executeOpenChest(data: any) {
        const tempdata = { animation: "openchest", times: data.repeat };
        this.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.userid, this.data.id, tempdata);
    }
}
