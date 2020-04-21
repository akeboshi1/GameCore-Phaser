import { IGroup } from "./IGroup";
import { Handler } from "../../Handler/Handler";
import { HandlerDispatcher } from "../../Handler/HandlerDispatcher";

export interface IFollow {
    follow: Function;
    endFollow: Function;

}
export class FollowGroup implements IGroup {
    public owner: any;
    public childs: IFollow[];
    public data: any;
    public eventDisp: HandlerDispatcher;
    public eventType: string = "eventType";
    constructor() {
        this.eventDisp = new HandlerDispatcher();
        this.childs = [];
    }

    public addChild(child: any) {
        this.childs.push(child);
    }

    public removeChild(child: any) {
        const index = this.childs.indexOf(child);
        if (index !== -1) {
            this.childs.splice(index, 1);
        }
    }

    public replaceOwner(owner: any) {
        this.owner = owner;
        this.eventDisp.emitter("");
    }

    public emitter(type: string, data?: any) {
        this.eventDisp.emitter(type, data);
    }
    public on(type: string, caller: any, method: Function, args?: any[]) {
        this.eventDisp.on(type, caller, method, args);
    }

    public off(type: string, caller: any, method: Function) {
        this.eventDisp.off(type, caller, method);
    }

    public destroy() {
        this.eventDisp.destroy();
        this.childs.length = 0;
        this.owner = null;
        this.data = null;
    }
}
