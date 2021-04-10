import { BasicMediator, Game } from "gamecore";
export declare class PicaChatMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    destroy(): void;
    private onViewInitComplete;
    private onShowNavigateHandler;
    private onChatHandler;
    private appendChat;
    private onSendChatHandler;
    private applyChatCommand;
    private getChannel;
    private getSpeaker;
    private onQueryResuleHandler;
    private queryMarket;
    private onBuyItemHandler;
    private onGiftStateHandler;
    private get model();
}
