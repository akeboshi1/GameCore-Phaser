import { UIManager, Game } from "gamecore";
export declare class PicaWorkerUiManager extends UIManager {
    constructor(game: Game);
    showMainUI(hideNames?: string[]): void;
    setMedName(name: string, medClass: any): void;
    showMed(type: string, param: any): void;
    protected getPanelNameByAlias(tag: string): string;
    protected checkActiveUIState(panelName: string): any;
}
