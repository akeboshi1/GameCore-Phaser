import { CommWindowModuleView } from "../../../common/view/CommWindowModuleView ";
import { NiceSliceButton } from "../../../base/component/button/NiceSliceButton";
import { UI } from "../../../Assets";
import { op_client } from "pixelpai_proto";
import Globals from "../../../Globals";

export class MessageBoxView extends CommWindowModuleView {
  public m_Text: Phaser.Text;
  private mButtons: NiceSliceButton[];
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected preInit(): void {
    this.m_Width = 280;
    this.m_Height = 160;
}

  protected init() {
    super.init();
    this.setTitle("提示");
    // this.m_OkBt.onChildInputUp.add(this.onCloseClick, this);

    this.m_Text = this.game.make.text(0, 25, "", {fontSize: 12, fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle", wordWrap: true, wordWrapWidth: 440} );
    this.m_Text.setTextBounds(0, 0, this.width, this.height - 24 - 30);
    this.add(this.m_Text);
  }

  public setContext(context: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
    this.mButtons = [];
    // this.m_Text.setText(context.text[0].text);
    this.m_Text.setText(Globals.Tool.formatChineseString(context.text[0].text, this.m_Text.fontSize, this.m_Text.wordWrapWidth));
    const buttons = context.button;

    let bt_w: number = 46;
    let bt_h: number = 24;
    const w = (this.width) / (buttons.length + 1);
    for (let i = 0; i < buttons.length; i++) {
      const btn = new NiceSliceButton(this.game, (i + 1) * w - (bt_w >> 1) , this.height - bt_h - 5, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", bt_w, bt_h, {
          top: 7,
          bottom: 7,
          left: 7,
          right: 7
      }, buttons[i].text);
      btn.node = buttons[i].node;
      this.add(btn);
      this.mButtons.push(btn);
    }
  }

  public get buttons(): NiceSliceButton[] {
    return this.mButtons;
  }
}