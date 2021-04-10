import { BasePanel, UiManager } from "gamecoreRender";
export declare class LoginPanel extends BasePanel {
    private readonly areaCode;
    private mPhoneInput;
    private mPhoneCodeInput;
    private fetchTime;
    private acceptBtn;
    private loginBtn;
    private downcount;
    private fetchCode;
    private mMediator;
    constructor(uimanager: UiManager);
    show(): void;
    hide(): void;
    setInputVisible(val: boolean): void;
    destroy(): void;
    setLoginEnable(val: any): void;
    protected preload(): void;
    protected init(): void;
    private createInput;
    private onFetchCodeDownHandler;
    private onFetchCodeHandler;
    private tryLogin;
    private LoginDownHandler;
    private onCheckboxHandler;
    private onEnterPhoneHandler;
    private onEnterCodeHandler;
}
