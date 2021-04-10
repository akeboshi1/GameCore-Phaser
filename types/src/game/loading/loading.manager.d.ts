import { IAsset } from "baseModel";
import { Game } from "../game";
export declare class LoadingManager {
    private readonly mGame;
    private mResources;
    private mLoading;
    constructor(game: Game);
    start(state?: number, data?: any): void;
    sceneCallback(): void;
    addAssets(assets: IAsset[]): void;
    startup(): void;
    destroy(): void;
    private loadAsset;
    get game(): Game;
    private getLoadType;
}
