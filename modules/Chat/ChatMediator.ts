import {MediatorBase} from "../../base/module/core/MediatorBase";
import {ChatView} from "./view/ChatView";
import Globals from "../../Globals";
import {PBpacket} from "net-socket-packet";
import {op_client, op_virtual_world} from "pixelpai_proto";
import {MessageType} from "../../common/const/MessageType";
import IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT;
import OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER;
const GMEApi = new WebGMEAPI();
// TODO just for test, need get sdkAppId from settings
const sdkAppId: string = "1400209172";
export class ChatMediator extends MediatorBase {
    private authBuffer: string;
    private _inRoom = false;
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

        super.onRegister();
        this._initGME();
    }

    /// never start
    public _initGME() {
        // TODO just test
        let playerId = Globals.DataCenter.PlayerData.mainPlayerInfo.id;
        GMEApi.Init(document, sdkAppId, playerId);
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

    public sendGenAuthBuffer(): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER);
        let content: OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER = pkt.content;
        let roomId = Globals.DataCenter.PlayerData.mainPlayerInfo.sceneId;
        content.roomId = roomId;
        Globals.SocketManager.send(pkt);
    }
    /// never end

    private handleLaba(value: boolean): void {
        console.log(`---------------Laba Turns : ${value}`);
        if (value) {
            this.enterRoom();
        } else {
            this.view.voiceButton.select = false;
            this.exitRoom();
        }
    }

    private handleVoice(value: boolean): void {
        console.log(`---------------Voice Turns : ${value}`);
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
        console.log(`---------------Enter Room !!!!!!`);
        let roomId = Globals.DataCenter.PlayerData.mainPlayerInfo.sceneId;
        GMEApi.EnterRoom(roomId, 1, this.authBuffer);
        this._inRoom = true;
    }

    private sayHello(event) {
        if (event.keyCode === Phaser.Keyboard.ENTER) {
            this.onHandleBt();
        }
    }

    private onHandleChangeChatRoom(): void {
        this.exitRoom();
        this.sendGenAuthBuffer();
    }

    public onRemove(): void {
        Globals.MessageCenter.cancel(MessageType.CHAT_TO, this.onHandleChat, this);
        Globals.MessageCenter.cancel(MessageType.QCLOUD_AUTH, this.onHandleQcloudAuth, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_CHANGE_TO, this.onHandleChangeChatRoom, this);
        Globals.MessageCenter.cancel(MessageType.ENTER_SCENE, this.onHandleChangeChatRoom, this);
        this.view.bt.cancel("up", this.onHandleBt);

        (<any>this.view.input_tf).domElement.element.removeEventListener("keydown", this.sayHello.bind(this));
        this.view.labaButton.cancelCallBack(this.handleLaba, this);
        this.view.voiceButton.cancelCallBack(this.handleVoice, this);

        super.onRemove();
    }

    private onHandleChat(chat: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_CHAT): void {
        this.view.out_tf.text += chat.chatContext + "\n";
        this.view.scroller.scroll();
    }

    private onHandleQcloudAuth(value: string): void {
        this.authBuffer = value;
    }

    private onHandleBt(): void {
        if (this.view.inputValue === "") {
            return;
        }
        this.view.input_tf.endFocus();
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
        let content: IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
        content.chatChannel = 0;
        content.chatContext = this.view.inputValue;
        this.view.inputValue = "";
        Globals.SocketManager.send(pkt);
        this.view.input_tf.startFocus();
    }
}
