import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ILayoutItem} from "../../../../base/layout/interfaces/ILayoutItem";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {Font, UI} from "../../../../Assets";
import {NiceSliceButton} from "../../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../../GameConfig";
import {RoleBonesAvatar} from "../../../../common/avatar/RoleBonesAvatar";
import Globals from "../../../../Globals";
import {IObjectPool} from "../../../../base/pool/interfaces/IObjectPool";

export class VoteListItem extends ListItemComponent implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_List: IListItemEventListener;
    protected m_Light: Phaser.Image;
    public m_Avatar: RoleBonesAvatar;
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
        this.m_Avatar = this.displayPool.alloc() as RoleBonesAvatar;
        if (null == this.m_Avatar) {
            this.m_Avatar = new RoleBonesAvatar(Globals.game);
        }
        this.add(this.m_Avatar);
        this.m_Flag = this.game.make.image(110, 60, UI.VoteFlag.getName());
        this.m_Flag.visible = false;
        this.add(this.m_Flag);
        this.m_Text = this.game.make.text(20, 230, "剧本角色", {fontSize: 24, fill: "#FFCC00", boundsAlignH: "center", boundsAlignV: "middle"});
        this.add(this.m_Text);
        super.init();
    }

    protected get displayPool(): IObjectPool {
        let op = Globals.ObjectPoolManager.getObjectPool("RoleBonesAvatar");
        return op;
    }

    public setSelect(value: boolean) {
        this.m_Flag.visible = value;
        this.m_Light.visible = value;
    }

    public render(): void {
        this.m_Avatar.loadModel(this.data.avatar);
        this.m_Text.text = this.data.name;
    }

    public getHeight(): number {
        return 185;
    }

    public getWidth(): number {
        return 185;
    }



}