import "phaser-ce";
import {Font, UI} from "../../../../Assets";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {DragIcon} from "../../../../base/component/icon/DragIcon";

export class ShortcutMenuListItem extends ListItemComponent {
    protected m_List: IListItemEventListener;
    protected m_Icon: DragIcon;
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

    public get icon(): DragIcon {
        return this.m_Icon;
    }

    protected init(): void {
        this.game.add.image(0, 0, UI.ShortcutItemBg.getName(), 0, this);
        this.m_Icon = new DragIcon(this.game);
        this.add(this.m_Icon);
        this.game.add.image(0, 0, UI.ShortcutItemIcon.getName(), 0, this);
        this.m_ShortcutTxt = this.game.add.bitmapText(4, 2, Font.NumsLatinUppercase.getName(), "", 12, this);
        super.init();
    }

    protected addEvent(): void {
        this.onChildInputDown.add(this.handleChildDown, this);
    }

    protected removeEvent(): void {
        this.onChildInputDown.remove(this.handleChildDown, this);
    }

    protected handleChildDown(): void {
        if (this.m_List) {
            this.m_List.onTriggerDown(this);
        }
    }

    protected onLoadComplete(): void {
        if (this.m_Icon) {
            this.m_Icon.playAnimation(this.data.animationName);
        }
    }

    protected render(): void {
        if (this.m_Icon) {
            this.m_Icon.loadModel({
                animations: this.data.animations,
                display: this.data.display
            }, this, null, this.onLoadComplete);
        }
    }
}