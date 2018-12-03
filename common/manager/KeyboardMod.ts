/**
 * author aaron
 */
import {Log} from "../../Log";
import Key = Phaser.Key;
import BaseSingleton from "../../base/BaseSingleton";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world} from "../../../protocol/protocols";
import Globals from "../../Globals";
import IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN;
import IOP_CLIENT_REQ_GATEWAY_KEYBOARD_UP = op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_UP;

export class KeyboardMod extends BaseSingleton {
    private _isKeyDown: boolean = false;
    private game: Phaser.Game;
    public upKey: Key;
    public downKey: Key;
    public leftKey: Key;
    public rightKey: Key;
    public wKey: Key;
    public sKey: Key;
    public aKey: Key;
    public dKey: Key;

    /**
     * 构造函数
     */
    public constructor() {
        super();
    }

    public get isKeyDown(): boolean {
        return this._isKeyDown;
    }

    public init(game: Phaser.Game): void {
        this.game = game;

        //  Stop the following keys from propagating up to the browser
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D]);

        this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        // this.upKey.onDown.add(this.keyDownHandle, this);
        // this.upKey.onUp.add(this.keyUpHandle, this);
        this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        // this.downKey.onDown.add(this.keyDownHandle, this);
        // this.downKey.onUp.add(this.keyUpHandle, this);
        this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        // this.leftKey.onDown.add(this.keyDownHandle, this);
        // this.leftKey.onUp.add(this.keyUpHandle, this);
        this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        // this.rightKey.onDown.add(this.keyDownHandle, this);
        // this.rightKey.onUp.add(this.keyUpHandle, this);
        //
        this.wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
        // this.wKey.onDown.add(this.keyDownHandle, this);
        // this.wKey.onUp.add(this.keyUpHandle, this);
        this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        // this.sKey.onDown.add(this.keyDownHandle, this);
        // this.sKey.onUp.add(this.keyUpHandle, this);
        this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        // this.aKey.onDown.add(this.keyDownHandle, this);
        // this.aKey.onUp.add(this.keyUpHandle, this);
        this.dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        // this.dKey.onDown.add(this.keyDownHandle, this);
        // this.dKey.onUp.add(this.keyUpHandle, this);
    }

    private tempKeys: string;
    public onUpdate(): void {
        Log.trace("Tick--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=->")
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        let content: IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        let keyArr: number[] = this.getKeyDowns();
        if (this.tempKeys === keyArr.toString()) return;
        this.tempKeys = keyArr.toString();
        Log.trace("down-->", keyArr);
        content.keyCodes = keyArr;
        Globals.SocketManager.send(pkt);
    }

    private keyDownHandle( key: any ): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        let content: IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        Log.trace("down-->", key.keyCode);
        content.keyCodes = [key.keyCode];
        Globals.SocketManager.send(pkt);
    }

    private keyUpHandle( key: any ): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_UP);
        let content: IOP_CLIENT_REQ_GATEWAY_KEYBOARD_UP = pkt.content;
        Log.trace("up-->", key.keyCode);
        content.keyCodes = [key.keyCode];
        Globals.SocketManager.send(pkt);
    }


    private keyDownHandle1(): void {
        let keyArr: number[] = this.CheckKey();
        if ( this.isKeyDown ) {
            let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
            let content: IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
            content.keyCodes = keyArr;
            Globals.SocketManager.send(pkt);
        }
    }

    public getKeyDowns(): number[] {
        let keyCodes = [];
        if (this.upKey.isDown) keyCodes.push(Phaser.Keyboard.UP);
        if (this.downKey.isDown) keyCodes.push(Phaser.Keyboard.DOWN);
        if (this.leftKey.isDown) keyCodes.push(Phaser.Keyboard.LEFT);
        if (this.rightKey.isDown) keyCodes.push(Phaser.Keyboard.RIGHT);
        if (this.wKey.isDown) keyCodes.push(Phaser.Keyboard.W);
        if (this.sKey.isDown) keyCodes.push(Phaser.Keyboard.S);
        if (this.aKey.isDown) keyCodes.push(Phaser.Keyboard.A);
        if (this.dKey.isDown) keyCodes.push(Phaser.Keyboard.D);
        return keyCodes;
    }

    public CheckKey(): number[] {
        this._isKeyDown = false;
        let keyDowns = this.getKeyDowns();
        if (keyDowns.length === 0) return null;

        let lastDownArr: number[] = [];

        this._isKeyDown = true;

        if (keyDowns.length === 2) {
            if (keyDowns.indexOf(Phaser.Keyboard.UP) !== -1 && keyDowns.indexOf(Phaser.Keyboard.RIGHT) !== -1) {
                lastDownArr = [Phaser.Keyboard.UP, Phaser.Keyboard.RIGHT];
            } else if (keyDowns.indexOf(Phaser.Keyboard.W) !== -1 && keyDowns.indexOf(Phaser.Keyboard.D) !== -1) {
                lastDownArr = [Phaser.Keyboard.W, Phaser.Keyboard.D];
            } else if (keyDowns.indexOf(Phaser.Keyboard.UP) !== -1 && keyDowns.indexOf(Phaser.Keyboard.LEFT) !== -1) {
                lastDownArr = [Phaser.Keyboard.UP, Phaser.Keyboard.LEFT];
            } else if (keyDowns.indexOf(Phaser.Keyboard.W) !== -1 && keyDowns.indexOf(Phaser.Keyboard.A) !== -1) {
                lastDownArr = [Phaser.Keyboard.W, Phaser.Keyboard.A];
            } else if (keyDowns.indexOf(Phaser.Keyboard.DOWN) !== -1 && keyDowns.indexOf(Phaser.Keyboard.RIGHT) !== -1) {
                lastDownArr = [Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT];
            } else if (keyDowns.indexOf(Phaser.Keyboard.S) !== -1 && keyDowns.indexOf(Phaser.Keyboard.D) !== -1) {
                lastDownArr = [Phaser.Keyboard.S, Phaser.Keyboard.D];
            } else if (keyDowns.indexOf(Phaser.Keyboard.DOWN) !== -1 && keyDowns.indexOf(Phaser.Keyboard.LEFT) !== -1) {
                lastDownArr = [Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT];
            } else if (keyDowns.indexOf(Phaser.Keyboard.S) !== -1 && keyDowns.indexOf(Phaser.Keyboard.A) !== -1) {
                lastDownArr = [Phaser.Keyboard.S, Phaser.Keyboard.A];
            }
        }
        if (lastDownArr.length === 0) {
            lastDownArr = [keyDowns[0]];
        }

        Log.trace("KeyCode--->" + lastDownArr);
        return lastDownArr;
    }
}
