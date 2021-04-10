import { BasicMediator, Game } from "gamecore";
import { PicaEquipUpgrade } from "./PicaEquipUpgrade";
export declare class PicaEquipUpgradeMediator extends BasicMediator {
    protected mModel: PicaEquipUpgrade;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    protected panelInit(): void;
    private onHidePanel;
    private onEquipUpgradePacket;
    private onActiveEquipment;
    private onReqEquipedEquipment;
    private onReqActiveEquipment;
    private onShowEquipPanel;
}
