import { BasicMediator, Game } from "gamecore";
export declare class PicaOpenPartyMediator extends BasicMediator {
    private picOpen;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    destroy(): void;
    protected panelInit(): void;
    private onCloseHandler;
    private on_PARTY_REQUIREMENTS;
    private query_PARTY_REQUIREMENTS;
    private query_CREATE_PARTY;
}
