import "phaser-ce";
import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../GameConfig";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {ComboBox, IComoboxData} from "../../../base/component/combobox/ComboBox";
import {CheckButton} from "../../../base/component/button/CheckButton";
import "../../../web-rtc-service";
import { op_client } from "pixelpai_proto";
import { ScrollBar } from "../../../base/component/scroll/ScrollBar";

export class ChatView extends ModuleViewBase {
    public out_tf: Phaser.Text;
    public input_tf: PhaserInput.InputField;
    public bt: NiceSliceButton;
    public scroller: ScrollBar;
    public comobox: ComboBox;
    public selectedChanel: ComboBox;
    public labaButton: CheckButton;
    public voiceButton: CheckButton;
    private _inputComoboxData: IComoboxData[];
    private _curInputCommoboxIndex: number;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
    }

    protected init(): void {
        this.inputEnableChildren = true;
        this.game.add.nineSlice(0, GameConfig.GameHeight - 286, UI.Background.getName(), null, 464, 281, this);
        this.game.add.nineSlice(10, GameConfig.GameHeight - 40, UI.InputBg.getName(), null, 368, 30, this);
        this.out_tf = this.game.make.text(10, 0, "", {fontSize: 14, fill: "#b3b3b3", align: "left", wordWrap: true, wordWrapWidth: 420});
        this.add(this.out_tf);
        // this.out_tf.width = 430;
        this.out_tf.events.onInputDown.add(this.test, this);
        this.onChildInputDown.add(this.test, this);

        const line = this.game.add.graphics();
        line.lineStyle(2, 0x808080);
        line.moveTo(55, GameConfig.GameHeight - 34);
        line.lineTo(55, GameConfig.GameHeight - 20);
        this.add(line);

        this.input_tf = this.game.add.inputField(66, GameConfig.GameHeight - 34, {fill: "#808080", backgroundColor: "#d6d6d6", borderColor: "#d6d6d6", fontSize: 14, width: 290}, this);
        this.input_tf.focusOutOnEnter = false;
        this.input_tf.blockInput = true;
        this.bt = new NiceSliceButton(this.game, 380, GameConfig.GameHeight - 39, UI.ButtonChat.getName(), "button_over.png", "button_out.png", "button_down.png", 60, 29, {
            top: 4,
            bottom: 4,
            left: 4,
            right: 4
        }, "发送", 12);
        this.add(this.bt);

        const bounds = new Phaser.Rectangle(0, GameConfig.GameHeight - 260, 430, 220);
        this.scroller = new ScrollBar(this.game, this.out_tf, this, bounds);
        // this.scroller = new ScrollArea(this.game, bounds);
        // this.scroller.add(this.out_tf);
        this.scroller.start();
        this.add(this.scroller);


        this._inputComoboxData = [
            { label: "世界", value: op_client.ChatChannel.World },
            { label: "场景", value: op_client.ChatChannel.CurrentScene },
        ];
        const outComobox = [...this._inputComoboxData];
        outComobox.unshift({ label: "全部", value: null });
        this.comobox = new ComboBox(this.game, 0, GameConfig.GameHeight - 280, this, outComobox, 60);
        this.selectedChanel = new ComboBox(this.game, 8, GameConfig.GameHeight - 36, this, this._inputComoboxData, 60);

        this.labaButton = new CheckButton(this.game, 338 + 50, GameConfig.GameHeight - 272 - 46, UI.LabaBt.getName());
        this.add(this.labaButton);

        this.voiceButton = new CheckButton(this.game, 372 + 50, GameConfig.GameHeight - 272 - 46, UI.VoiceBt.getName());
        this.add(this.voiceButton);

        this.labaButton.select = false;
        this.voiceButton.select = false;
    }

    private test() {
        console.log("clicked!!!");
    }

    public update() {
        super.update();
        if (this.scroller) this.scroller.update();
    }

    public appendMessage(message: string, color?: string, index?: number) {
        this.out_tf.text += message;
        if (color && index) {
            this.out_tf.addColor(color, index);
        }
    }

    public get inputValue(): string {
        if (this.input_tf)
            return this.input_tf.value;
        return "";
    }

    public set inputValue(v: string) {
        this.input_tf.setText(v);
    }

    public get outChannel(): op_client.ChatChannel {
        if (this.comobox) {
            return this.comobox.selectedItem.value;
        }
        return op_client.ChatChannel.CurrentScene;
    }

    public get inputChannel(): op_client.ChatChannel {
        if (this.selectedChanel) {
            return this.selectedChanel.selectedItem.value;
        }
        return op_client.ChatChannel.CurrentScene;
    }

    public changedChannel() {
        this.selectedChanel.switchSelectedItem();
    }

    public clearOutTf() {
        this.out_tf.text = "";
        this.out_tf.clearColors();
    }
}
