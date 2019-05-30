import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {UI} from "../../../../Assets";
import {BaseIcon} from "../../../../base/component/icon/BaseIcon";

export class StorageListItem extends ListItemComponent implements IListItemComponent {
    protected m_Icon: BaseIcon;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    public get icon(): BaseIcon {
        return this.m_Icon;
    }

    protected init(): void {
        let bg = this.game.add.image(0, 0, UI.BagItemBg.getName(), 0);
        this.addChild(bg);
        this.m_Icon = new BaseIcon(this.game);
        this.m_Icon.icon.anchor.set(0.5, 0.5);
        this.m_Icon.x = 26;
        this.m_Icon.y = 26;
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
        if (this.m_Icon) {
            this.m_Icon.load(this.data.display.texturePath, this);
        }
    }
}