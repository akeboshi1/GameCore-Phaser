import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BaseHandler } from "./base.handler";
export declare class ElementDataManager extends BaseHandler {
    private mEleMap;
    private mContextMap;
    constructor(game: Game, event?: EventDispatcher);
    clear(): void;
    destroy(): void;
    onAction(id: number, event: string, fn: Function, context: any): void;
    offAction(id: number, event: string, fn: Function, context: any): void;
    actionEmitter(id: number, event: string, data?: any): void;
    hasAction(id: any, event?: string): boolean;
    private addMapByID;
    private removeMapByID;
    private addMapByContext;
    private removeMapByContext;
    private getContextByID;
}
