import { UiManager } from "gamecoreRender";
import { ICountablePackageItem } from "../../../structure";
import { PicaBasePanel } from "../pica.base.panel";
export declare class PicaSurveyPanel extends PicaBasePanel {
    private topbg;
    private title;
    private targetPos;
    private furniItem;
    private moveTween;
    constructor(uiManager: UiManager);
    resize(width?: number, height?: number): void;
    init(): void;
    setSurveyData(data: ICountablePackageItem): void;
    private playMove;
}
