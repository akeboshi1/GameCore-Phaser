import { BasicMediator, Game } from "gamecore";
export declare class PicaFurniFunMediator extends BasicMediator {
    private picFurni;
    private isTeamBuild;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    get playerData(): import("../../../../game").PlayerBag;
    panelInit(): void;
    private querySNMaterial;
    private onCloseHandler;
    private queryUnlockElement;
    private onSyncSNMaterials;
    private updateMaterials;
    private onTeamBuild;
    private query_TEAM_BUILD;
}
