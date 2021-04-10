import { ISprite } from "structure";
import { ElementActionManager } from "./element.action.manager";
import { ElementBaseAction } from "./element.base.action";
export declare class PicaElementActionManager extends ElementActionManager {
    protected mActionTags: string[];
    protected mNeedBroadcastTags: string[];
    checkAction(data: ISprite, actionName?: string): boolean;
    protected createElementAction(data: any, actionName: string, userid?: number): ElementBaseAction;
}
