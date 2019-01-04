import {CommWindowModuleView} from "../../../common/view/CommWindowModuleView ";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {UI} from "../../../Assets";

export class AlertView extends CommWindowModuleView {
    public m_Text: Phaser.Text;
    public m_OkBt: NiceSliceButton;
    public constructor(game: Phaser.Game) {
        super(game);
    }

    protected preInit(): void {
        this.m_Width = 280;
        this.m_Height = 160;
    }

    public onDispose(): void {
        this.m_OkBt.events.onInputUp.remove(this.onCloseClick, this);
        this.callBack = null;
        this.callThisObj = null;
        super.onDispose();
    }

    private callBack: Function;
    private callThisObj: any;
    public setCallBack(value: Function, context?: any): void {
        this.callBack = value;
        this.callThisObj = context;
    }

    protected onCloseClick() {
        if (this.callBack) {
            let cb: Function = this.callBack;
            this.callBack = null;
            cb.apply(this.callThisObj);
            this.callThisObj = null;
        }
        super.onCloseClick();
    }

    protected init(): void {
        super.init();
        this.setTitle("提示");

        let bt_w: number = 46;
        let bt_h: number = 24;
        this.m_OkBt = new NiceSliceButton(this.game, (this.width - bt_w) >> 1, this.height - bt_h - 5, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", bt_w, bt_h, {
            top: 7,
            bottom: 7,
            left: 7,
            right: 7
        }, "确定");
        this.add(this.m_OkBt);
        this.m_OkBt.events.onInputUp.add(this.onCloseClick, this);

        this.m_Text = this.game.make.text(0, 25, "", {fontSize: 12, fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"} );
        this.m_Text.setTextBounds(0, 0, this.width, this.height - bt_h - 30);
        this.add(this.m_Text);
    }
}