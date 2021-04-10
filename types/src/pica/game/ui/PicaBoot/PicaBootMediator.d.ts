import { BasicMediator, Game } from "gamecore";
export declare class PicaBootMediator extends BasicMediator {
    constructor(game: Game);
    showLogin(): void;
    enterGame(): void;
    show(param?: any): void;
    hide(): void;
    setState(val: string): void;
    referToken(): Promise<void>;
    enterWorld(adult: boolean): void;
    onLoginHandler(phone: string, code: string, areaCode: string): void;
    showNotice(): void;
    protected _show(): void;
    private loginSuc;
}
