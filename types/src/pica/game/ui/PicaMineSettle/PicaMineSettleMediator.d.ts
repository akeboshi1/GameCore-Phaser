import { BasicMediator, Game } from "gamecore";
export declare class PicaMineSettleMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    panelInit(): void;
    hide(): void;
    destroy(): void;
    private onHideMineSettle;
    private onMineSettlePacket;
    private setMIneSettlePanel;
    private get model();
}
