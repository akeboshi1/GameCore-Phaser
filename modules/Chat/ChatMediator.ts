import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ChatView} from "./view/ChatView";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "pixelpai_proto";
import {MessageType} from "../../common/const/MessageType";
import IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT;
import OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER;
import {ModuleTypeEnum} from "../../base/module/base/ModuleType";
const GMEApi = new WebGMEAPI();
const setTimeout = window.setTimeout;

export class ChatMediator extends MediatorBase {
    private authBuffer: string;
    private _inRoom = false;
    private _timeout: number;
    private _chatCD = 2000;
    private _historyIndex: number;
    private _historyChat: string[] = [];
    private _allMessage: IMessage[] = [];
    private _maxMessageNum  = 50;
    private get view(): ChatView {
        return this.viewComponent as ChatView;
    }

    public onRegister(): void {
        Globals.MessageCenter.on(MessageType.CHAT_TO, this.onHandleChat, this);
        /// never start
        Globals.MessageCenter.on(MessageType.QCLOUD_AUTH, this.onHandleQcloudAuth, this);
        Globals.MessageCenter.on(MessageType.SCENE_CHANGE_TO, this.onHandleChangeChatRoom, this);
        Globals.MessageCenter.on(MessageType.ENTER_SCENE, this.onHandleChangeChatRoom, this);
        /// never end
        this.view.bt.on("up", this.onHandleBt, this);

        (<any>this.view.input_tf).domElement.element.addEventListener("keydown", this.sayHello.bind(this));
        this.view.labaButton.onCallBack(this.handleLaba, this);
        this.view.voiceButton.onCallBack(this.handleVoice, this);
        this.view.comobox.onSelectedItem.add(this.changeMessageChannel, this);

        super.onRegister();

        // Globals.Keyboard.addListenerKeyUp(Phaser.Keyboard.ONE, this.handleOne, this);

        this.handleInitPlayer();
    }

    // private handleOne(): void {
    //     let param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();
    //     param.id = 1;
    //     Globals.ModuleManager.openModule(ModuleTypeEnum.STORAGE, param);
    // }

    /// never start
    public _initGME() {
        // TODO just for test, need get sdkAppId from settings
        const sdkAppId: string = "1400209172";
        let playerId = Globals.DataCenter.PlayerData.mainPlayerInfo.id;
        GMEApi.Init(document, sdkAppId, playerId.toString());
        GMEApi.SetTMGDelegate((event, result) => {
            switch (event) {
                case GMEApi.event.ITMG_MAIN_EVENT_TYPE_ENTER_ROOM:
                    console.log(`[GME]: EnterRoom >> ${result}`);
                    break;
                case GMEApi.event.ITMG_MAIN_EVNET_TYPE_USER_UPDATE:
                    console.log(`Info: 发送码率: ${result.UploadBRSend} | RTT: ${result.UploadRTT} -- Peer: ${JSON.stringify(result.PeerInfo)}`);
                    break;
                case GMEApi.event.ITMG_MAIN_EVENT_TYPE_EXIT_ROOM:
                    console.log(`[GME]: ExitRoom`);
                    break;
                case GMEApi.event.ITMG_MAIN_EVENT_TYPE_ROOM_DISCONNECT:
                    console.log(`[GME]: Room Disconnect!!!`);
                    break;
                default:
                    console.log("[GME]: Sth wrong...");
                    break;
            }
        });
        this.sendGenAuthBuffer();
        this._inRoom = false;
    }

    private handleInitPlayer() {
        if (Globals.DataCenter.PlayerData.initialize) {
            this._initGME();
        } else {
            Globals.MessageCenter.on(MessageType.PLAYER_DATA_INITIALIZE, this._initGME, this);
        }
    }

    public sendGenAuthBuffer(): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER);
        let content: OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER = pkt.content;
        content.roomId = Globals.DataCenter.SceneData.mapInfo.voiceChatRoomId;
        Globals.SocketManager.send(pkt);
    }
    /// never end

    private handleLaba(value: boolean): void {
        if (value) {
            this.enterRoom();
        } else {
            this.view.voiceButton.select = false;
            this.exitRoom();
        }
    }

    private handleVoice(value: boolean): void {
        if (!this.view.labaButton.select) {
            this.view.voiceButton.select = false;
            return;
        }
        if (this._inRoom) {
            GMEApi.EnableMic(value);
        }
    }

    public exitRoom(): void {
        GMEApi.EnableMic(false);
        GMEApi.ExitRoom();
        this._inRoom = false;
    }

    public enterRoom(): void {
        // TODO Get sceneId authBuffer, and set room Type enum
        // roomType 1, 2, 3 for audio quality， 3 is the best
        let roomId = Globals.DataCenter.SceneData.mapInfo.voiceChatRoomId;
        GMEApi.EnterRoom(roomId.toString(), 1, this.authBuffer);
        this._inRoom = true;
    }

    private sayHello(event) {
        event.stopPropagation();
        if (event.keyCode === Phaser.Keyboard.ENTER) {
            this.onHandleBt();
        } else if (event.keyCode === Phaser.Keyboard.TAB) {
            this.view.changedChannel();
        } else if (event.keyCode === Phaser.Keyboard.UP) {
            this._historyIndex--;
            this.showHistoryChat(this._historyIndex);
        } else if (event.keyCode === Phaser.Keyboard.DOWN) {
            this._historyIndex++;
            this.showHistoryChat(this._historyIndex);
        }
    }

    private onHandleChangeChatRoom(): void {
        if (this._inRoom || this.view.labaButton.select) {
            this.exitRoom();
        }
        this.sendGenAuthBuffer();
    }

    public onRemove(): void {
        Globals.MessageCenter.cancel(MessageType.CHAT_TO, this.onHandleChat, this);
        Globals.MessageCenter.cancel(MessageType.QCLOUD_AUTH, this.onHandleQcloudAuth, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_CHANGE_TO, this.onHandleChangeChatRoom, this);
        Globals.MessageCenter.cancel(MessageType.ENTER_SCENE, this.onHandleChangeChatRoom, this);
        Globals.MessageCenter.cancel(MessageType.PLAYER_DATA_INITIALIZE, this._initGME, this);
        this.view.bt.cancel("up", this.onHandleBt);

        (<any>this.view.input_tf).domElement.element.removeEventListener("keydown", this.sayHello.bind(this));
        this.view.labaButton.cancelCallBack(this.handleLaba, this);
        this.view.voiceButton.cancelCallBack(this.handleVoice, this);
        this.view.selectedChanel.onSelectedItem.remove(this.changeMessageChannel, this);

        super.onRemove();
    }

    private onHandleChat(chat: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHAT): void {
        let chatStr = "";
        if (chat.chatSenderid) {
            let player = Globals.DataCenter.PlayerData.getPlayer(chat.chatSenderid);
            if (player) chatStr += player.name + ": ";
        }
        chatStr += chat.chatContext + "\n";
        this.appendMessage(this._allMessage, { chat: chatStr, channel: chat.chatChannel, color: chat.chatSetting ? chat.chatSetting.textColor : this.generateHexColor() });
        this.changeMessageChannel();
    }

    private appendMessage(ary: IMessage[], message: IMessage) {
        ary.push(message);
        if (ary.length > this._maxMessageNum) {
            ary.shift();
        }
    }

    private generateHexColor() {
        return "#" + ((0.5 + 0.5 * Math.random()) * 0xFFFFFF << 0).toString(16);
    }

    private onHandleQcloudAuth(value: string): void {
        this.authBuffer = value;
        if (this.view.labaButton.select) {
            this.enterRoom();
            if (this.view.voiceButton.select) {
                GMEApi.EnableMic(true);
            }
        }
    }

    private onHandleBt(): void {
        if (this.view.inputValue === "") {
            return;
        }
        if (!!this._timeout === true) {
            return;
        }
        this._historyChat.push(this.view.inputValue);
        this._historyIndex = this._historyChat.length;
        if (this._historyChat.length > 5) {
            this._historyChat.shift();
        }
        this.view.input_tf.endFocus();
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
        let content: IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
        content.chatChannel = this.view.inputChannel;
        content.chatContext = this.view.inputValue;
        this.view.inputValue = "";
        Globals.SocketManager.send(pkt);
        this.view.input_tf.startFocus();
        this._timeout = setTimeout(() => {
            clearTimeout(this._timeout);
            this._timeout = 0;
        }, this._chatCD);
    }

    private changeMessageChannel() {
        let showMessage = this._allMessage.filter(message => message.channel === this.view.outChannel || message.channel === op_client.ChatChannel.System || this.view.outChannel === null);
        const len = showMessage.length;
        this.view.clearOutTf();
        let message: IMessage = null;
        let colorIndex = 0;
        for (let i = 0; i < len; i++) {
            message = showMessage[i];
            colorIndex += message.chat.length;
            this.view.appendMessage(message.chat, message.color, colorIndex);
        }
        // this.view.out_tf.text += chatStr;
        this.view.scroller.scroll();
    }

    private showHistoryChat(index: number) {
        if (this._historyIndex < 0) {
            this._historyIndex = this._historyChat.length - 1;
        }
        if (this._historyIndex >= this._historyChat.length) {
            this._historyIndex = 0;
        }
        this.view.input_tf.setText(this._historyChat[this._historyIndex]);
        this.view.input_tf.startFocus();
    }
}

export interface IMessage {
    chat: string;
    channel: op_client.ChatChannel;
    color: string;
}