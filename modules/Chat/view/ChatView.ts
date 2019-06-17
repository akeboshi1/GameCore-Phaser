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
import { Button } from "phaser-ce";

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
    private readonly _sizeList: number[] = [144, 287, 530];

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
        this.out_tf = this.game.make.text(10, 34, "", {fontSize: 14, fill: "#FFF", align: "left", wordWrap: true, wordWrapWidth: 420});
        this.add(this.out_tf);
        this.add(this._inputGroup);
        // this.out_tf.width = 430;

        const line = this.game.add.graphics();
        line.lineStyle(2, 0x808080);
        line.moveTo(55, 2);
        line.lineTo(55, 22);
        this._inputGroup.add(line);


        this.input_tf = this.game.add.inputField(66, 4, {fill: "#808080", backgroundColor: "#d6d6d6", borderColor: "#d6d6d6", fontSize: 14, width: 290}, this._inputGroup);
        this.input_tf.focusOutOnEnter = false;
        this.input_tf.blockInput = true;
        this.bt = new NiceSliceButton(this.game, 380, 0, UI.ButtonChat.getName(), "button_over.png", "button_out.png", "button_down.png", 60, 29, {
            top: 4,
            bottom: 4,
            left: 4,
            right: 4
        }, "发送", 12);
        this._inputGroup.add(this.bt);

        this._switchSize = this.game.make.button(440, 8, UI.DropDownBtn.getName(), this.onSwitchSizeHandle, this);
        this.add(this._switchSize);

        const bounds = new Phaser.Rectangle(10, 34, 430, 210);
        this.scroller = new ScrollBar(this.game, this.out_tf, this, bounds);
        this.scroller.start();

        this._inputComoboxData = [
            { label: "世界", value: op_client.ChatChannel.World },
            { label: "场景", value: op_client.ChatChannel.CurrentScene },
        ];
        const outComobox = [...this._inputComoboxData];
        outComobox.unshift({ label: "全部", value: null });
        this.comobox = new ComboBox(this.game, 0, 6, this, outComobox, 60);
        this.selectedChanel = new ComboBox(this.game, 4, 4, this._inputGroup, this._inputComoboxData, 60);

        this.labaButton = new CheckButton(this.game, 338 + 50, -28, UI.LabaBt.getName());
        this.add(this.labaButton);

        this.voiceButton = new CheckButton(this.game, 372 + 50, -28, UI.VoiceBt.getName());
        this.add(this.voiceButton);

        this.labaButton.select = true;
        this.voiceButton.select = false;

        this.x = 8;
        this.y = GameConfig.GameHeight - this.height - 15;
        this._inputGroup.y = 287 - this._inputGroup.height - 15;
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
        this.y = GameConfig.GameHeight - this._sizeList[this._curSizeIndex] - 15;
    }
}
