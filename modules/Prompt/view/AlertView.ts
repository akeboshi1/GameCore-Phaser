import {CommWindowModuleView} from "../../../common/view/CommWindowModuleView ";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {UI} from "../../../Assets";

export class AlertView extends CommWindowModuleView {
    public static readonly OK = 1;
    public static readonly CANCEL = 2;

    public buttons: number;
    public m_Text: Phaser.Text;
    public m_OkBt: NiceSliceButton;
    public m_cancel: NiceSliceButton;
    public constructor(game: Phaser.Game) {
        super(game);
    }

    protected preInit(): void {
        this.m_Width = 280;
        this.m_Height = 160;
    }

    public onDispose(): void {
        this.m_OkBt.onChildInputUp.remove(this.onOkHandler, this);
        if (this.m_cancel) {
            this.m_cancel.onChildInputUp.remove(this.onCloseClick, this);
        }
        if (this.m_OkBt.parent) {
            this.remove(this.m_OkBt);
        }
        if (this.m_cancel.parent) {
            this.remove(this.m_cancel);
        }
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

    public setButtons(buttons: number) {
        if (buttons) {
            this.buttons = buttons;
        } else {
            this.buttons = AlertView.OK;
        }

        const btns = [];
        if ((this.buttons & AlertView.OK) === AlertView.OK) {
            this.add(this.m_OkBt);
            btns.push(this.m_OkBt);
        }
        if ((this.buttons & AlertView.CANCEL) === AlertView.CANCEL) {
            this.add(this.m_cancel);
            btns.push(this.m_cancel);
        }

        const w = (this.width) / (btns.length + 1);
        for (let i = 0; i < btns.length; i++) {
            btns[i].x = (i + 1) * w - (btns[i].width >> 1);
        }
    }

    private onOkHandler() {
        if (this.callBack) {
            let cb: Function = this.callBack;
            this.callBack = null;
            cb.apply(this.callThisObj);
            this.callThisObj = null;
        }
        this.onCloseClick();
    }

    protected init(): void {
        super.init();
        this.setTitle("提示");

        let bt_w: number = 46;
        let bt_h: number = 24;
        this.m_OkBt = new NiceSliceButton(this.game, 0, this.height - bt_h - 5, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", bt_w, bt_h, {
            top: 7,
            bottom: 7,
            left: 7,
            right: 7
        }, "确定");
        this.add(this.m_OkBt);
        this.m_OkBt.onChildInputUp.add(this.onOkHandler, this);

        this.m_cancel = new NiceSliceButton(this.game, 0, this.height - bt_h - 5, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", bt_w, bt_h, {
            top: 7,
            bottom: 7,
            left: 7,
            right: 7
        }, "取消");
        this.add(this.m_cancel);
        this.m_cancel.onChildInputUp.add(this.onCloseClick, this);

        this.m_Text = this.game.make.text(0, 25, "", {fontSize: 12, fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"} );
        this.m_Text.setTextBounds(0, 0, this.width, this.height - bt_h - 30);
        this.add(this.m_Text);
    }
}