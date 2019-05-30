import "phaser-ce";
import {Font, UI} from "../../../../Assets";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {DragDropIcon} from "../../../../base/component/icon/DragDropIcon";
import {Const} from "../../../../common/const/Const";
import DragType = Const.DragType;
import DropType = Const.DropType;

export class ShortcutMenuListItem extends ListItemComponent {
    protected m_Icon: DragDropIcon;
    protected m_ShortcutTxt: Phaser.BitmapText;

    public getHeight(): number {
        return 61;
    }

    public getWidth(): number {
        return 56;
    }

    public setShortCut(value: string): void {
        this.m_ShortcutTxt.text = value;
    }

    public get icon(): DragDropIcon {
        return this.m_Icon;
    }

    protected init(): void {
        let bg = this.game.add.image(0, 0, UI.ShortcutItemBg.getName(), 0);
        this.addChild(bg);
        this.m_Icon = new DragDropIcon(this.game);
        this.m_Icon.icon.anchor.set(0.5, 0.5);
        this.m_Icon.setDropType(DragType.DRAG_TYPE_SHORTCUT);
        this.m_Icon.setDropType(DropType.DROP_TYPE_SHORTCUT);
        this.m_Icon.x = 28;
        this.m_Icon.y = 30.5;
        this.addChild(this.m_Icon);
        let icon = this.game.add.image(0, 0, UI.ShortcutItemIcon.getName(), 0);
        this.addChild(icon);
        this.m_ShortcutTxt = this.game.add.bitmapText(4, 2, Font.NumsLatinUppercase.getName(), "", 12);
        this.addChild(this.m_ShortcutTxt);
        super.init();
    }

    protected render(): void {
        if (this.m_Icon) {
            this.m_Icon.load(this.data.display.texturePath);
        }
    }
}