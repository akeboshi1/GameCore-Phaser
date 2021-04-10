import { BasicMediator, Game } from "gamecore";
export declare class PicaLoginMediator extends BasicMediator {
    constructor(game: Game);
    enterGame(): void;
    phoneLogin(phone: string, code: string, areaCode: string): void;
    fetchCode(phone: string, areaCode: string): void;
    private loginSuc;
}
