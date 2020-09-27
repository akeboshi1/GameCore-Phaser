import { WorldService } from "../../game/world.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { Logger } from "../../game/core/utils/log";
import { IMessage } from "./message";
import { ChatPanelPC } from "./chatPanel.pc";
import { BaseChatPanel } from "./base.chat.panel";
import { ChatPanelMobile } from "./mobile/chatPanel.mobile";
import { Chat } from "./Chat";
import { BaseMediator, UIType } from "apowophaserui";
export class ChatMediator extends BaseMediator {
    public static NAME: string = "ChatMediator";
    public world: WorldService;
    private mGMEApi: WebGMEAPI;
    private mInRoom: boolean = false;
    private mQCLoudAuth: string;
    private mAllMessage: IMessage[] = [];
    private mMaxMessageNum = 50;
    private mScene: Phaser.Scene;
    private chat: Chat;
    constructor(world: WorldService, scene: Phaser.Scene) {
        super();
        this.world = world;
        this.mScene = scene;
        this.chat = new Chat(world);
        this.mUIType = this.world.game.device.os.desktop ? UIType.Scene : UIType.Normal;
    }

    public getUIType(): number {
        return this.mUIType;
    }

    public enterRoom() {
        if (!this.room) return;
        if (!this.room.playerManager.actor) return;
        if (!this.mGMEApi) return;
        const playerID = this.room.playerManager.actor.id;
        const roomID = this.room.id;
        this.mGMEApi.EnterRoom(roomID.toString(), 1, this.mQCLoudAuth);
        this.mInRoom = true;
        this.sendVoiceRoomStatus(op_def.ChatChannel.CurrentScene, roomID, op_def.VoiceRoomStatus.InVoiceRoom);
    }

    public exitRoom() {
        if (!this.mGMEApi) return;
        this.mGMEApi.EnableMic(false);
        this.mGMEApi.ExitRoom();

        this.mInRoom = false;
        if (!this.room) {
            return;
        }
        this.sendVoiceRoomStatus(op_def.ChatChannel.CurrentScene, this.room.id, op_def.VoiceRoomStatus.OutsideVoiceRoom);
    }

    public isSceneUI(): boolean {
        return true;
    }

    public tweenView(show: boolean) {
        if (!this.mView) return;
        this.mView.tweenExpand(show);
    }

    public isShow(): boolean {
        if (!this.mView) {
            return false;
        }
        return this.mView.isShow();
    }

    public showing(): boolean {
        return true;
    }

    public resize() {
        const size = this.world.getSize();
        if (this.mView) {
            this.mView.resize(size.width, size.height);
        }
    }

    public show(param?: any) {
        if (this.mView && this.mView.isShow()) {
            return;
        }
        if (this.world.game.device.os.desktop) {
            this.mView = new ChatPanelPC(this.mScene, this.world);
        } else {
            this.mView = new ChatPanelMobile(this.mScene, this.world);
            this.world.uiManager.checkUIState(ChatMediator.NAME, false);
        }
        this.world.uiManager.getUILayerManager().addToUILayer(this.mView);
        this.addListen();
        this.mView.show();
        this.mView.scale = this.world.uiScale;
    }

    public update(param?: any) {
        this.mView.update(param);
        this.mParam = param;
    }

    public hide() {
        this.removeListen();
        this.mView.hide();
        if (!this.world.game.device.os.desktop) this.world.uiManager.checkUIState(ChatMediator.NAME, true);
    }

    public setParam(param: any) {
        this.mParam = param;
    }

    public getParam(): any {
        return this.mParam;
    }

    public destroy() {
        this.removeListen();
        if (this.chat) {
            this.chat.unregister();
            this.chat = null;
        }
        if (this.mGMEApi) {
            this.mGMEApi = null;
        }
        this.mScene = null;
        this.world = null;
        this.mInRoom = false;
        this.mQCLoudAuth = null;
        this.mAllMessage.forEach((message) => {
            if (message) message = null;
        });
        this.mAllMessage = null;
        super.destroy();
    }

    private addListen() {
        this.chat.on("characterChat", this.handleCharacterChat, this);
        this.chat.on("QCLoundGME", this.handleQCLoudGME, this);
        this.mView.on("sendChat", this.onSendChatHandler, this);
        this.mView.on("selectedVoice", this.onSelectedVoiceHandler, this);
        this.mView.on("selectedMic", this.onSelectedMicHandler, this);
        this.chat.register();
    }

    private removeListen() {
        this.chat.off("characterChat", this.handleCharacterChat, this);
        this.chat.off("QCLoundGME", this.handleQCLoudGME, this);
        this.mView.off("sendChat", this.onSendChatHandler, this);
        this.mView.off("selectedVoice", this.onSelectedVoiceHandler, this);
        this.mView.off("selectedMic", this.onSelectedMicHandler, this);
        this.chat.unregister();
    }

    private initGME() {
        // TODO just for test, need get sdkAppId from settings
        const sdkAppId = "1400209172";
        if (!this.room.playerManager.actor) return;
        const playerID = this.room.playerManager.actor.id;
        this.mGMEApi = new WebGMEAPI();
        this.mGMEApi.Init(document, sdkAppId, playerID.toString());
        this.mGMEApi.SetTMGDelegate((event, result) => {
            switch (event) {
                case this.mGMEApi.event.ITMG_MAIN_EVENT_TYPE_ENTER_ROOM:
                    Logger.getInstance().log(`[GME]: EnterRoom: ${result}`);
                    break;
                case this.mGMEApi.event.ITMG_MAIN_EVNET_TYPE_USER_UPDATE:
                    break;
                case this.mGMEApi.event.ITMG_MAIN_EVENT_TYPE_EXIT_ROOM:
                    Logger.getInstance().log(`[GME]: ExitRoom`);
                    break;
                case this.mGMEApi.event.ITMG_MAIN_EVENT_TYPE_ROOM_DISCONNECT:
                    Logger.getInstance().log(`[GME]: Room Disconnect!!!`);
                    break;
                default:
                    Logger.getInstance().log("[GME]: Sth wrong...");
                    break;
            }
        });
    }

    private appendMessage(messages: IMessage[], message: IMessage) {
        messages.push(message);
        if (messages.length > this.mMaxMessageNum) {
            messages.shift();
        }
    }

    private changeMessageChannel() {
        if (!this.mView) return;
        const showMessages = this.mAllMessage.filter((msg: IMessage) => msg.channel === (this.mView as BaseChatPanel).outChannel || msg.channel === op_def.ChatChannel.System || (this.mView as BaseChatPanel).outChannel === null);
        const len = showMessages.length;
        let message: IMessage = null;
        let wrapStr = "\n";
        for (let i = 0; i < len; i++) {
            message = showMessages[i];
            if (i === len - 1) wrapStr = "";
            (this.mView as BaseChatPanel).appendChat(message.chat + wrapStr);
        }
    }

    private handleCharacterChat(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        if (!this.world || !this.world.emitter || !this.room || !this.mView) {
            return;
        }

        const playerManager = this.world.roomManager.currentRoom.playerManager;
        if (!playerManager) {
            return;
        }
        const player = playerManager.get(content.chatSenderid);
        // const chatSendName = player ? player.name : "";
        // this.mChatPanel.appendChat(content.chatContext);
        const nickname = player ? `${player.model.nickname}:` : "";
        const color = content.chatSetting && content.chatSetting.textColor ? content.chatSetting.textColor : "#FFFFFF";
        this.appendMessage(this.mAllMessage, { chat: `[color=${color}]${nickname}:${content.chatContext}[/color]`, channel: content.chatChannel });
        (this.mView as BaseChatPanel).appendChat(`[b][color=${color}]${nickname}${content.chatContext}[/color][/b]\n`);
    }

    private onSendChatHandler(text: string) {
        if (this.world.connection) {
            const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
            const content: op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
            content.chatChannel = 0;
            content.chatContext = text;
            this.world.connection.send(pkt);
        }
    }

    private sendVoiceRoomStatus(voiceChannel: op_def.ChatChannel, voiceRoomId: number, voiceRoomStatus: op_def.VoiceRoomStatus) {
        if (!this.room.connection) {
            return;
        }
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_VOICE_ROOM_STATUS);
        const context: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_VOICE_ROOM_STATUS = pkt.content;
        context.voiceChannel = voiceChannel;
        context.voiceRoomId = voiceRoomId;
        context.voiceRoomStatus = voiceRoomStatus;
        this.room.connection.send(pkt);
    }

    private handleQCLoudGME(packet: PBpacket) {
        const authBuffer: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_QCLOUD_GME_AUTHBUFFER = packet.content;
        this.mQCLoudAuth = authBuffer.signature;
        this.initGME();
    }

    private onSelectedVoiceHandler(val: boolean) {
        if (val) {
            this.enterRoom();
        } else {
            this.exitRoom();
        }
    }

    private onSelectedMicHandler(val: boolean) {
        if (!this.mGMEApi) {
            return;
        }
        if (this.mInRoom) {
            this.mGMEApi.EnableMic(val);
        }
        if (this.world.connection) {
            const pkt: PBpacket = new PBpacket((op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_VOICE_ROOM_STATUS));
            this.world.connection.send(pkt);
        }
    }

    get room() {
        if (!this.world) {
            return;
        }
        if (!this.world.roomManager) {
            return;
        }
        return this.world.roomManager.currentRoom;
    }
}
