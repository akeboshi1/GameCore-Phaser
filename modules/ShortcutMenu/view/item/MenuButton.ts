import {Font, UI} from "../../../../Assets";
import {IDisposeObject} from "../../../../base/object/interfaces/IDisposeObject";

export class MenuButton extends Phaser.Sprite implements IDisposeObject {
    public m_bg: Phaser.Image;
    public m_over: Phaser.Image;
    public m_icon: Phaser.Image;
    public m_ShortcutTxt: Phaser.BitmapText;
    public m_ShortcutItemIcon: Phaser.Image;
    constructor(game: Phaser.Game) {
        super(game, 0, 0);
        this.init();
    }

    protected init(): void {
        this.m_bg = this.game.make.image(0, 0);
        this.addChild(this.m_bg);
        this.m_over = this.game.make.image(0, 0,  UI.MenuItemOver.getName());
        this.m_over.visible = false;
        this.addChild(this.m_over);
        this.m_icon = this.game.make.image(4, 4);
        this.addChild(this.m_icon);
        this.m_ShortcutItemIcon = this.game.add.image(0, 0, UI.ShortcutItemIcon.getName());
        this.addChild(this.m_ShortcutItemIcon);
        this.m_ShortcutTxt = this.game.add.bitmapText(4, 2, Font.NumsLatinUppercase.getName(), "B", 12);
        this.addChild(this.m_ShortcutTxt);
        this.events.onInputOver.add(this.onMouseOver, this);
    }

    public onMouseOver(): void {
        this.m_over.visible = true;
        this.events.onInputOut.addOnce(this.onMouseOut, this);
    }

    public onMouseOut(): void {
        this.m_over.visible = false;
    }

    public setData(bg: string, icon: string): void {
        this.m_bg.loadTexture(bg);
        this.m_icon.loadTexture(icon);
    }

    public onClear(): void {
    }

    public onDispose(): void {
        this.events.onInputOver.remove(this.onMouseOver, this);
        this.events.onInputOut.remove(this.onMouseOut, this);
    }
}