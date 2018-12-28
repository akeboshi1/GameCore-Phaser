import {ModuleViewBase} from "../../../common/view/ModuleViewBase";
import {UI} from "../../../Assets";
import {ListComponent} from "../../../base/component/list/core/ListComponent";

export class RoleInfoView extends ModuleViewBase {
    public m_List: ListComponent;
    constructor(game: Phaser.Game) {
        super(game);
    }

    public onResize(): void {
        this.x = this.game.camera.x;
        this.y = this.game.camera.y;
    }

    protected init(): void {
        this.m_List = new ListComponent(this.game);
        this.add(this.m_List);
    }
}