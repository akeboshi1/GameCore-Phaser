import { BasicMediator, Game } from "gamecore";
import { PicaRename } from "./PicaRename";
export declare class PicaRenameMediator extends BasicMediator {
    protected mModel: PicaRename;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    protected panelInit(): void;
    private randomNameCallBack;
    private onRandomNameHandler;
    private onSubmitHandler;
    private onHidePanel;
}
