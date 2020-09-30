import { IGroup } from "./IGroup";
import { HandlerDispatcher } from "../../core/Handler/HandlerDispatcher";
import { GroupEventType, GroupType } from "./GroupManager";
export class FollowGroup implements IGroup {

    public owner: any;
    public childs: any[];
    public data: any;
    public eventDisp: HandlerDispatcher;
    public groupType = GroupType.Follow;
    constructor() {
        this.eventDisp = new HandlerDispatcher();
        this.childs = [];
    }

    public addChild(child: any) {
        this.removeChild(child);
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
        this.eventDisp.emitter(GroupEventType.REPLACE_TYPE, owner);
    }

    public emitter(type?: string, data?: any) {
        if (!type) type = GroupEventType.DEFAULT_TYPE;
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
