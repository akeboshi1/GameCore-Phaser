import "phaser-ce";
import {Font, Load, UI} from "../../../../Assets";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {op_gameconfig} from "../../../../../protocol/protocols";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import IItem = op_gameconfig.IItem;

export class ShortcutMenuListItem extends ListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_List: IListItemEventListener;
    protected m_Icon: Phaser.Image;
    protected m_ShortcutTxt: Phaser.BitmapText;

    public getHeight(): number {
        return 61;
    }

    public getWidth(): number {
        return 56;
    }

    protected init(): void {
        this.game.add.image(0, 0, UI.ShortcutItemBg.getName(), 0, this);
        this.m_Icon = this.game.add.image(2, 2, null, 0, this);
        this.game.add.image(0, 0, UI.ShortcutItemIcon.getName(), 0, this);
        this.m_ShortcutTxt = this.game.add.bitmapText(4, 2, Font.NumsLatinUppercase.getName(), "", 12, this);
        super.init();
    }

    public setShortCut(value: string): void {
        this.m_ShortcutTxt.text = value;
    }

    public setIcon(value: IItem): void {
        this.m_Icon.loadTexture(value.display.texturePath);
    }

    protected render(): void {
        let item: op_gameconfig.IItem = this.data;
        if (item && item.display) {
            this.m_Icon.loadTexture(Load.Image.getKey(item.display.texturePath));
        }
    }
}