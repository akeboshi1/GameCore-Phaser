import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ILayoutItem} from "../../../../base/layout/interfaces/ILayoutItem";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";

export class BagListItem extends ListItemComponent implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_Text: Phaser.Text;
    protected m_List: IListItemEventListener;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    protected init(): void {
        this.m_Text =  this.game.make.text(24, 24, "[" + this.index + "] this text is fixed", { font: "32px Arial", fill: "#ffffff", align: "center" });
        this.add(this.m_Text);
        super.init();
    }

    public setSelect(value: boolean) {
        this.m_Text.addStrokeColor( value ? "#FF0000" : null , 0);
    }

    public getHeight(): number {
        return 50;
    }

    public getWidth(): number {
        return 500;
    }



}