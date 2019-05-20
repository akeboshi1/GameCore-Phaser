import "phaser-ce";
import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../GameConfig";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {ComboBox} from "../../../base/component/combobox/ComboBox";
import {CheckButton} from "../../../base/component/button/CheckButton";
import "../../../web-rtc-service";

export class ChatView extends ModuleViewBase {
    public out_tf: Phaser.Text;
    public input_tf: PhaserInput.InputField;
    public bt: NiceSliceButton;
    public scroller: ScrollArea;
    public comobox: ComboBox;
    public labaButton: CheckButton;
    public voiceButton: CheckButton;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
    }

    protected init(): void {
        this.game.add.nineSlice(0, GameConfig.GameHeight - 200, UI.DialogBg.getName(), null, 300, 200, this);
        this.game.add.nineSlice(10, GameConfig.GameHeight - 30, UI.InputBg.getName(), null, 250, 24, this);
        this.out_tf = this.game.make.text(0, 0, "", {fontSize: 12, fill: "#fff"});
        this.input_tf = this.game.add.inputField(12, GameConfig.GameHeight - 26, {fill: "#000", font: "12px", width: 245}, this);
        this.input_tf.focusOutOnEnter = false;
        this.input_tf.blockInput = true;
        this.bt = new NiceSliceButton(this.game, 262, GameConfig.GameHeight - 30, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", 30, 24, {
            top: 7,
            bottom: 7,
            left: 7,
            right: 7
        }, "发送", 12);
        this.add(this.bt);

        const bounds = new Phaser.Rectangle(10, GameConfig.GameHeight - 190, 280, 180);
        this.scroller = new ScrollArea(this.game, bounds);
        this.scroller.add(this.out_tf);
        this.scroller.start();
        this.add(this.scroller);

        this.comobox = new ComboBox(this.game, 5, GameConfig.GameHeight - 226, this, ["世界频道", "当前场景", "小喇叭"]);

        this.labaButton = new CheckButton(this.game, 238, GameConfig.GameHeight - 232, UI.LabaBt.getName());
        this.add(this.labaButton);

        this.voiceButton = new CheckButton(this.game, 272, GameConfig.GameHeight - 232, UI.VoiceBt.getName());
        this.add(this.voiceButton);

        this.labaButton.select = false;
        this.voiceButton.select = false;
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
