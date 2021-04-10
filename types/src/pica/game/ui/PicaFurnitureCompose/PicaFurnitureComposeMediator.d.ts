import { PicaFurnitureCompose } from "./PicaFurnitureCompose";
import { BasicMediator, Game } from "gamecore";
export declare class PicaFurnitureComposeMediator extends BasicMediator {
    protected mModel: PicaFurnitureCompose;
    private mScneType;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    get bag(): import("../../../../game").PlayerBag;
    get userData(): import("../../../../game").UserDataManager;
    protected _show(): void;
    protected panelInit(): void;
    protected mediatorExport(): void;
    private onCloseHandler;
    private addLisenter;
    private removeLisenter;
    private onSyncFinishHandler;
    private onUpdateHandler;
    private onUpdatePlayerInfoHandler;
    private onRetComposeHandler;
    private queryFuriCompose;
    private queryFuriPackageByStar;
}
