import { Game } from "gamecore";
import { ISprite } from "structure";
export declare class ElementActionManager {
    protected mActionTags: any[];
    protected mNeedBroadcastTags: any[];
    protected game: Game;
    constructor(game: any);
    executeElementActions(data: ISprite, userid?: number): void;
    executeFeatureActions(actionName: string, data?: any): void;
    checkAllAction(data: ISprite): any[];
    checkActionNeedBroadcast(data: ISprite): boolean;
    checkAction(data: ISprite, actionName?: string): boolean;
    checkAttrsAction(data: ISprite, actionName?: string): boolean;
    getActionData(data: ISprite, actionName: string): any;
    destroy(): void;
    protected createElementAction(data: any, actionName: string, userid?: number): any;
}
