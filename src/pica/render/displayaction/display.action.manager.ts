import { Render } from "gamecoreRender";
import { Handler } from "utils";
import { DisplayBaseAction } from "./display.base.action";
import { ItemIntoPanel } from "./item.into.panel";
import { PlayerExplosiveAction } from "./player.explosive.action";

export class DisplayActionManager {
    protected render: Render;
    protected onlyTag: string[] = [DisplayActionTag.mineexplosive];
    protected onlyActions: Map<string, string[]> = new Map();
    constructor(render: Render) {
        this.render = render;
    }
    public executeElementActions(tag: string, data: any) {
        if (!data || !data.id) return;
        if (this.checkOnlyAction(tag, data.id)) return;
        const display = this.render.displayManager.getDisplay(data.id);
        const action = this.createElementAction(tag, display, data);
        if (action) action.executeAction();
    }

    public destroy() {
        this.render = undefined;
    }

    protected createElementAction(actionName: string, display: any, data: any) {
        let eleaction: DisplayBaseAction;
        switch (actionName) {
            case DisplayActionTag.mineexplosive:
                eleaction = new PlayerExplosiveAction(this.render, display, data, new Handler(this, () => {
                    this.removeOnlyAction(actionName, data.id);
                }));
                this.addOnlyAction(actionName, data.id);
                break;
            case DisplayActionTag.itemIntoPanel:
                eleaction = new ItemIntoPanel(this.render, display, data);
                break;
        }
        return eleaction;
    }

    protected checkOnlyAction(actionName: string, id: string) {
        if (this.onlyTag.indexOf(actionName) !== -1) {
            if (this.onlyActions.has(actionName)) {
                const values = this.onlyActions.get(actionName);
                if (values.indexOf(id) !== -1) return true;
            }
        }
        return false;
    }

    protected removeOnlyAction(actionName: string, id: string) {
        if (this.onlyActions.has(actionName)) {
            const values = this.onlyActions.get(actionName);
            const index = values.indexOf(id);
            if (index !== -1) {
                values.splice(index, 1);
            }
        }
    }

    protected addOnlyAction(actionName: string, id: string) {
        if (this.onlyActions.has(actionName)) {
            const values = this.onlyActions.get(actionName);
            values.push(id);
        } else {
            this.onlyActions.set(actionName, [id]);
        }
    }
}

export enum DisplayActionTag {
    mineexplosive = "mineexplosive",
    itemIntoPanel = "itemIntoPanel"
}
