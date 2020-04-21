import { IDispose } from "../action/IDispose";
import { HandlerDispatcher } from "../../Handler/HandlerDispatcher";

export interface IGroup extends IDispose {
    owner: any;
    childs: any[];
    eventDisp: HandlerDispatcher;
    data: any;
    eventType?: string;
    on(type: string, caller: any, method: Function, args: any[]);
    off(type: string, caller: any, method: Function, args: any[]);
    emitter(type: string, data?: any);
    addChild(child: any);
    removeChild(child: any);
    replaceOwner(owner: any);
}
