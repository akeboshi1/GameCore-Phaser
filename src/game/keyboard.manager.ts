import { PBpacket, PacketHandler, Packet } from "net-socket-packet";
import { ConnectionService } from "../net/connection.service";
import { op_virtual_world, op_client } from "pixelpai_proto";
import { WorldService } from "./world.service";
import { Room, RoomService } from "../rooms/room";

export class KeyBoardManager extends PacketHandler {
    //获取的需要监听的key值列表
    private mCodeList: number[];
    //添加到scene中需要监听的key列表
    private mKeyList: Phaser.Input.Keyboard.Key[];
    //所有按下的key列表
    private mKeyDownList: Phaser.Input.Keyboard.Key[];
    //所有抬起key值字段
    private mTmpUpKeysStr: string;
    //所有按下key值字段
    private mTmpDownKeyStr: string;
    //是否初始化获取到了需要监听的key值列表
    private mInitilized: boolean = true;
    //==============================
    private mGame: Phaser.Game;
    private mScene: Phaser.Scene;
    private mConnect: ConnectionService;
    constructor(private worldService: WorldService) {
        super();
        this.mCodeList = [37, 38, 39, 40];
        this.mKeyList = [];
        this.mKeyDownList = [];
        this.mTmpUpKeysStr = "";
        this.mTmpDownKeyStr = "";

        this.mGame = this.worldService.game;
        this.mConnect = this.worldService.connection;


        //todo 服务器添加获取监听按键协议
        //this.mConnect.send(Packet);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT, this.keyCodeListCallBack);
    }

    /**
     * 缓存服务器发送给客户端需要监听的key值，等获取scene之后把这些值添加到scene中
     * @param packet 
     */
    private keyCodeListCallBack(packet: PBpacket) {
        this.mInitilized = true;
        //this.mCodeList = packet.content;
    }

    private addKeyEvent(key: Phaser.Input.Keyboard.Key): void {
        key.on("down", this.keyDownHandle, this);
        key.on("up", this.keyUpHandle, this);
        this.mKeyList.push(key);
    }

    private keyDownHandle(e: KeyboardEvent) {

        //TODO role action
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        let content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        let keyArr: number[] = this.getKeyDowns();
        if (this.mTmpDownKeyStr === keyArr.toString() && keyArr.length > 0) return;
        this.mTmpDownKeyStr = keyArr.toString();
        content.keyCodes = keyArr;
        this.mConnect.send(pkt);
    }

    private keyUpHandle(e: KeyboardEvent) {
        //TODO role action
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_UP);
        let content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_UP = pkt.content;
        let keyArr: number[] = this.getKeyUps();
        if (this.mTmpUpKeysStr === keyArr.toString()) return;
        this.mTmpUpKeysStr = keyArr.toString();
        content.keyCodes = keyArr;
        this.mConnect.send(pkt);
        let len: number = this.mKeyDownList.length;
        let key: Phaser.Input.Keyboard.Key;
        let keyCode: number;
        let keyCodeLen: number = keyArr.length;
        for (let j: number = 0; j < keyCodeLen; j++) {
            keyCode = keyArr[j];
            for (let i: number = 0; i < len; i++) {
                key = this.mKeyDownList[i];
                if (keyCode == key.keyCode) {
                    this.mKeyDownList.splice(i, 1);
                    i--;
                    len--;
                    break;
                }
            }
        }
    }

    private getKeyDowns(): number[] {
        let keyCodes: number[] = [];
        if (!this.mInitilized) {
            return keyCodes;
        }
        let key: Phaser.Input.Keyboard.Key;
        let len = this.mKeyList.length;
        for (let i = 0; i < len; i++) {
            key = this.mKeyList[i];
            if (key && key.isDown) {
                keyCodes.push(key.keyCode);
                this.mKeyDownList.push(key);
            }
        }
        return keyCodes;
    }

    private getKeyUps(): number[] {
        //在keyDown列表里面查找是否有键抬起，其余没按的键不必监听
        let keyCodes: number[] = [];
        if (!this.mInitilized) {
            return keyCodes;
        }
        let key: Phaser.Input.Keyboard.Key;
        let len = this.mKeyDownList.length;
        for (let i = 0; i < len; i++) {
            key = this.mKeyDownList[i];
            if (key && key.isUp) {
                keyCodes.push(key.keyCode);
            }
        }
        return keyCodes;
    }

    private removeKeyEvents(): void {
        if (!this.mScene) return;
        let key: Phaser.Input.Keyboard.Key;
        let len: number = this.mKeyList.length;
        for (let i = 0; i < len; i++) {
            key = this.mKeyList[i];
            if (!key) {
                continue;
            }
            key.off("down", this.keyDownHandle);
            key.off("up", this.keyUpHandle);
            this.mScene.input.keyboard.removeKey(key.keyCode);
        }
        this.mKeyList.length = 0;
        this.mKeyList = null;
    }

    /**
     * world中当scene发生变化时，传入当前激活的scene
     * room由world去休眠/激活
     * @param room
     */
    public setRoom(room: RoomService) {
        this.mScene = room.scene;
        if (!this.mScene) return;
        let len = this.mCodeList.length;
        let code: number;
        let key: Phaser.Input.Keyboard.Key;
        for (let i = 0; i < len; i++) {
            code = this.mCodeList[i];
            key = this.mScene.input.keyboard.addKey(code);
            this.addKeyEvent(key);
        }
    }

    /**
     * 设置键盘开关
     */
    public set enable(value: boolean) {
        if (!this.mScene) return;
        this.mScene.input.keyboard.enabled = value;
    }

    public get enable(): boolean {
        return this.mScene != undefined ? this.mScene.input.keyboard.enabled : false;
    }

    public dispose() {
        this.removeKeyEvents();
        if (this.mKeyDownList) {
            this.mKeyDownList.length = 0;
            this.mKeyDownList = null;
        }
        if (this.mCodeList) {
            this.mCodeList.length = 0;
            this.mCodeList = null;
        }
        this.mTmpDownKeyStr = null;
        this.mTmpUpKeysStr = null;
        this.mScene = null;
        this.mConnect = null;
        this.mGame = null;
        this.mInitilized = false;
    }
}