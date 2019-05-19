import "phaser-ce";
import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../GameConfig";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {ComboBox} from "../../../base/component/combobox/ComboBox";
import {CheckButton} from "../../../base/component/button/CheckButton";
import "../../../web-rtc-service";
import LabaBt = UI.LabaBt;
import {PlayerInfo} from "../../../common/struct/PlayerInfo";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";
import {ModuleTypeEnum} from "../../../base/module/base/ModuleType";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world} from "pixelpai_proto";
import {Log} from "../../../Log";
import OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_QCLOUD_GME_AUTHBUFFER;

const GMEApi = new WebGMEAPI();
// TODO just for test, need get sdkAppId from settings
const sdkAppId: string = "1400209172";


export class ChatView extends ModuleViewBase {
    public out_tf: Phaser.Text;
    public input_tf: PhaserInput.InputField;
    public bt: NiceSliceButton;
    public scroller: ScrollArea;
    public comobox: ComboBox;
    public labaButton: CheckButton;
    public voiceButton: CheckButton;
    public roomId: number;
    public authBuffer: string;
    public playerId: number;
    private _inRoom: boolean;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
    }

    protected init(): void {
        this.game.add.nineSlice(0, GameConfig.GameHeight - 200, UI.DialogBg.getName(), null, 300, 200, this);
        this.game.add.nineSlice(10, GameConfig.GameHeight - 30, UI.InputBg.getName(), null, 250, 24, this);
        this.out_tf = this.game.make.text(0, 0, "", {fontSize: 12, fill: "#fff"});
        this.input_tf = this.game.add.inputField(12, GameConfig.GameHeight - 26, {fill: "#000", font: "12px", width: 245}, this);
        this.input_tf.focusOutOnEnter = false;
        this.input_tf.blockInput = true;
        this.bt = new NiceSliceButton(this.game, 262, GameConfig.GameHeight - 30, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", 30, 24, {
            top: 7,
            bottom: 7,
            left: 7,
            right: 7
        }, "发送", 12);
        this.add(this.bt);

        const bounds = new Phaser.Rectangle(10, GameConfig.GameHeight - 190, 280, 180);
        this.scroller = new ScrollArea(this.game, bounds);
        this.scroller.add(this.out_tf);
        this.scroller.start();
        this.add(this.scroller);

        this.comobox = new ComboBox(this.game, 5, GameConfig.GameHeight - 226, this, ["世界频道", "当前场景", "小喇叭"]);

        this.labaButton = new CheckButton(this.game, 238, GameConfig.GameHeight - 232, UI.LabaBt.getName());
        this.labaButton.onCallBack(this.handleLaba, this);
        this.add(this.labaButton);
        this.voiceButton = new CheckButton(this.game, 272, GameConfig.GameHeight - 232, UI.VoiceBt.getName());
        this.voiceButton.onCallBack(this.handleVoice, this);
        this.add(this.voiceButton);

        this.labaButton.select = true;
        this.voiceButton.select = true;
        let player: PlayerInfo = Globals.DataCenter.PlayerData.mainPlayerInfo;
        this.playerId = player.id;
        this.roomId = player.sceneId;
        this._initGME();
    }

    public exitRoom(): void {
        GMEApi.EnableMic(false);
        GMEApi.ExitRoom();
        this._inRoom = false;
        console.log(`---------------Exit Room!!!!!`);
    }

    public enterRoom(): void {
        // TODO Get sceneId authBuffer, and set room Type enum
        // roomType 1, 2, 3 for audio quality， 3 is the best
        console.log(`---------------Enter Room !!!!!!`);
        GMEApi.EnterRoom(this.roomId, 1, this.authBuffer);
        this._inRoom = true;
    }

    private handleLaba(value: boolean): void {
        //todo:
        value = this.labaButton.select;
        console.log(`room info: ${this.playerId}, ${this.authBuffer}, ${this.roomId}`);
        console.log(`---------------Laba Turns : ${value}`);
        if (value) {
            this.exitRoom();
        } else {
            this.enterRoom();
        }
    }

    private handleVoice(value: boolean): void {
        //todo:
        value = this.voiceButton.select;
        console.log(`---------------Voice Turns : ${value ? "True" : "false"}`);
        if (this.labaButton.select) {
            if (!value) {
                this.voiceButton.select = true;
            }
            return;
        }
        if (this._inRoom) {
            GMEApi.EnableMic(!value);
        }
    }

    public get inputValue(): string {
        if (this.input_tf)
            return this.input_tf.value;
        return "";
    }

    public set inputValue(v: string) {
        this.input_tf.setText(v);
    }

    /// never start
    public _initGME() {
        // TODO just test
        GMEApi.Init(document, sdkAppId, this.playerId);
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
        content.roomId = this.roomId;
        Globals.SocketManager.send(pkt);
    }
    /// never end

}
