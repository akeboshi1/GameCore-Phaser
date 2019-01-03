import {CommWindowModuleView} from "../../../common/view/CommWindowModuleView ";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {BagListItem} from "./item/BagListItem";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {GameConfig} from "../../../GameConfig";

export class BagView extends CommWindowModuleView {
    private m_List: ListComponent;
    private m_Scroll: ScrollArea;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onDispose(): void {
        this.m_Scroll.stop();
        super.onDispose();
    }

    protected init(): void {
        super.init();
        const bounds = new Phaser.Rectangle(0, 0, 300, 250);
        this.m_Scroll = new ScrollArea(this.game, bounds);
        this.m_List = new ListComponent(this.game);
        let i: number = 0;
        let len: number = 10;
        let item: BagListItem;
        for (; i < len; i++) {
            item = new BagListItem(this.game);
            this.m_List.addItem(item);
        }
        this.m_Scroll.add(this.m_List);
        this.m_Scroll.start();
        this.add(this.m_Scroll);
    }
}