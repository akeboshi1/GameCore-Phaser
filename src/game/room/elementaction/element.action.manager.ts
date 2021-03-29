import { Game } from "gamecore";
import { ISprite } from "structure";
export class ElementActionManager {
    protected mActionTags = [];
    protected game: Game;
    constructor(game) {
        this.game = game;
    }
    public executeElementActions(data: ISprite, userid?: number) {
        const temptag = this.checkAllAction(data);
        for (const tag of temptag) {
            const action = this.createElementAction(data, tag, userid);
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
        return this.checkAttrsAction(data, actionName);
    }
    public checkAttrsAction(data: ISprite, actionName?: string) {
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
        if (this.mActionTags) this.mActionTags.length = 0;
        this.mActionTags = undefined;
    }

    protected createElementAction(data: ISprite, actionName: string, userid?: number) {
        return undefined;
    }
}
