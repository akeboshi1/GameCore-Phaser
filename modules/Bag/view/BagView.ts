import {CommWindowModuleView} from "../../../common/view/CommWindowModuleView ";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {BagListItem} from "./item/BagListItem";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {GameConfig} from "../../../GameConfig";
import {UI} from "../../../Assets";
import {BagList} from "./BagList";
import {Const} from "../../../common/const/Const";
import {PageComponent} from "../../../base/component/page/core/PageComponent";

export class BagView extends CommWindowModuleView {
    public m_List: ListComponent;
    public m_BagTitle: Phaser.Image;
    public m_Page: PageComponent;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = (GameConfig.GameWidth - this.width) >> 1;
        this.y = GameConfig.GameHeight - 278;
    }

    protected preInit(): void {
        this.m_Width = 693;
        this.m_Height = 208;
    }

    public onDispose(): void {
        super.onDispose();
    }

    protected init(): void {
        this.m_Bg = this.game.add.nineSlice(0, 0, UI.BagBg.getName(), null, this.width, this.height, this);

        this.m_BagTitle = this.game.make.image(12, -14,  UI.BagTitle.getName());
        this.add(this.m_BagTitle);

        this.m_CloseBt = this.game.make.button(this.width - 30, -8, UI.WindowClose.getName(), null, this
            , 1, 0 , 2);
        this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
        this.add(this.m_CloseBt);

        this.m_List = new BagList(this.game);
        this.m_List.x = 8;
        this.m_List.y = 32;
        this.add(this.m_List);

        this.m_Page = new PageComponent(this.game, {
            LeftBtnX: -36,
            LeftBtnY: 96,
            RightBtnX: 732,
            RightBtnY: 96});
        this.add(this.m_Page);
    }
}