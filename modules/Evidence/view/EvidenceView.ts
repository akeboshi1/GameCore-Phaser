import {CommWindowModuleView} from "../../../common/view/CommWindowModuleView ";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {EvidenceListItem} from "./item/EvidenceListItem";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {GameConfig} from "../../../GameConfig";
import {UI} from "../../../Assets";
import {EvidenceList} from "./EvidenceList";
import {Const} from "../../../common/const/Const";

export class EvidenceView extends CommWindowModuleView {
    private m_List: ListComponent;
    public m_EvidenceTitle: Phaser.Image;

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

        this.m_EvidenceTitle = this.game.make.image(12, -14,  UI.EvidenceTitle.getName());
        this.add(this.m_EvidenceTitle);

        this.m_CloseBt = this.game.make.button(this.width - 30, -8, UI.WindowClose.getName(), null, this
            , 1, 0 , 2);
        this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
        this.add(this.m_CloseBt);

        this.m_List = new EvidenceList(this.game);
        this.m_List.x = 8;
        this.m_List.y = 32;
        let i: number = 0;
        let len: number = 36;
        let item: EvidenceListItem;
        for (; i < len; i++) {
            item = new EvidenceListItem(this.game);
            this.m_List.addItem(item);
        }
        this.add(this.m_List);
    }
}