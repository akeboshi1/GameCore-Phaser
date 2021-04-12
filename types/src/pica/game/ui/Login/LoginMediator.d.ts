import { BasicMediator, Game } from "gamecore";
export declare class LoginMediator extends BasicMediator {
    private verifiedEnable;
    constructor(game: Game);
    show(param?: any): void;
    login(phone: any, code: any, areaCode: any): void;
    onFetchCodeHandler(phone: string, areaCode: string): void;
    enterWorld(adult: boolean): void;
    onLoginHandler(phone: string, code: string, areaCode: string): void;
    onShowVerified(): void;
    onShowErrorHandler(error: any, okText?: string): void;
    onLoginErrorHanler(error: string, okText?: string): void;
    onVerifiedHandler(name: string, idcard: string): void;
}
