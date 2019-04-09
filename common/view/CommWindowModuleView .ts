import {Const} from "../const/Const";
import {UI} from "../../Assets";
import {ModuleViewBase} from "./ModuleViewBase";
import {GameConfig} from "../../GameConfig";

export class CommWindowModuleView extends ModuleViewBase {
    public m_CloseBt: Phaser.Button;
    public m_Bg: PhaserNineSlice.NineSlice;
    public m_Title: Phaser.Text;

    protected m_Width = 0;
    protected m_Height = 0;

    constructor(game: Phaser.Game, parent?: PIXI.DisplayObjectContainer) {
        super(game, parent);
    }

    public get width(): number {
        return this.m_Width;
    }

    public get height(): number {
        return this.m_Height;
    }

    public onResize(): void {
        this.x = (GameConfig.GameWidth - this.width) >> 1;
        this.y = (GameConfig.GameHeight - this.height) >> 1;
    }

    public onDispose(): void {
        this.m_CloseBt.events.onInputUp.remove(this.onCloseClick, this);
        this.removeAll(true);
        super.onDispose();
    }

    protected preInit(): void {
        this.m_Width = Const.UIConst.UI_DEFAULT_WIDTH;
        this.m_Height = Const.UIConst.UI_DEFAULT_HEIGHT;
    }

    public setTitle(value: string): void {
        this.m_Title.text = value;
    }

    protected init(): void {
        this.m_Bg = this.game.add.nineSlice(0, 0, UI.WindowBg.getName(), null, this.width, this.height, this);
        this.m_Title = this.game.make.text(0, 0, "", {fontSize: 12, fill: "#000", boundsAlignH: "center", boundsAlignV: "middle"});
        this.m_Title.setTextBounds(0, 0, this.width, 25);
        this.add(this.m_Title);
        this.m_CloseBt = this.game.make.button(this.width - 30, 4, UI.WindowClose.getName(), null, this
            , 1, 0 , 2);
        this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
        this.add(this.m_CloseBt);
    }

    protected onCloseClick() {
        this.emit("close");
    }
}