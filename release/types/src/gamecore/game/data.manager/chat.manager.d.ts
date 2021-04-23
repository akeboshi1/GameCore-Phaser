import { EventDispatcher } from "structure";
import { Game } from "../game";
import { BasePacketHandler } from "./base.packet.handler";
export declare class ChatManager extends BasePacketHandler {
    private chatMsg;
    private readonly MAX_CHAT;
    constructor(game: Game, event: EventDispatcher);
    clear(): void;
    getMsgs(): string[];
    private onChatHandler;
    private getChannel;
    private getSpeaker;
    private appendMsg;
}
