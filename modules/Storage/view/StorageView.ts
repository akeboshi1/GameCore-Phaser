import {CommWindowModuleView} from "../../../common/view/CommWindowModuleView ";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {StorageListItem} from "./item/StorageListItem";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {GameConfig} from "../../../GameConfig";
import {UI} from "../../../Assets";
import {StorageList} from "./StorageList";
import {Const} from "../../../common/const/Const";
import {PageComponent} from "../../../base/component/page/core/PageComponent";

export class StorageView extends CommWindowModuleView {
    public m_List: ListComponent;
    public m_BagTitle: Phaser.Image;

    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = (GameConfig.GameWidth - this.width) >> 1;
        this.y = (GameConfig.GameHeight - this.height) >> 1;
    }

    protected preInit(): void {
        this.m_Width = 180;
        this.m_Height = 205;
    }

    public onDispose(): void {
        super.onDispose();
    }

    protected init(): void {
        this.m_Bg = this.game.add.nineSlice(0, 0, UI.BagBg.getName(), null, this.width, this.height, this);

        this.m_BagTitle = this.game.make.image(12, -14,  UI.StorageTitle.getName());
        this.add(this.m_BagTitle);

        this.m_CloseBt = this.game.make.button(this.width - 30, -8, UI.WindowClose.getName(), null, this
            , 1, 0 , 2);
        this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
        this.add(this.m_CloseBt);

        this.m_List = new StorageList(this.game);
        this.m_List.x = 8;
        this.m_List.y = 32;
        this.add(this.m_List);
    }
}