import { IDispose } from "../../game/room/actionManager/idispose";
import { HandlerDispatcher } from "../../utils/handler.dispatcher";
import { GroupType } from "./group.manager";

export interface IGroup extends IDispose {
    owner: any;
    childs: any[];
    eventDisp: HandlerDispatcher;
    data: any;
    groupType: GroupType;
    on(type: string, caller: any, method: Function, args: any[]);
    off(type: string, caller: any, method: Function, args: any[]);
    emitter(type: string, data?: any);
    addChild(child: any);
    removeChild(child: any);
    replaceOwner(owner: any);
}
