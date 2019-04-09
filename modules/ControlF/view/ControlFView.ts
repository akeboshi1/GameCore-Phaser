import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {CustomWebFonts, UI} from "../../../Assets";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../GameConfig";
import Globals from "../../../Globals";

export class ControlFView extends ModuleViewBase {
    public m_Bg: PhaserNineSlice.NineSlice;
    public m_Text: Phaser.Text;
    public m_Bg1: PhaserNineSlice.NineSlice;
    public m_Text1: Phaser.Text;
    public bt: NiceSliceButton;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = Globals.DataCenter.PlayerData.mainPlayerInfo.x - 120;
        this.y = Globals.DataCenter.PlayerData.mainPlayerInfo.y;
    }

    protected init(): void {
        this.m_Bg = this.game.add.nineSlice(26, 0, UI.BagBg.getName(), null, 120, 36, this);
        this.add(this.m_Bg);

        this.m_Text = this.game.make.text(38, 4, "", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"});
        this.add(this.m_Text);

        this.m_Bg1 = this.game.add.nineSlice(0, 42, UI.BagBg.getName(), null, 232, 64, this);
        this.add(this.m_Bg1);

        this.m_Text1 = this.game.make.text(8, 46, "", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff", wordWrap: true, wordWrapWidth: 220});
        this.add(this.m_Text1);

        this.bt = new NiceSliceButton(this.game, 0, 0, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", 36, 36, {
            top: 7,
            bottom: 7,
            left: 7,
            right: 7
        }, "F", 24);
        this.add(this.bt);
    }

    public setName(value: string): void {
        this.m_Text.text = value;
    }

    public setDesc(value: string): void {
        this.m_Text1.text = value;
        Globals.Tool.formatChinese(this.m_Text1, 228);
    }
}
