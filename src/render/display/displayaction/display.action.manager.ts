import { Render } from "gamecoreRender";
import { DisplayBaseAction } from "./display.base.action";

export class DisplayActionManager {
    protected render: Render;
    constructor(render: Render) {
        this.render = render;
    }
    public executeElementActions(tag: string, data?: any) {
        const action = this.createElementAction(tag, data);
        action.executeAction();
    }

    public executeFeatureActions(actionName: string, data?: any) {
        const action = this.createElementAction(data, actionName);
        if (action) action.executeAction();
    }


    public destroy() {
        this.render = undefined;
    }

    protected createElementAction(data: any, actionName: string, userid?: number) {
        const eleaction: DisplayBaseAction = undefined;
        // switch (actionName) {
        //     case "TQ_PKT_Action":
        //         eleaction = new PKTElementAction(this.game, data, userid);
        //         break;
        //     case "TQ_PKT_tag":
        //         eleaction = new TAGElementAction(this.game, data, userid);
        //         break;
        //     case "frozenType":
        //         eleaction = new FuritElementAction(this.game, data, userid);
        //         break;
        //     case "FuritChange":
        //         eleaction = new FuritElementChangeAction(this.game, data, userid);
        //         break;
        //     case "FurniSurvey":
        //         eleaction = new PicaFurniSurveyAction(this.game, data, userid);
        //         break;
        // }
        return eleaction;
    }
}
