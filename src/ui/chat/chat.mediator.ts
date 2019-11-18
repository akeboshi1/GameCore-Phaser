import { WorldService } from "../../game/world.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { Logger } from "../../utils/log";
import { IMediator } from "../baseMediator";
import { IMessage } from "./message";
import { World } from "../../game/world";
import { ChatPanelPC } from "./pc/chatPanel.pc";
import { Panel } from "../components/panel";
import { BaseChatPanel } from "./base.chat.panel";
import { ChatPanelMobile } from "./mobile/chatPanel.mobile";
export class ChatMediator extends PacketHandler implements IMediator {
    public static NAME: string = "ChatMediator";
    public world: WorldService;
    private mChatPanel: BaseChatPanel;
    private mGMEApi: WebGMEAPI;
    private mInRoom: boolean = false;
    private mQCLoudAuth: string;
    private mAllMessage: IMessage[] = [];
    private mMaxMessageNum = 50;
    private mScene: Phaser.Scene;
    constructor(world: WorldService, scene: Phaser.Scene) {
        super();
        this.world = world;
        this.mScene = scene;
        if (this.world.connection) {
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_QCLOUD_GME_AUTHBUFFER, this.handleQCLoudGME);
        }
        this.world.emitter.on(World.SCALE_CHANGE, this.scaleChange, this);
    }

    public setUiScale(value: number) {
        this.mChatPanel.scaleX = this.mChatPanel.scaleY = value;
    }

    public enterRoom() {
        if (!this.room) return;
        if (!this.room.actor) return;
        if (!this.mGMEApi) return;
        const playerID = this.room.actor.id;
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

    public getView(): Panel {
        return this.mChatPanel;
    }

    public isShow(): boolean {
        if (!this.mChatPanel) {
            return false;
        }
        return this.mChatPanel.isShow();
    }

    public resize() {
        if (this.mChatPanel) {
            this.mChatPanel.setLocation();
        }
    }

    public show(param?: any) {
        if (this.mChatPanel && this.mChatPanel.isShow()) {
            return;
        }
        this.world.connection.addPacketListener(this);
        if (this.world.game.device.os.desktop) {
            this.mChatPanel = new ChatPanelPC(this.mScene, this.world);
        } else {
            this.mChatPanel = new ChatPanelMobile(this.mScene, this.world);
        }
        this.world.uiManager.getUILayerManager().addToUILayer(this.mChatPanel);
        this.mChatPanel.on("sendChat", this.onSendChatHandler, this);
        this.mChatPanel.on("selectedVoice", this.onSelectedVoiceHandler, this);
        this.mChatPanel.on("selectedMic", this.onSelectedMicHandler, this);
        this.mChatPanel.show();
        this.setUiScale(this.world.uiScale);
    }

    public update(param?: any) {
        this.mChatPanel.update(param);
    }

    public hide() {
        this.world.connection.removePacketListener(this);
        this.mChatPanel.off("sendChat", this.onSendChatHandler, this);
        this.mChatPanel.off("selectedVoice", this.onSelectedVoiceHandler, this);
        this.mChatPanel.off("selectedMic", this.onSelectedMicHandler, this);
        this.mChatPanel.hide();
    }

    public destroy() {
        if (this.mChatPanel) {
            this.mChatPanel.destroy();
            this.mChatPanel = null;
        }
        if (this.mGMEApi) {
            this.mGMEApi = null;
        }
        this.world.emitter.off(World.SCALE_CHANGE, this.scaleChange, this);
        this.mScene = null;
        this.world = null;
        this.mInRoom = false;
        this.mQCLoudAuth = null;
        this.mAllMessage.forEach((message) => {
            if (message) message = null;
        });
        this.mAllMessage = null;
    }

    private scaleChange() {
        this.setUiScale(this.world.uiScale);
    }

    private initGME() {
        // TODO just for test, need get sdkAppId from settings
        const sdkAppId = "1400209172";
        if (!this.room.actor) return;
        const playerID = this.room.actor.id;
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
        if (!this.mChatPanel) return;
        const showMessages = this.mAllMessage.filter((msg: IMessage) => msg.channel === this.mChatPanel.outChannel || msg.channel === op_def.ChatChannel.System || this.mChatPanel.outChannel === null);
        const len = showMessages.length;
        let message: IMessage = null;
        let wrapStr = "\n";
        for (let i = 0; i < len; i++) {
            message = showMessages[i];
            if (i === len - 1) wrapStr = "";
            this.mChatPanel.appendChat(message.chat + wrapStr);
        }
    }

    private handleCharacterChat(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_CHAT = packet.content;
        if (!this.world || !this.world.emitter || !this.room || !this.mChatPanel) {
            return;
        }

        const playerManager = this.world.roomManager.currentRoom.playerManager;
        const player = playerManager.get(content.chatSenderid);
        // const chatSendName = player ? player.name : "";
        // this.mChatPanel.appendChat(content.chatContext);
        const nickname = player ? `${player.model.nickname}:` : "";
        const color = content.chatSetting.textColor ? content.chatSetting.textColor : "#FFFFFF";
        this.appendMessage(this.mAllMessage, { chat: `[color=${color}]${nickname}:${content.chatContext}[/color]`, channel: content.chatChannel });
        this.mChatPanel.appendChat(`[b][color=${color}]${nickname}${content.chatContext}[/color][/b]\n`);
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
