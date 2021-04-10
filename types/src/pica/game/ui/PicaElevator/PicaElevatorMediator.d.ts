import { BasicMediator, Game } from "gamecore";
export declare class PicaElevatorMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    private onTargetUIHandler;
    private get model();
}
