/**
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";
import {Log} from "../../Log";
import Key = Phaser.Key;

export class KeyboardMod extends BaseSingleton {
    private keyCodes: number[] = [];
    private upKey: Key;
    private downKey: Key;
    private leftKey: Key;
    private rightKey: Key;
    private wKey: Key;
    private sKey: Key;
    private aKey: Key;
    private dKey: Key;

    /**
     * 构造函数
     */
    public constructor() {
        super();
        //  Register the keys.
        this.upKey = Globals.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.downKey = Globals.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.leftKey = Globals.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.rightKey = Globals.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

        this.wKey = Globals.game.input.keyboard.addKey(Phaser.Keyboard.W);
        this.sKey = Globals.game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.aKey = Globals.game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.dKey = Globals.game.input.keyboard.addKey(Phaser.Keyboard.D);
        //  Stop the following keys from propagating up to the browser
        Globals.game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.W, Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D]);
    }

    private _isKeyDown: boolean = false;

    public get isKeyDown(): boolean {
        return this._isKeyDown;
    }

    private _keyDownCode: string;

    public get keyDownCode(): string {
        return this._keyDownCode;
    }

    private getKeyDowns(): number[] {
        this.keyCodes.splice(0);
        if (this.upKey.isDown) this.keyCodes.push(Phaser.Keyboard.UP);
        if (this.downKey.isDown) this.keyCodes.push(Phaser.Keyboard.DOWN);
        if (this.leftKey.isDown) this.keyCodes.push(Phaser.Keyboard.LEFT);
        if (this.rightKey.isDown) this.keyCodes.push(Phaser.Keyboard.RIGHT);
        if (this.wKey.isDown) this.keyCodes.push(Phaser.Keyboard.W);
        if (this.sKey.isDown) this.keyCodes.push(Phaser.Keyboard.S);
        if (this.aKey.isDown) this.keyCodes.push(Phaser.Keyboard.A);
        if (this.dKey.isDown) this.keyCodes.push(Phaser.Keyboard.D);
        return this.keyCodes;
    }

    public CheckKey(): void {
        this._isKeyDown = false;
        let keyDowns = this.getKeyDowns();
        if (keyDowns.length === 0) return;

        this._isKeyDown = true;
        this._keyDownCode = "";

        if (keyDowns.length === 2) {
            if (keyDowns.indexOf(Phaser.Keyboard.UP) !== -1 && keyDowns.indexOf(Phaser.Keyboard.RIGHT) !== -1) {
                this._keyDownCode = [Phaser.Keyboard.UP, Phaser.Keyboard.RIGHT].toString();
            } else if (keyDowns.indexOf(Phaser.Keyboard.W) !== -1 && keyDowns.indexOf(Phaser.Keyboard.D) !== -1) {
                this._keyDownCode = [Phaser.Keyboard.W, Phaser.Keyboard.D].toString();
            } else if (keyDowns.indexOf(Phaser.Keyboard.UP) !== -1 && keyDowns.indexOf(Phaser.Keyboard.LEFT) !== -1) {
                this._keyDownCode = [Phaser.Keyboard.UP, Phaser.Keyboard.LEFT].toString();
            } else if (keyDowns.indexOf(Phaser.Keyboard.W) !== -1 && keyDowns.indexOf(Phaser.Keyboard.A) !== -1) {
                this._keyDownCode = [Phaser.Keyboard.W, Phaser.Keyboard.A].toString();
            } else if (keyDowns.indexOf(Phaser.Keyboard.DOWN) !== -1 && keyDowns.indexOf(Phaser.Keyboard.RIGHT) !== -1) {
                this._keyDownCode = [Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT].toString();
            } else if (keyDowns.indexOf(Phaser.Keyboard.S) !== -1 && keyDowns.indexOf(Phaser.Keyboard.D) !== -1) {
                this._keyDownCode = [Phaser.Keyboard.S, Phaser.Keyboard.D].toString();
            } else if (keyDowns.indexOf(Phaser.Keyboard.DOWN) !== -1 && keyDowns.indexOf(Phaser.Keyboard.LEFT) !== -1) {
                this._keyDownCode = [Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT].toString();
            } else if (keyDowns.indexOf(Phaser.Keyboard.S) !== -1 && keyDowns.indexOf(Phaser.Keyboard.A) !== -1) {
                this._keyDownCode = [Phaser.Keyboard.S, Phaser.Keyboard.A].toString();
            }
        }
        if (this.keyDownCode === "")
            this._keyDownCode = keyDowns[0].toString();
        Log.trace("KeyCode--->" + this.keyDownCode);
    }

    private onDown(): void {
        this.CheckKey();
    }

    private onUp(): void {
        this.CheckKey();
    }
}
