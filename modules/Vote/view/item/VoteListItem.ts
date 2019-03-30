import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ILayoutItem} from "../../../../base/layout/interfaces/ILayoutItem";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {Font, UI} from "../../../../Assets";
import {NiceSliceButton} from "../../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../../GameConfig";

export class VoteListItem extends ListItemComponent implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_List: IListItemEventListener;
    protected m_Light: Phaser.Image;
    protected m_Icon: Phaser.Image;
    protected m_Flag: Phaser.Image;
    public m_Text: Phaser.Text;
    protected m_Bt: NiceSliceButton;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    protected init(): void {
        this.m_Light = this.game.make.image(0, 0, UI.VoteLight.getName());
        this.add(this.m_Light);
        this.m_Light.visible = false;
        this.m_Icon = this.game.make.image(0, 160);
        this.add(this.m_Icon);
        this.m_Flag = this.game.make.image(110, 60, UI.VoteFlag.getName());
        this.m_Flag.visible = false;
        this.add(this.m_Flag);
        this.m_Text = this.game.make.text(20, 230, "剧本角色", {fontSize: 24, fill: "#FFCC00", boundsAlignH: "center", boundsAlignV: "middle"});
        this.add(this.m_Text);
        super.init();
    }

    public setSelect(value: boolean) {
        this.m_Flag.visible = value;
        this.m_Light.visible = value;
    }

    public getHeight(): number {
        return 185;
    }

    public getWidth(): number {
        return 185;
    }



}