import { BasicMediator, Game } from "gamecore";
export declare class DialogMediator extends BasicMediator {
    protected game: Game;
    constructor(game: Game);
    onQueryNextDialog(data: any): void;
    show(param?: any): void;
    hide(): void;
    update(param?: any): void;
    private onHideHandler;
    private get model();
}
