import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../net/connection.service";
import { op_virtual_world } from "pixelpai_proto";
import { WorldService } from "./world.service";
import { IRoomService } from "../rooms/room";
import { Logger } from "../utils/log";

export interface KeyboardListener {
    onKeyUp(keys: number[]): void;

    onKeyDown(keys: number[]): void;
}

export class KeyBoardManager extends PacketHandler {
    // 获取的需要监听的key值列表
    private mCodeList: number[];
    // 添加到scene中需要监听的key列表
    private mKeyList: Phaser.Input.Keyboard.Key[];
    // 所有按下的key列表
    private mKeyDownList: Phaser.Input.Keyboard.Key[];
    // 所有抬起key值字段
    private mTmpUpKeysStr: string;
    // 所有按下key值字段
    private mTmpDownKeyStr: string;
    // 是否初始化获取到了需要监听的key值列表
    private mInitilized: boolean = true;
    // ==============================
    private mRoom: IRoomService;
    private mScene: Phaser.Scene;
    private mConnect: ConnectionService;

    // 所有需要监听key的监听事件
    private mKeyboardListeners: KeyboardListener[] = [];

    constructor(private worldService: WorldService) {
        super();
        this.mCodeList = [37, 38, 39, 40, 65, 87, 68, 83];
        this.mKeyList = [];
        this.mKeyDownList = [];
        this.mTmpUpKeysStr = "";
        this.mTmpDownKeyStr = "";

        this.mConnect = this.worldService.connection;
    }

    public addListener(l: KeyboardListener) {
        this.mKeyboardListeners.push(l);
    }

    public removeListener(l: KeyboardListener) {
        const idx: number = this.mKeyboardListeners.indexOf(l);
        if (idx >= 0) {
            this.mKeyboardListeners.splice(idx, 1);
        }
    }

    /**
     * world中当scene发生变化时，传入当前激活的scene
     * room由world去休眠/激活
     * @param room
     */
    public changeRoom(room: IRoomService) {
        this.mRoom = room;
        this.mScene = room.scene;
        if (!this.mScene) return;
        const len = this.mCodeList.length;
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
        return this.mScene !== undefined ? this.mScene.input.keyboard.enabled : false;
    }

    public get keyList(): Phaser.Input.Keyboard.Key[] {
        return this.mKeyList;
    }

    public destroy() {
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
        this.mInitilized = false;
    }

    private addKeyEvent(key: Phaser.Input.Keyboard.Key): void {
        key.on("down", this.keyDownHandle, this);
        key.on("up", this.keyUpHandle, this);
        this.mKeyList.push(key);
    }

    private keyDownHandle(e: KeyboardEvent) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        const keyArr: number[] = this.getKeyDowns();
        if (this.mTmpDownKeyStr === keyArr.toString()) return;
        this.mTmpUpKeysStr = "";
        this.mTmpDownKeyStr = keyArr.toString();
        content.keyCodes = keyArr;
        this.mConnect.send(pkt);
        // then trigger listener
        this.mKeyboardListeners.forEach((l: KeyboardListener) => {
            l.onKeyDown(keyArr);
        });
    }

    private keyUpHandle(e: KeyboardEvent) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_UP);
        const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_UP = pkt.content;
        const keyArr: number[] = this.getKeyUps();
        if (this.mTmpUpKeysStr === keyArr.toString()) return;
        this.mTmpDownKeyStr = "";
        this.mTmpUpKeysStr = keyArr.toString();
        content.keyCodes = keyArr;
        this.mConnect.send(pkt);
        // then trigger listener
        this.mKeyboardListeners.forEach((l: KeyboardListener) => {
            l.onKeyUp(keyArr);
        });
        // let len: number = this.mKeyDownList.length;
        // let key: Phaser.Input.Keyboard.Key;
        // let keyCode: number;
        // const keyCodeLen: number = keyArr.length;
        // for (let j: number = 0; j < keyCodeLen; j++) {
        //     keyCode = keyArr[j];
        //     for (let i: number = 0; i < len; i++) {
        //         key = this.mKeyDownList[i];
        //         if (keyCode === key.keyCode) {
        //             this.mKeyDownList.splice(i, 1);
        //             i--;
        //             len--;
        //             break;
        //         }
        //     }
        // }

    }

    private getKeyDowns(): number[] {
        const keyCodes: number[] = [];
        if (!this.mInitilized) {
            return keyCodes;
        }
        let key: Phaser.Input.Keyboard.Key;
        const len = this.mKeyList.length;
        for (let i = 0; i < len; i++) {
            key = this.mKeyList[i];
            if (key && key.isDown && this.mKeyDownList.indexOf(key) === -1) {
                keyCodes.push(key.keyCode);
                this.mKeyDownList.push(key);
            }
        }
        return keyCodes;
    }

    private getKeyUps(): number[] {
        // 在keyDown列表里面查找是否有键抬起，其余没按的键不必监听
        const keyCodes: number[] = [];
        if (!this.mInitilized) {
            return keyCodes;
        }
        let key: Phaser.Input.Keyboard.Key;
        let len = this.mKeyDownList.length;
        for (let i = 0; i < len; i++) {
            key = this.mKeyDownList[i];
            if (key && key.isUp && keyCodes.indexOf(key.keyCode) === -1) {
                keyCodes.push(key.keyCode);
                this.mKeyDownList.splice(i, 1);
                i--;
                len--;
                // Logger.debug("up0:" + key.keyCode);
            }
            // Logger.debug("up1:" + key.keyCode);
        }
        return keyCodes;
    }

    private removeKeyEvents(): void {
        if (!this.mScene) return;
        let key: Phaser.Input.Keyboard.Key;
        const len: number = this.mKeyList.length;
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
}
