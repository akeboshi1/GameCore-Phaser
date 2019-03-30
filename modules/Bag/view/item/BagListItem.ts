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
        this.game.add.image(0, 0, UI.BagItemBg.getName(), 0, this);
        this.m_Icon = new DragDropIcon(this.game);
        this.m_Icon.setDropType(DragType.DRAG_TYPE_BAG);
        this.m_Icon.setDropType(DropType.DROP_TYPE_BAG);
        this.add(this.m_Icon);
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
        if (this.m_Icon) {
            this.m_Icon.loadModel({
                animations: this.data.animations,
                display: this.data.display
            }, this, null, this.onLoadComplete);
        }
    }

    protected onLoadComplete(): void {
        if (this.m_Icon) {
            this.m_Icon.playAnimation(this.data.animationName);
        }
    }
}