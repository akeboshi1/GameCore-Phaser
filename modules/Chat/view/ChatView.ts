import "phaser-ce";
import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../GameConfig";

export class ChatView extends ModuleViewBase {
    public out_tf: Phaser.Text;
    private input_tf: PhaserInput.InputField;
    public bt: Phaser.Sprite;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
    }

    protected init(): void {
        this.game.add.nineSlice(0, GameConfig.GameHeight - 200, UI.DialogBg.getName(), null, 300, 200, this);
        this.game.add.nineSlice(10, GameConfig.GameHeight - 30, UI.InputBg.getName(), null, 250, 24, this);
        this.out_tf = this.game.make.text(12, GameConfig.GameHeight - 190, "", {fontSize: 12, fill: "#fff"});
        this.add(this.out_tf);
        this.input_tf = this.game.add.inputField(12, GameConfig.GameHeight - 26, {fill: "#000", font: "12px", width: 245}, this);
        this.bt = new NiceSliceButton(this.game, 262, GameConfig.GameHeight - 30, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", 30, 24, {
            top: 7,
            bottom: 7,
            left: 7,
            right: 7
        });
        this.add(this.bt);
        this.game.add.text(276,  GameConfig.GameHeight - 30, "↑", {fontSize: 12, fill: "#000"}, this);
    }

    public get inputValue(): string {
        if (this.input_tf)
            return this.input_tf.value;
        return "";
    }

    public set inputValue(v: string) {
        this.input_tf.setText(v);
    }
}
