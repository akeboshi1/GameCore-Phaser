import "phaser-ce";
import {Load, UI} from "../../../../Assets";
import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {op_gameconfig} from "../../../../../protocol/protocols";

export class ShortcutMenuListItem extends Phaser.Group implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_List: IListItemEventListener;
    protected m_Icon: Phaser.Image;
    protected m_ShortcutTxt: Phaser.Text;

    constructor(game) {
        super(game);
        this.init();
    }

    public get data(): any {
        return this.m_Data;
    }

    public set data(value: any) {
        this.m_Data = value;
        this.render();
    }

    public get index(): number {
        return this.m_Index;
    }

    public set index(value: number) {
        this.m_Index = value;
    }

    public getView(): any {
        return this;
    }

    public onDispose() {
        this.removeAll(true);
    }

    public setEnable(value: boolean) {
    }

    public setEventListener(listener: IListItemEventListener) {
        this.m_List = listener;
    }

    public setSelect(value: boolean) {
    }

    public getHeight(): number {
        return 61;
    }

    public getWidth(): number {
        return 56;
    }

    public setPosX(value: number) {
        this.x = value;
    }

    public setPosY(value: number) {
        this.y = value;
    }

    public onAdded(): void {
    }

    protected init(): void {
        this.game.add.image(0, 0, UI.ItemBg.getName(), 0, this);
        this.m_Icon = this.game.add.image(0, 0, null, 0, this);
        this.game.add.image(0, 0, UI.ItemShortcutBg.getName(), 0, this);
        this.m_ShortcutTxt = this.game.add.text(23, 40, "", {fill: "#FFF", font: "18px"}, this);
    }

    public setShortCut(value: string): void {
        this.m_ShortcutTxt.text = value;
    }

    protected render(): void {
        let item: op_gameconfig.IItem = this.data;
        if (item && item.display) {
            this.m_Icon.loadTexture(Load.Image.getKey(item.display.texturePath));
        }
    }
}