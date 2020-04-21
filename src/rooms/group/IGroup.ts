import { IDispose } from "../action/IDispose";
import { HandlerDispatcher } from "../../Handler/HandlerDispatcher";
import { GroupType } from "./GroupManager";

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
