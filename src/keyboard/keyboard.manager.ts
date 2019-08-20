import { PBpacket } from "net-socket-packet";
import { RoomManager } from "../rooms/room.manager";
import { ConnectionService } from "../net/connection.service";

export class KeyBoardManager {
    private _keyList: any[];
    private _initilized: boolean = false;
    private _scene: Phaser.Scene;
    private _connect: ConnectionService;
    constructor(private roomManager: RoomManager) {
        this._keyList = [];
        this._scene = this.roomManager.scene;
        this._connect = this.roomManager.connection;
    }

    private keyCodeListCallBack(packet: PBpacket) {
        this._initilized = true;
        let _codeList = packet.content;
        let len = _codeList.length;
        let code: number;
        let key: Phaser.Input.Keyboard.Key;
        for (let i = 0; i < len; i++) {
            code = _codeList[i];
            key = this._scene.input.keyboard.addKey(code);
            this.addKeyEvent(key);
        }
    }

    private addKeyEvent(key: Phaser.Input.Keyboard.Key): void {
        key.on("down", this.keyDownHandle);
        key.on("up", this.keyUpHandle);
        this._keyList.push(key);
    }

    private removeKeyEvents(): void {
        let key: Phaser.Input.Keyboard.Key;
        let len = this._keyList.length;
        for (let i = 0; i < len; i++) {
            key = this._keyList[i];
            key.off("down", this.keyDownHandle);
            key.off("up", this.keyUpHandle);
            this._scene.input.keyboard.removeKey(key.keyCode);
        }
        this._keyList.length = 0;
        this._keyList = null;
    }

    private keyDownHandle(e: KeyboardEvent) {
        //TODO role action
        //TODO socket 协议
        let pkt: PBpacket //= new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        let content: any = pkt.content;// IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        content.keyCode = e.keyCode;
        this._connect.send(pkt);
    }

    private keyUpHandle(e: KeyboardEvent) {
        //TODO role action
        //TODO socket 协议
        let pkt: PBpacket //= new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        let content: any = pkt.content;// IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        content.keyCode = e.keyCode;
        this._connect.send(pkt);
    }

    /**
     * 设置键盘开关
     */
    public set enable(value: boolean) {
        this._scene.input.keyboard.enabled = value;
    }

    public get enable(): boolean {
        return this._scene.input.keyboard.enabled;
    }

    public dispose() {
        this.removeKeyEvents();
        this._scene = null;
        this._connect = null;
        this.roomManager = null;
    }

}