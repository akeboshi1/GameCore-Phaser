import { BasicMediator, Game } from "gamecore";
export declare class BottomMediator extends BasicMediator {
    private mCacheManager;
    constructor(game: Game);
    show(): void;
    hide(): void;
    isSceneUI(): boolean;
    sendChat(val: string): void;
    protected panelInit(): void;
    private applyChatCommand;
    private appendChat;
    private onShowPanelHandler;
    private onGoHomeHandler;
    private onTestCommandHandler;
    private exitUser;
    private get model();
    private get cacheManager();
}
