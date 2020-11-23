import { Element, ISprite } from "gamecore";
import { Handler } from "utils";
export class ElementAction {
    public static hasAction(data: ISprite, actionName?: string) {
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
    public static getActionData(data: ISprite, actionName: string) {
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
    public data: ISprite;
    private action: Handler;
    constructor(data: ISprite, action: Handler) {
        this.data = data;
        this.action = action;
    }
    public executeAction(ele: Element, actionName: string) {
        const data = ElementAction.getActionData(ele.model, actionName);
        if (data) {
            if (this.action) this.action.runWith(data);
            return true;
        }
        return false;
    }

    destroy() {
        if (this.action) {
            this.action.clear();
            this.action = undefined;
        }
        this.data = undefined;
    }
}
