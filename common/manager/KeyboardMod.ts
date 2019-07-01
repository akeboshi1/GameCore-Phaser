/**
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";
import {PBpacket} from "net-socket-packet";
import {op_virtual_world} from "pixelpai_proto";
import Globals from "../../Globals";
import {HashMap} from "../../base/ds/HashMap";
import Key = Phaser.Key;
import IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = op_virtual_world.IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN;
import {Log} from "../../Log";

export class KeyboardMod extends BaseSingleton {

    /**
     * 构造函数
     */
    public constructor() {
        super();
    }

    public get initilized(): boolean {
        return this.mInitilized;
    }
    private game: Phaser.Game;
    protected keyDownHandleDic: HashMap;
    protected keyUpHandleDic: HashMap;
    private mInitilized = false;

    protected keyList: Key[];

    private tempKeys: string;

    public init(game: Phaser.Game): void {
        this.game = game;
        this.keyList = [];
        //  Stop the following keys from propagating up to the browser
        // this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
        //     Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D]);

        let codeList: number[] = [Phaser.Keyboard.ENTER, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.W, Phaser.Keyboard.A, Phaser.Keyboard.S, Phaser.Keyboard.D,
            Phaser.Keyboard.B, Phaser.Keyboard.F, Phaser.Keyboard.ONE, Phaser.Keyboard.TWO, Phaser.Keyboard.THREE, Phaser.Keyboard.FOUR, Phaser.Keyboard.FIVE, Phaser.Keyboard.SIX, Phaser.Keyboard.SEVEN,
            Phaser.Keyboard.EIGHT, Phaser.Keyboard.NINE, Phaser.Keyboard.ZERO, Phaser.Keyboard.UNDERSCORE, Phaser.Keyboard.EQUALS, Phaser.KeyCode.F2];

        let len = codeList.length;
        let code: number;
        let key: Key;
        for (let i = 0; i < len; i++) {
            code = codeList[i];
            key = this.game.input.keyboard.addKey(code);
            this.addKeyEvent(key);
        }

        this.keyDownHandleDic = new HashMap();
        this.keyUpHandleDic = new HashMap();

        this.mInitilized = true;
    }

    protected addKeyEvent(key: Key): void {
        key.onDown.add(this.keyDownHandle, this);
        key.onUp.add(this.keyUpHandle, this);
        this.keyList.push(key);
    }

    protected removeKeyEvents(): void {
        let key: Key;
        let len = this.keyList.length;
        for (let i = 0; i < len; i++) {
            key = this.keyList[i];
            key.onDown.remove(this.keyDownHandle, this);
            key.onUp.remove(this.keyUpHandle, this);
        }
    }

    protected onDown(key: number): void {
        let boo: boolean = this.keyDownHandleDic.has(key);
        if (!boo) {
            return;
        }

        let arr: any[] = this.keyDownHandleDic.getValue(key);
        let len: number = arr.length;
        for (let i = 0; i < len; i++) {
            let cb: Function;
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

    protected onUp(key: number): void {
        let boo: boolean = this.keyUpHandleDic.has(key);
        if (!boo) {
            return;
        }

        let arr: any[] = this.keyUpHandleDic.getValue(key);
        let len: number = arr.length;
        for (let i = 0; i < len; i++) {
            let cb: Function;
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

    public addListenerKeyUp(key: number, callBack: Function, context?: any, once?: boolean): void {
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

    public addListenerKeyDown(key: number, callBack: Function, context?: any, once?: boolean): void {
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

    protected onUpdate(): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN);
        let content: IOP_CLIENT_REQ_GATEWAY_KEYBOARD_DOWN = pkt.content;
        let keyArr: number[] = this.getKeyDowns();
        if (this.tempKeys === keyArr.toString()) return;
        this.tempKeys = keyArr.toString();
        // Log.trace("down-->", keyArr.toString());
        // Log.warn("[按键]：" + keyArr.toString());
        content.keyCodes = keyArr;
        Globals.SocketManager.send(pkt);
    }

    private keyDownHandle(key: Phaser.Key): void {
        this.onDown(key.keyCode);
        this.onUpdate();
    }

    private keyUpHandle(key: Phaser.Key): void {
        this.onUp(key.keyCode);
        this.onUpdate();
    }

    public getKeyDowns(): number[] {
        let keyCodes = [];
        if (!this.initilized) {
            return keyCodes;
        }
        let key: Key;
        let len = this.keyList.length;
        for (let i = 0; i < len; i++) {
            key = this.keyList[i];
            if (key.isDown) {
                keyCodes.push(key.keyCode);
            }
        }
        return keyCodes;
    }

    public dispose(): void {
        if (!this.initilized) {
            return;
        }
        this.removeKeyEvents();
        this.game = null;
        super.dispose();
        this.mInitilized = false;
    }
}
