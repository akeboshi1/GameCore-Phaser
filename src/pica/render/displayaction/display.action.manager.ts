import { Render } from "gamecoreRender";
import { DisplayBaseAction } from "./display.base.action";
import { PlayerExplosiveAction } from "./player.explosive.action";

export class DisplayActionManager {
    protected render: Render;
    constructor(render: Render) {
        this.render = render;
    }
    public executeElementActions(tag: string, data: any) {
        if (!data || !data.id) return;
        const display = this.render.displayManager.getDisplay(data.id);
        const action = this.createElementAction(tag, display, data);
        action.executeAction();
    }

    public destroy() {
        this.render = undefined;
    }

    protected createElementAction(actionName: string, display: any, data: any) {
        let eleaction: DisplayBaseAction;
        switch (actionName) {
            case "mineexplosive":
                eleaction = new PlayerExplosiveAction(this.render, display, data);
                break;
        }
        return eleaction;
    }
}
