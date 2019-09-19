import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../net/connection.service";
import { op_virtual_world } from "pixelpai_proto";
import { WorldService } from "./world.service";
import { IRoomService, Room } from "../rooms/room";
import { InputManager, InputListener } from "./input.service";

export class KeyBoardManager extends PacketHandler implements InputManager {
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
    private mKeyboardListeners: InputListener[] = [];

    constructor(private worldService: WorldService) {
        super();
        this.mCodeList = [37, 38, 39, 40, 65, 87, 68, 83];
        this.mKeyList = [];
        this.mKeyDownList = [];
        this.mTmpUpKeysStr = "";
        this.mTmpDownKeyStr = "";

        this.mConnect = this.worldService.connection;
    }
    /**
     * world中当scene发生变化时，传入当前激活的scene
     * room由world去休眠/激活
     */
    onRoomChanged(currentRoom: IRoomService, previousRoom?: IRoomService): void {
        this.mRoom = currentRoom;
        this.mScene = currentRoom.scene;
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

    public addListener(l: InputListener) {
        this.mKeyboardListeners.push(l);
    }

    public removeListener(l: InputListener) {
        const idx: number = this.mKeyboardListeners.indexOf(l);
        if (idx >= 0) {
            this.mKeyboardListeners.splice(idx, 1);
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

    private checkMoveKeyDown(l: InputListener): boolean {
        let key: Phaser.Input.Keyboard.Key;
        const keyList: Phaser.Input.Keyboard.Key[] = this.mKeyList;
        const len = keyList.length;
        const keyCodeList: number[] = [];
        let keyCode: number;
        let outPut: number = 0;
        for (let i = 0; i < len; i++) {
            key = keyList[i];
            keyCode = key.keyCode;
            if (key && key.isDown) {
                // 65, 87, 68, 83
                switch (keyCode) {
                    case 37:
                    case 65:
                        outPut += -1;
                        break;
                    case 38:
                    case 87:
                        outPut += -3;
                        break;
                    case 39:
                    case 68:
                        outPut += 1;
                        break;
                    case 40:
                    case 83:
                        outPut += 3;
                        break;
                }
                keyCodeList.push(key.keyCode);
            }
        }
        if (outPut === 0) {
            return false;
        }
        const curDir: number = l.getDirection();
        let newDir: number;
        switch (outPut) {
            case -1:
                newDir = curDir <= 1 ? 1 : 3;
                break;
            case -2:
                newDir = 7;
                break;
            case -3:
                newDir = curDir <= 3 ? 1 : 7;
                break;
            case -4:
                newDir = 1;
                break;
            case 1:
                newDir = curDir <= 5 ? 5 : 7;
                break;
            case 2:
                newDir = 3;
                break;
            case 3:
                newDir = curDir <= 3 ? 3 : 5;
                break;
            case 4:
                newDir = 5;
                break;
        }
        l.setDirection(newDir);
        l.downHandler(newDir, keyCodeList);
        return true;
    }

    private checkMoveKeyAllUp(): boolean {
        let key: Phaser.Input.Keyboard.Key;
        const keyList: Phaser.Input.Keyboard.Key[] = this.mKeyList;
        const len = keyList.length;
        for (let i = 0; i < len; i++) {
            key = keyList[i];
            if (key && key.isDown) {
                return false;
            }
        }
        return true;
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
        this.mKeyboardListeners.forEach((l: InputListener) => {
            this.checkMoveKeyDown(l);
        });
    }

    private keyUpHandle(e: KeyboardEvent) {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_UP);
        const content: op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_UP = pkt.content;
        const keyArr: number[] = this.getKeyUps();
        if (this.mTmpUpKeysStr === keyArr.toString() || keyArr.length < 1) return;
        this.mTmpDownKeyStr = "";
        this.mTmpUpKeysStr = keyArr.toString();
        content.keyCodes = keyArr;
        this.mConnect.send(pkt);
        // then trigger listener
        this.mKeyboardListeners.forEach((l: InputListener) => {
            if (this.checkMoveKeyAllUp()) {
                l.upHandler();
            }
        });
    }

    private getKeyDowns(): number[] {
        // let keyCodes: number[] = [];
        if (!this.mInitilized) {
            return [];
        }
        if (!this.mKeyList) {
            return [];
        }
        this.mKeyDownList = this.mKeyList.filter((keyDown) => keyDown.isDown);
        return this.mKeyDownList.map((key) => key.keyCode);
    }

    private getKeyUps(): number[] {
        // 在keyDown列表里面查找是否有键抬起，其余没按的键不必监听
        const keyCodes: number[] = [];
        if (!this.mInitilized) {
            return keyCodes;
        }
        if (!this.mKeyDownList) {
            return [];
        }
        let key: Phaser.Input.Keyboard.Key;
        for (let i = 0; i < this.mKeyDownList.length; i++) {
            key = this.mKeyDownList[i];
            if (key && key.isUp) {
                this.mKeyDownList.splice(i, 1);
                keyCodes.push(key.keyCode);
                i--;
            }
        }
        // this.mKeyDownList = this.mKeyDownList.filter((keyDown) => keyDown.isDown);
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
