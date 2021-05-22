import { Render } from "src/render/render";

export class DisplayBaseAction {

    public data: any;
    public render: Render;
    public actionTag: string;
    constructor(render: Render, tag: string, data?: any) {
        this.data = data;
        this.render = render;
        this.actionTag = tag;
    }
    public executeAction() {

    }

    destroy() {
        this.render = undefined;
        this.data = undefined;
    }
    getActionData(actionName?: string) {
        const data = this.data;
        const tag = actionName || this.actionTag;
        if (data && data.attrs) {
            const attrs = data.attrs;
            for (const att of attrs) {
                if (att.key === tag) {
                    return att.value;
                }
            }
        }
        return undefined;
    }
}
