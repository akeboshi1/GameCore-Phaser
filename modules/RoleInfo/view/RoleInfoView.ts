import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {ListComponent} from "../../../base/component/list/core/ListComponent";

export class RoleInfoView extends ModuleViewBase {
    public m_List: ListComponent;
    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
    }

    protected init(): void {
        this.m_List = new ListComponent(this.game);
        this.m_List.y = 2;
        this.add(this.m_List);
    }
}