/**
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";

export class KeyboardMod extends BaseSingleton {
    private keyCodes: number[];
    private upKey;
    private downKey;
    private leftKey;
    private rightKey;
    private wKey;
    private sKey;
    private aKey;
    private dKey;

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

    private get keyDowns(): number[] {
        if (this.keyCodes == null) this.keyCodes = [];
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

        if (this.keyDowns.length == 0) return;

        this._isKeyDown = true;
        this._keyDownCode = "";

        if (this.keyDowns.length == 2) {
            if (this.keyDowns.indexOf(Phaser.Keyboard.UP) != -1 && this.keyDowns.indexOf(Phaser.Keyboard.RIGHT) != -1) {
                this._keyDownCode = [Phaser.Keyboard.UP, Phaser.Keyboard.RIGHT].toString();
            } else if (this.keyDowns.indexOf(Phaser.Keyboard.W) != -1 && this.keyDowns.indexOf(Phaser.Keyboard.D) != -1) {
                this._keyDownCode = [Phaser.Keyboard.W, Phaser.Keyboard.D].toString();
            } else if (this.keyDowns.indexOf(Phaser.Keyboard.UP) != -1 && this.keyDowns.indexOf(Phaser.Keyboard.LEFT) != -1) {
                this._keyDownCode = [Phaser.Keyboard.UP, Phaser.Keyboard.LEFT].toString();
            } else if (this.keyDowns.indexOf(Phaser.Keyboard.W) != -1 && this.keyDowns.indexOf(Phaser.Keyboard.A) != -1) {
                this._keyDownCode = [Phaser.Keyboard.W, Phaser.Keyboard.A].toString();
            }  else if (this.keyDowns.indexOf(Phaser.Keyboard.DOWN) != -1 && this.keyDowns.indexOf(Phaser.Keyboard.RIGHT) != -1) {
                this._keyDownCode = [Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT].toString();
            } else if (this.keyDowns.indexOf(Phaser.Keyboard.S) != -1 && this.keyDowns.indexOf(Phaser.Keyboard.D) != -1) {
                this._keyDownCode = [Phaser.Keyboard.S, Phaser.Keyboard.D].toString();
            } else if (this.keyDowns.indexOf(Phaser.Keyboard.DOWN) != -1 && this.keyDowns.indexOf(Phaser.Keyboard.LEFT) != -1) {
                this._keyDownCode = [Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT].toString();
            } else if (this.keyDowns.indexOf(Phaser.Keyboard.S) != -1 && this.keyDowns.indexOf(Phaser.Keyboard.A) != -1) {
                this._keyDownCode = [Phaser.Keyboard.S, Phaser.Keyboard.A].toString();
            }
        }
        if (this.keyDownCode == "")
            this._keyDownCode = this.keyDowns[0].toString();
    }

    public clear(): void {
        this.keyCodes.splice(0);
    }
}
