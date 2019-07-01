import "phaser-ce";
import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI, CustomWebFonts} from "../../../Assets";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../GameConfig";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {ComboBox, IComoboxData} from "../../../base/component/combobox/ComboBox";
import {CheckButton} from "../../../base/component/button/CheckButton";
import "../../../web-rtc-service";
import { op_client, op_def } from "pixelpai_proto";
import { ScrollBar } from "../../../base/component/scroll/ScrollBar";
import { Button } from "phaser-ce";
import Globals from "../../../Globals";

export class ChatView extends ModuleViewBase {
    private _background: PhaserNineSlice.NineSlice;
    private _inputBackground: PhaserNineSlice.NineSlice;
    public out_tf: Phaser.Text;
    public input_tf: PhaserInput.InputField;
    public bt: NiceSliceButton;
    public scroller: ScrollBar;
    public comobox: ComboBox;
    public selectedChanel: ComboBox;
    public labaButton: CheckButton;
    public voiceButton: CheckButton;
    private _inputComoboxData: IComoboxData[];
    private _switchSize: Button;
    private _inputGroup: Phaser.Group;
    private _curSizeIndex = 1;
    private readonly _sizeList: number[] = [530, 287, 144];

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
    }

    protected init(): void {
        this.inputEnableChildren = true;
        this._inputGroup = this.game.make.group();
        this._background = this.game.add.nineSlice(0, 0, UI.Background.getName(), null, 464, 287, this);
        this._inputBackground = this.game.add.nineSlice(0, 0, UI.InputBg.getName(), null, 368, 29, this._inputGroup);
        this.out_tf = this.game.make.text(10, 34, "", {font: "15px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFFFFF", align: "left", wordWrap: true, wordWrapWidth: 450});
        this.out_tf.stroke = "#000000";
        this.out_tf.strokeThickness = 1;
        this.add(this.out_tf);
        this.add(this._inputGroup);
        // this.out_tf.width = 430;

        const line = this.game.add.graphics();
        line.lineStyle(2, 0x808080);
        line.moveTo(55, 3);
        line.lineTo(55, 23);
        this._inputGroup.add(line);

        this.input_tf = this.game.add.inputField(66, 5, {font: "15px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#808080", backgroundColor: "#dfdfdf", borderColor: "#dfdfdf", fontSize: 14, width: 290}, this._inputGroup);
        this.input_tf.focusOutOnEnter = false;
        this.input_tf.blockInput = true;
        this.bt = new NiceSliceButton(this.game, 380, 0, UI.ButtonChat.getName(), "button_over.png", "button_out.png", "button_down.png", 60, 29, {
            top: 4,
            bottom: 4,
            left: 4,
            right: 4
        }, "发送", 14);
        this.bt.setLabelOffset(0, 3);
        this._inputGroup.add(this.bt);

        this._switchSize = this.game.make.button(440, 8, UI.DropDownBtn.getName(), this.onSwitchSizeHandle, this);
        this.add(this._switchSize);

        const bounds = new Phaser.Rectangle(10, 34, 430, 210);
        this.scroller = new ScrollBar(this.game, this.out_tf, this, bounds);
        this.scroller.start();

        this._inputComoboxData = [
            { label: "世界", value: op_def.ChatChannel.World },
            { label: "场景", value: op_def.ChatChannel.CurrentScene },
        ];
        const outComobox = [...this._inputComoboxData];
        outComobox.unshift({ label: "全部", value: null });
        this.comobox = new ComboBox(this.game, 0, 6, this, outComobox, 60);
        this.comobox.setLabelStyle({font: "15px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#b3b3b3", boundsAlignH: "center", boundsAlignV: "middle"});
        this.selectedChanel = new ComboBox(this.game, 4, 4, this._inputGroup, this._inputComoboxData, 60);
        this.selectedChanel.setLabelStyle({font: "15px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#808080", boundsAlignH: "center", boundsAlignV: "middle"});
        this.selectedChanel.setSelectedData(this._inputComoboxData[1]);

        this.labaButton = new CheckButton(this.game, 338 + 50, -34, UI.LabaBt.getName());
        this.add(this.labaButton);

        this.voiceButton = new CheckButton(this.game, 372 + 50, -34, UI.VoiceBt.getName());
        this.voiceButton.inputEnabled = false;
        this.voiceButton.removeInput();
        this.add(this.voiceButton);

        this.labaButton.select = true;
        this.voiceButton.select = false;

        this._inputGroup.x = 6;
        this._inputGroup.y = 287 - 29 - 6;
        this.x = 8;
        this.y = GameConfig.GameHeight - 287 - 9;

        this.onChildInputOver.add(this.inputOverHanlder, this);

        this.onChildInputOut.add(this.inputOutHandler, this);
    }

    public update() {
        super.update();
        if (this.scroller) this.scroller.update();
    }

    public appendMessage(message: string, color?: string, index?: number) {
        this.out_tf.text += message;
        if (color) {
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

    public get outChannel(): op_def.ChatChannel {
        if (this.comobox) {
            return this.comobox.selectedItem.value;
        }
        return op_def.ChatChannel.CurrentScene;
    }

    public get inputChannel(): op_def.ChatChannel {
        if (this.selectedChanel) {
            return this.selectedChanel.selectedItem.value;
        }
        return op_def.ChatChannel.CurrentScene;
    }

    public changedChannel() {
        this.selectedChanel.switchSelectedItem();
    }

    public clearOutTf() {
        this.out_tf.text = "";
        this.out_tf.clearColors();
    }

    public onSwitchSizeHandle() {
        this._curSizeIndex++;
        if (this._curSizeIndex >= this._sizeList.length) {
            this._curSizeIndex = 0;
        }
        this.resize();
    }

    private resize() {
        if (this._background) {
            this._background.destroy();
            this.remove(this._background);
        }
        if (this._inputBackground) {
            this._inputBackground.destroy();
            this.remove(this._inputBackground);
        }
        this._background = this.game.make.nineSlice(0, 0, UI.Background.getName(), null, 464, this._sizeList[this._curSizeIndex]);
        this.addAt(this._background, 0);
        this._inputBackground = this.game.make.nineSlice(0, 0, UI.InputBg.getName(), null, 368, 29);
        this._inputGroup.addAt(this._inputBackground, 0);

        this.scroller.resize(new Phaser.Rectangle(10, 34, 430, this._sizeList[this._curSizeIndex] - 77));

        this._inputGroup.y = this._sizeList[this._curSizeIndex] - this._inputGroup.height - 15;

        this.x = 8;
        this.y = GameConfig.GameHeight - this._sizeList[this._curSizeIndex] - 9;
    }

    private inputOverHanlder() {
        this.scroller.start();
    }

    private inputOutHandler(target, pointer) {
        const curHeight = this._sizeList[this._curSizeIndex];
        if ((pointer.x > this.x + this.width || pointer.x < this.x) ||
            (pointer.y > this.y + curHeight || pointer.y < this.y)) {
            this.scroller.stop();
        }
    }
}
