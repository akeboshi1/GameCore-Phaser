import { ISprite } from "structure";
import { ElementActionManager } from "./element.action.manager";
import { ElementBaseAction } from "./element.base.action";
import { FuritElementAction } from "./furit.element.action";
import { FuritElementChangeAction } from "./furit.element.change.action";
import { PKTElementAction } from "./pkt.element.action";
import { TAGElementAction } from "./tag.element.action";

export class PicaElementActionManager extends ElementActionManager {
    protected mActionTags = ["TQ_PKT_Action", "TQ_PKT_tag", "frozenType", "FuritChange"];
    public checkAction(data: ISprite, actionName?: string) {
        if (actionName) {
            if (actionName === "FuritChange" && data.nodeType === 3) {
                return true;
            } else {
                if (data && data.attrs) {
                    const attrs = data.attrs;
                    for (const att of attrs) {
                        if (att.key === actionName) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }

    protected createElementAction(data: ISprite, actionName: string, userid?: number) {
        let eleaction: ElementBaseAction;
        switch (actionName) {
            case "TQ_PKT_Action":
                eleaction = new PKTElementAction(this.game, data, userid);
                break;
            case "TQ_PKT_tag":
                eleaction = new TAGElementAction(this.game, data, userid);
                break;
            case "frozenType":
                eleaction = new FuritElementAction(this.game, data, userid);
                break;
            case "FuritChange":
                eleaction = new FuritElementChangeAction(this.game, data, userid);
                break;
        }
        return eleaction;
    }

}
