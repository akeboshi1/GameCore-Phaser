import { CommWindowModuleView } from "../../../common/view/CommWindowModuleView ";
import { NiceSliceButton } from "../../../base/component/button/NiceSliceButton";
import { UI } from "../../../Assets";
import { op_client } from "pixelpai_proto";

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
    super.init();
    this.setTitle("提示");
    // this.m_OkBt.onChildInputUp.add(this.onCloseClick, this);

    this.m_Text = this.game.make.text(0, 25, "", {fontSize: 12, fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"} );
    this.m_Text.setTextBounds(0, 0, this.width, this.height - 24 - 30);
    this.add(this.m_Text);
  }

  public setContext(context: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
    this.mButtons = [];
    this.m_Text.setText(context.text[0].text);
    const buttons = context.button;

    let bt_w: number = 46;
    let bt_h: number = 24;
    for (const button of buttons) {
      const btn = new NiceSliceButton(this.game, (this.width - bt_w) >> 1, this.height - bt_h - 5, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", bt_w, bt_h, {
          top: 7,
          bottom: 7,
          left: 7,
          right: 7
      }, button.text);
      btn.node = btn.node;
      this.add(btn);
      this.mButtons.push(btn);
    }
  }

  public get buttons(): NiceSliceButton[] {
    return this.mButtons;
  }
}