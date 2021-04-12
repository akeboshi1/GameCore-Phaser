import { BasicMediator, Game } from "gamecore";
import { PicaOnline } from "./PicaOnline";
export declare class PicaOnlineMediator extends BasicMediator {
    protected mModel: PicaOnline;
    protected blacklist: any[];
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    panelInit(): void;
    destroy(): void;
    private onCloseHandler;
    private onOnlineHandler;
    private on_Another_Info;
    private onOpeningCharacterHandler;
    private onBlockUserHandler;
}
