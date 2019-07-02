import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ILayoutItem} from "../../../../base/layout/interfaces/ILayoutItem";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {UI} from "../../../../Assets";
import {DragDropIcon} from "../../../../base/component/icon/DragDropIcon";
import {Const} from "../../../../common/const/Const";
import DropType = Const.DropType;
import Globals from "../../../../Globals";
import DragType = Const.DragType;

export class BagListItem extends ListItemComponent implements IListItemComponent {
    protected m_Icon: DragDropIcon;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    public get icon(): DragDropIcon {
        return this.m_Icon;
    }

    protected init(): void {
        let bg = this.game.add.image(0, 0, UI.BagItemBg.getName(), 0);
        this.addChild(bg);
        this.m_Icon = new DragDropIcon(this.game);
        this.m_Icon.icon.anchor.set(0.5, 0.5);
        this.m_Icon.x = 26;
        this.m_Icon.y = 26;
        this.m_Icon.setDropType(DragType.DRAG_TYPE_BAG);
        this.m_Icon.setDropType(DropType.DROP_TYPE_BAG);
        this.addChild(this.m_Icon);
        super.init();
    }

    public onDispose(): void {
        super.onDispose();
    }

    public setSelect(value: boolean) {
    }

    public getHeight(): number {
        return 52;
    }

    public getWidth(): number {
        return 52;
    }

    protected render(): void {
        if (this.m_Icon && this.data && this.data.display) {
            this.m_Icon.load(this.data.display.texturePath, this);
        }
    }
}