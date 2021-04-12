import { BasicMediator, Game } from "gamecore";
export declare class PicaManorListMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    private onHidePanel;
    private query_COMMERCIAL_STREET;
    private queryEnterRoom;
    private onCOMMERCIAL_STREET;
    private get model();
}
