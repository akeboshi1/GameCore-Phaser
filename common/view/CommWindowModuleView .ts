import {Const} from "../const/Const";
import {UI} from "../../Assets";
import {ModuleViewBase} from "./ModuleViewBase";

export class CommWindowModuleView extends ModuleViewBase {
    protected m_CloseBt: Phaser.Button;
    protected m_Bg: Phaser.Image;
    protected m_BgGrap: Phaser.Graphics;
    protected m_TitleTF: Phaser.Text;

    protected m_CloseBtPath: string;
    protected m_BgPath: string;
    protected m_Width: number;
    protected m_Height: number;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public set closeBtPath(value: string) {
        this.m_CloseBtPath = value;
    }

    public set bgPath(value: string) {
        this.m_BgPath = value;
    }

    public get width(): number {
        return this.m_Width;
    }

    public get height(): number {
        return this.m_Height;
    }

    public onResize(): void {
        this.x = (this.game.width - this.width) >> 1;
        this.y = (this.game.height - this.height) >> 1;
    }

    public onDispose(): void {
        this.m_CloseBt.onInputDown.remove(this.onCloseClick, this);
        this.removeAll(true);
        super.onDispose();
    }

    protected preInit(): void {
        this.m_Width = Const.UIConst.UI_DEFAULT_WIDTH;
        this.m_Height = Const.UIConst.UI_DEFAULT_HEIGHT;
        this.m_CloseBtPath = UI.SpriteSheetsCloseBtn.getPNG();
        this.m_BgPath = UI.ImageBg.getPNG();
    }

    protected init(): void {
        this.m_BgGrap = this.game.make.graphics(0, 0);
        this.m_BgGrap.clear();
        this.m_BgGrap.lineStyle(2, 0xff0000, 1);
        this.m_BgGrap.beginFill(0x00ff00);
        this.m_BgGrap.drawRect(0, 0, this.width, this.height);
        this.m_BgGrap.endFill();
        this.add(this.m_BgGrap);
        this.m_CloseBt = this.game.make.button(this.m_Width - UI.SpriteSheetsCloseBtn.getFrameWidth() / 2, -UI.SpriteSheetsCloseBtn.getFrameHeight() / 2, UI.SpriteSheetsCloseBtn.getName(), null, null, 2, 1, 0);
        this.m_CloseBt.onInputDown.add(this.onCloseClick, this);
        this.add(this.m_CloseBt);
    }

    protected onCloseClick() {
        this.emit("close");
    }
}