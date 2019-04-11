import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ILayoutItem} from "../../../../base/layout/interfaces/ILayoutItem";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {CustomWebFonts, Font, UI} from "../../../../Assets";
import {NiceSliceButton} from "../../../../base/component/button/NiceSliceButton";
import {GameConfig} from "../../../../GameConfig";
import {RoleBonesAvatar} from "../../../../common/avatar/RoleBonesAvatar";
import Globals from "../../../../Globals";
import {IObjectPool} from "../../../../base/pool/interfaces/IObjectPool";
import {Const} from "../../../../common/const/Const";
import {RoleBonesUIAvatar} from "../../../../common/avatar/RoleBonesUIAvatar";

export class VoteListItem extends ListItemComponent implements IListItemComponent {
    protected m_List: IListItemEventListener;
    protected m_Light: Phaser.Image;
    public m_Avatar: RoleBonesUIAvatar;
    protected m_Flag: Phaser.Image;
    public m_Text: Phaser.Text;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    protected init(): void {
        this.m_Light = this.game.make.image(0, 0, UI.VoteLight.getName());
        this.add(this.m_Light);
        this.m_Light.visible = false;
        this.m_Avatar = new RoleBonesUIAvatar(Globals.game);
        this.m_Avatar.anchor.set(0.5);
        this.m_Avatar.scale.set(2, 2);
        this.m_Avatar.x = this.getWidth() >> 1;
        this.m_Avatar.y = 206;
        this.add(this.m_Avatar);
        this.m_Flag = this.game.make.image(110, 60, UI.VoteFlag.getName());
        this.m_Flag.visible = false;
        this.add(this.m_Flag);
        this.m_Text = this.game.make.text(this.getWidth() >> 1, 240, "剧本角色", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFCC00"});
        this.m_Text.anchor.set(0.5);
        this.add(this.m_Text);
        super.init();
    }

    private m_Select = false;
    public setSelect(value: boolean) {
        this.m_Flag.visible = value;
        this.m_Light.visible = value;
        this.m_Select = value;
    }

    public getSelect(): boolean {
        return this.m_Select;
    }

    public render(): void {
        this.m_Avatar.loadModel(this.data.avatar);
        this.m_Text.text = this.data.name;
    }

    public onDispose() {
        this.remove(this.m_Avatar);
        this.m_Avatar.onDispose();
        this.m_Avatar = null;
        super.onDispose();
    }

    public getHeight(): number {
        return 250;
    }

    public getWidth(): number {
        return 170;
    }



}