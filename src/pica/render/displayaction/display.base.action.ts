import { DragonbonesDisplay, FramesDisplay } from "gamecoreRender";
import { Render } from "src/render/render";
export class DisplayBaseAction {

    public data: any;
    public render: Render;
    public actionTag: string;
    public display: FramesDisplay | DragonbonesDisplay;
    constructor(render: Render, display: any, data: any) {
        this.data = data;
        this.render = render;
        this.display = display;
    }
    public executeAction() {

    }

    destroy() {
        this.render = undefined;
        this.data = undefined;
    }
}
