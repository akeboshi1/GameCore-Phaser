import { BasicMediator, Game } from "gamecore";
export declare class PicRoomUpgradeMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    private onQueryTargetUI;
}
