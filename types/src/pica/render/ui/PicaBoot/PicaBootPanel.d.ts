import { UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
export declare class PicaBootPanel extends PicaBasePanel {
    private playBtn;
    private navigate;
    private notice;
    private mMediator;
    /**
     * init
     * login
     * referToken
     * ready
     */
    private mState;
    constructor(uimanager: UiManager);
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    init(): void;
    updatePanelList(): void;
    popPanel(): void;
    hidePanel(): void;
    setBootState(val: string): void;
    showNotice(): void;
    tryLogin(phone: string, code: string, phoneArea: string): void;
    protected preload(): void;
    private onPlayHandler;
    private logged;
    private showLogin;
    private onShowLoginHandler;
    private onShowNoticeHandler;
    private hasPanel;
    private closeNotice;
}
