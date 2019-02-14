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
import {HashMap} from "../../base/ds/HashMap";

export class KeyboardMod extends BaseSingleton {
    private _isKeyDown = false;
    private game: Phaser.Game;
    public upKey: Key;
    public downKey: Key;
    public leftKey: Key;
    public rightKey: Key;
    public wKey: Key;
    public sKey: Key;
    public aKey: Key;
    public dKey: Key;
    protected keyDownHandleDic: HashMap;
    protected keyUpHandleDic: HashMap;

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
        // this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
        //     Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D]);

        this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.upKey.onDown.add(this.keyDownHandle, this);
        this.upKey.onUp.add(this.keyUpHandle, this);
        this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.downKey.onDown.add(this.keyDownHandle, this);
        this.downKey.onUp.add(this.keyUpHandle, this);
        this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.leftKey.onDown.add(this.keyDownHandle, this);
        this.leftKey.onUp.add(this.keyUpHandle, this);
        this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.rightKey.onDown.add(this.keyDownHandle, this);
        this.rightKey.onUp.add(this.keyUpHandle, this);
        //
        this.wKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.wKey.onDown.add(this.keyDownHandle, this);
        this.wKey.onUp.add(this.keyUpHandle, this);
        this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.sKey.onDown.add(this.keyDownHandle, this);
        this.sKey.onUp.add(this.keyUpHandle, this);
        this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.aKey.onDown.add(this.keyDownHandle, this);
        this.aKey.onUp.add(this.keyUpHandle, this);
        this.dKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        this.dKey.onDown.add(this.keyDownHandle, this);
        this.dKey.onUp.add(this.keyUpHandle, this);

        this.keyDownHandleDic = new HashMap();
        this.keyUpHandleDic = new HashMap();
        this.game.input.keyboard.addCallbacks(this, this.onDown, this.onUp);
    }

    protected onDown(key: number): void {
        let boo: boolean = this.keyDownHandleDic.has(key);
        if (!boo) {
            return;
        }

        let arr: any[] = this.keyDownHandleDic.getValue(key);
        let len: number = arr.length;
        for (let i = 0; i < len; i++) {
            let cb: Function
            if (arr[i].once) {
                cb = arr[i].cb;
                arr[i].cb = null;
                cb.apply(arr[i].context);
                arr[i].context = null;
                arr.splice(i, 1);
                i--;
                len--;
            } else {
                cb = arr[i].cb;
                cb.apply(arr[i].context);
            }
        }
    }

    protected onUp(event: KeyboardEvent): void {
        let key = event.keyCode;
        let boo: boolean = this.keyUpHandleDic.has(key);
        if (!boo) {
            return;
        }

        let arr: any[] = this.keyUpHandleDic.getValue(key);
        let len: number = arr.length;
        for (let i = 0; i < len; i++) {
            let cb: Function
            if (arr[i].once) {
                cb = arr[i].cb;
                arr[i].cb = null;
                cb.apply(arr[i].context);
                arr[i].context = null;
                arr.splice(i, 1);
                i--;
                len--;
            } else {
                cb = arr[i].cb;
                cb.apply(arr[i].context);
            }
        }
    }

    public addListenerKeyUp(key: number, callBack: Function, context?: any, once?: boolean ): void {
        let boo: boolean = this.keyUpHandleDic.has(key);
        let arr: any[];
        if (boo) {
            arr = this.keyUpHandleDic.getValue(key);
        } else {
            arr = [];
            this.keyUpHandleDic.add(key, arr);
        }
        arr.push({cb: callBack, context: context, once: once || false});
    }

    public removeListenerKeyUp(key: number, callBack: Function, context?: any): void {
        let boo: boolean = this.keyUpHandleDic.has(key);
        if (!boo) {
            return;
        }
        let arr: any[] = this.keyUpHandleDic.getValue(key);
        let len: number = arr.length;
        for (let i = 0; i < len; i++) {
            if (arr[i].cb === callBack && context === context) {
                arr.splice(i, 1);
                i--;
                len--;
            }
        }
    }

    public addListenerKeyDown(key: number, callBack: Function, context?: any, once?: boolean ): void {
        let boo: boolean = this.keyDownHandleDic.has(key);
        let arr: any[];
        if (boo) {
            arr = this.keyDownHandleDic.getValue(key);
        } else {
            arr = [];
            this.keyDownHandleDic.add(key, arr);
        }
        arr.push({cb: callBack, context: context, once: once || false});
    }

    public removeListenerKeyDown(key: number, callBack: Function, context?: any): void {
        let boo: boolean = this.keyDownHandleDic.has(key);
        if (!boo) {
            return;
        }
        let arr: any[] = this.keyDownHandleDic.getValue(key);
        let len: number = arr.length;
        for (let i = 0; i < len; i++) {
            if (arr[i].cb === callBack && context === context) {
                arr.splice(i, 1);
                i--;
                len--;
            }
        }
    }

    private tempKeys: string;
    protected onUpdate(): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        let content: IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        let keyArr: number[] = this.getKeyDowns();
        if (this.tempKeys === keyArr.toString()) return;
        this.tempKeys = keyArr.toString();
        // Log.trace("down-->", keyArr);
        // Log.warn("[按键]：" + keyArr.toString());
        content.keyCodes = keyArr;
        Globals.SocketManager.send(pkt);
    }

    private keyDownHandle( key: any ): void {
        this.onUpdate();
    }

    private keyUpHandle( key: any ): void {
        this.onUpdate();
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

    public dispose(): void {
      if (this.upKey) {
        this.upKey.onDown.remove(this.keyDownHandle, this);
        this.upKey.onUp.remove(this.keyUpHandle, this);
      }

      if (this.downKey) {
        this.downKey.onDown.remove(this.keyDownHandle, this);
        this.downKey.onUp.remove(this.keyUpHandle, this);
      }

      if (this.leftKey) {
        this.leftKey.onDown.remove(this.keyDownHandle, this);
        this.leftKey.onUp.remove(this.keyUpHandle, this);
      }

      if (this.rightKey) {
        this.rightKey.onDown.remove(this.keyDownHandle, this);
        this.rightKey.onUp.remove(this.keyUpHandle, this);
      }

      if (this.wKey) {
        this.wKey.onDown.remove(this.keyDownHandle, this);
        this.wKey.onUp.remove(this.keyUpHandle, this);
      }

      if (this.sKey) {
        this.sKey.onDown.remove(this.keyDownHandle, this);
        this.sKey.onUp.remove(this.keyUpHandle, this);
      }

      if (this.aKey) {
        this.aKey.onDown.remove(this.keyDownHandle, this);
        this.aKey.onUp.remove(this.keyUpHandle, this);
      }

      if (this.dKey) {
        this.dKey.onDown.remove(this.keyDownHandle, this);
        this.dKey.onUp.remove(this.keyUpHandle, this);
      }
      this.game = null;
      super.dispose();
    }
}
