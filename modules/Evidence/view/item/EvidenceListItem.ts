import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {UI} from "../../../../Assets";

export class EvidenceListItem extends ListItemComponent implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_List: IListItemEventListener;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    protected init(): void {
        let bg = this.game.add.image(0, 0, UI.BagItemBg.getName(), 0);
        this.addChild(bg);
        super.init();
    }

    public setSelect(value: boolean) {
    }

    public getHeight(): number {
        return 52;
    }

    public getWidth(): number {
        return 52;
    }



}