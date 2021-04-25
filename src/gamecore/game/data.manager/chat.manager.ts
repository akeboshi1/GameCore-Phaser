import { EventDispatcher } from "structure";
import { Game } from "../game";
import { op_client, op_def } from "pixelpai_proto";
import { BasePacketHandler } from "./base.packet.handler";
import { PBpacket } from "net-socket-packet";

export class ChatManager extends BasePacketHandler {
    private chatMsg: string[] = [];
    private readonly MAX_CHAT = 100;
    constructor(game: Game, event: EventDispatcher) {
        super(game, event);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.onChatHandler);
        this.addPackListener();
    }

    clear() {
        this.chatMsg = [];
        super.clear();
    }

    getMsgs() {
        return this.chatMsg;
    }

    private onChatHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        const player = this.getSpeaker(content.chatSenderid);
        let speaker = "";
        if (player) {
            speaker = `${player.model.nickname}`;
        } else {
            if (content.chatSenderid) {
                // speaker = i18n.t("chat.mystery");
            }
        }
        let color = "#ffffff";
        if (content.chatSetting) {
            color = content.chatSetting.textColor;
        }
        this.getChannel(content.chatChannel).then((str) => {
            const msg = `[color=${color}][${str}]${speaker}: ${content.chatContext}[/color]\n`;
            this.appendMsg(msg);
        });
    }

    private async getChannel(channel: op_def.ChatChannel): Promise<string> {
        return new Promise<string>(async (resolve, rejcet) => {
            let str = "";
            if (channel === op_def.ChatChannel.CurrentScene) {
                str = await this.game.peer.render.getMessage("chat.current");
            } else if (channel === op_def.ChatChannel.World) {
                str = await this.game.peer.render.getMessage("chat.world");
            } else {
                str = await this.game.peer.render.getMessage("chat.system");
            }
            resolve(str);
        });
    }

    private getSpeaker(id: number) {
        if (id) {
            if (!this.game || !this.game.roomManager || !this.game.roomManager.currentRoom) {
                return;
            }
            return this.game.roomManager.currentRoom.getElement(id);
        }
    }

    private appendMsg(val: string) {
        if (this.chatMsg.length > this.MAX_CHAT) {
            this.chatMsg.shift();
        }
        this.chatMsg.push(val);
        this.mEvent.emit("chat", val);
    }
}
