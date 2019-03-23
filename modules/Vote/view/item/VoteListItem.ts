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
    protected m_NumTxt: Phaser.BitmapText;
    protected m_Text: Phaser.Text;
    protected m_Bt: NiceSliceButton;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    protected init(): void {
        this.m_Light = this.game.make.image(0, 0, UI.VoteLight);
        this.add(this.m_Light);
        this.m_Icon = this.game.make.image(0, 160);
        this.add(this.m_Icon);
        this.m_Flag = this.game.make.image(110, 60, UI.VoteFlag);
        this.add(this.m_Flag);
        this.m_NumTxt = this.game.make.bitmapText(128, 0, Font.NumsLatinUppercase.getName(), "", 24);
        this.add(this.m_NumTxt);
        this.m_Text = this.game.make.text(128, 0, "剧本角色");
        this.add(this.m_Text);
        this.m_Bt = new NiceSliceButton(this.game, 262, GameConfig.GameHeight - 30, UI.ButtonRed.getName(), "button_over.png", "button_out.png", "button_down.png", 30, 24, {
            top: 7,
            bottom: 7,
            left: 7,
            right: 7
        }, "投Ta");
        this.add(this.m_Bt);
        super.init();
    }

    public render(): void {
        let data: any = this.m_Data;

    }

    public setSelect(value: boolean) {
    }

    public getHeight(): number {
        return 52;
    }

    public getWidth(): number {
        return 52;
    }



}