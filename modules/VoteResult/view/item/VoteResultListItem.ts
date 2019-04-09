import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ILayoutItem} from "../../../../base/layout/interfaces/ILayoutItem";
import {ListItemComponent} from "../../../../base/component/list/core/ListItemComponent";
import {CustomWebFonts, Font, UI} from "../../../../Assets";
import {GameConfig} from "../../../../GameConfig";
import {RoleBonesUIAvatar} from "../../../../common/avatar/RoleBonesUIAvatar";
import Globals from "../../../../Globals";
import {IObjectPool} from "../../../../base/pool/interfaces/IObjectPool";

export class VoteResultListItem extends ListItemComponent implements IListItemComponent {
    protected m_List: IListItemEventListener;
    protected m_Light: Phaser.Image;
    public m_Avatar: RoleBonesUIAvatar;
    protected m_Flag: Phaser.Image;
    public m_NumTxt: Phaser.Text;
    public m_Text: Phaser.Text;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    protected init(): void {
        this.m_Light = this.game.make.image(0, 0, UI.VoteLight.getName());
        this.add(this.m_Light);
        this.m_Light.visible = false;

        this.m_Avatar = this.displayPool.alloc() as RoleBonesUIAvatar;
        if (null == this.m_Avatar) {
            this.m_Avatar = new RoleBonesUIAvatar(Globals.game);
        }
        this.m_Avatar.anchor.set(0.5);
        this.m_Avatar.scale.set(2, 2);
        this.m_Avatar.x = this.getWidth() >> 1;
        this.m_Avatar.y = 206;
        this.add(this.m_Avatar);

        this.m_Flag = this.game.make.image(30, 30, UI.KillerFlag.getName());
        this.add(this.m_Flag);
        this.m_Flag.visible = false;

        this.m_NumTxt = this.game.make.text(0, 190, "", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFF"});
        this.add(this.m_NumTxt);
        this.m_Text = this.game.make.text(this.getWidth() >> 1, 240, "剧本角色", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFCC00"});
        this.m_Text.anchor.set(0.5);
        this.add(this.m_Text);

        super.init();
    }

    protected get displayPool(): IObjectPool {
        let op = Globals.ObjectPoolManager.getObjectPool("RoleBonesUIAvatar");
        return op;
    }

    public render(): void {
        this.setSelect(this.data.camp === "真凶");
        this.m_Avatar.loadModel(this.data.avatar);
        this.m_Text.text = this.data.name;
    }

    public setSelect(value: boolean) {
        this.m_Flag.visible = value;
        this.m_Light.visible = value;
    }

    public getHeight(): number {
        return 250;
    }

    public getWidth(): number {
        return 170;
    }

    public onDispose() {
        this.m_Avatar.onClear();
        super.onDispose();
    }
}