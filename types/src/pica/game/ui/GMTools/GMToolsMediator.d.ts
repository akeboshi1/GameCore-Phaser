import { BasicMediator, Game } from "gamecore";
export declare class GMToolsMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    update(param?: any): void;
    private onCloseHandler;
    private onTargetUIHandler;
}
