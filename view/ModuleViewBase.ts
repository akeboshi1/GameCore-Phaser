import {Const} from "../const/Const";
import {UI} from "../Assets";

export class ModuleViewBase extends Phaser.Group {
    protected m_CloseBt: Phaser.Button;
    protected m_Bg: Phaser.Image;
    protected m_TitleTF: Phaser.Text;

    private signals: { [name: string]: Phaser.Signal } = {};

    protected m_CloseBtPath: string;
    protected m_BgPath: string;
    protected m_Width: number;
    protected m_Height: number;
    constructor(game: Phaser.Game) {
        super(game);
        this.preInit();
        this.init();
    }

    // Event-related
    private on(name: string, callback: Function, context?: any) {
        if (!this.signals[name]) {
            this.signals[name] = new Phaser.Signal();
        }

        this.signals[name].add(callback, context || this);
    }

    private once(name: string, callback: Function, context?: any) {
        if (!this.signals[name]) {
            this.signals[name] = new Phaser.Signal();
        }

        this.signals[name].addOnce(callback, context || this);
    }

    private emit(name: string, args?: any) {
        if (!this.signals[name]) {
            this.signals[name] = new Phaser.Signal();
        }

        this.signals[name].dispatch(args);
    }

    public set closeBtPath( value: string ) {
        this.m_CloseBtPath = value;
    }

    public set bgPath( value: string ) {
        this.m_BgPath = value;
    }

    protected preInit(): void {
        this.m_Width = Const.UIConst.UI_DEFALUT_WIDTH;
        this.m_Height = Const.UIConst.UI_DEFALUT_HEIGHT;
        this.m_CloseBtPath = UI.SpriteSheetsCloseBtn.getPNG();
        this.m_BgPath = UI.ImageBg.getPNG();
    }

    protected init(): void {
        this.m_Bg = this.game.add.image(( this.m_Width - this.m_Bg.width ) >> 1, ( this.m_Height - this.m_Bg.height ) >> 1, UI.ImageBg.getName());
        this.m_CloseBt = this.game.add.button(this.m_Width - UI.SpriteSheetsCloseBtn.getFrameWidth() , 3, UI.SpriteSheetsCloseBtn.getName(), this.onCloseClick, this, 2, 1, 0);
    }

    protected onCloseClick() {

    }
}