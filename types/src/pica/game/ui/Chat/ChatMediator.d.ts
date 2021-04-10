import { BasicMediator, Game } from "gamecore";
export declare class ChatMediator extends BasicMediator {
    constructor(game: Game);
    show(): void;
    hide(): void;
    isSceneUI(): boolean;
    sendChat(val: string): any;
    private onChatHandler;
    private appendChat;
    private getSpeaker;
    private getChannel;
    private get model();
}
