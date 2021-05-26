import { DragonbonesDisplay, FramesDisplay } from "gamecoreRender";
import { Render } from "src/render/render";
import { Handler } from "utils";
export class DisplayBaseAction {

    public data: any;
    public render: Render;
    public actionTag: string;
    public display: FramesDisplay | DragonbonesDisplay;
    public compl: Handler;
    constructor(render: Render, display: any, data: any, compl?: Handler) {
        this.data = data;
        this.render = render;
        this.display = display;
        this.compl = compl;
    }
    public executeAction() {

    }

    destroy() {
        this.render = undefined;
        this.data = undefined;
    }
}
