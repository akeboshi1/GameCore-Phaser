import { Game, ISprite } from "gamecore";
import { ElementBaseAction } from "./element.base.action";
import { FuritElementAction } from "./furit.element.action";
import { PKTElementAction } from "./pkt.element.action";
import { TAGElementAction } from "./tag.element.action";

export class ElementActionManager {
    private mActionTags = ["TQ_PKT_Action", "TQ_PKT_tag", "frozenType"];
    private game: Game;
    constructor(game) {
        this.game = game;
    }
    public executeElementActions(data: ISprite) {
        const temptag = this.checkAllAction(data);
        for (const tag of temptag) {
            const action = this.createElementAction(data, tag);
            action.executeAction();
        }
    }
    public checkAllAction(data: ISprite) {
        const temptag = [];
        for (const value of this.mActionTags) {
            if (this.checkAction(data, value)) {
                temptag.push(value);
            }
        }
        return temptag;
    }

    public checkAction(data: ISprite, actionName?: string) {
        if (actionName) {
            if (data && data.attrs) {
                const attrs = data.attrs;
                for (const att of attrs) {
                    if (att.key === actionName) {
                        return true;
                    }
                }
            }
            return false;
        } else {
        }
    }
    public getActionData(data: ISprite, actionName: string) {
        if (data && data.attrs) {
            const attrs = data.attrs;
            for (const att of attrs) {
                if (att.key === actionName) {
                    const actjson = att.value ? JSON.parse(att.value) : null;
                    return actjson;
                }
            }
        }
        return undefined;
    }

    public destroy() {
        this.game = undefined;
        this.mActionTags.length = 0;
        this.mActionTags = undefined;
    }

    private createElementAction(data: ISprite, actionName: string) {
        let eleaction: ElementBaseAction;
        switch (actionName) {
            case "TQ_PKT_Action":
                eleaction = new PKTElementAction(this.game, data);
            case "TQ_PKT_tag":
                eleaction = new TAGElementAction(this.game, data);
            case "frozenType":
                eleaction = new FuritElementAction(this.game, data);
        }
        return eleaction;
    }
}
