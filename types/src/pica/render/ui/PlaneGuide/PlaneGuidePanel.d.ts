import { BasePlaySceneGuide, UiManager } from "gamecoreRender";
import { IPos } from "utils";
export declare class PlaneGuidePanel extends BasePlaySceneGuide {
    constructor(uiManager: UiManager);
    protected step1(pos: IPos): void;
    protected getGuidePosition(): {
        x: number;
        y: number;
    };
}
