import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {ILayoutItem} from "../../../../base/layout/interfaces/ILayoutItem";

export class BagListItem extends Phaser.Group implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_Text: Phaser.Text;
    protected m_List: IListItemEventListener;

    constructor( game: Phaser.Game ) {
        super(game);
    }

    protected init(): void {
        this.m_Text =  this.game.make.text(24, 24, "[" + this.index + "] this text is fixed", { font: "32px Arial", fill: "#ffffff", align: "center" });
        this.add(this.m_Text);
    }

    public set data( value: any ) {
        this.m_Data = value;
    }

    public get data(): any {
        return this.m_Data;
    }

    public set index( value: number ) {
        this.m_Index = value;
    }

    public get index(): number {
        return this.m_Index;
    }

    public getView(): any {
        return this;
    }

    public onDispose() {
        this.removeAll( true );
    }

    public setEnable(value: boolean) {
    }

    public setEventListener(listener: IListItemEventListener) {
        this.m_List = listener;
    }

    public setSelect(value: boolean) {
        this.m_Text.addStrokeColor( value ? "#FF0000" : null , 0);
    }

    public getHeight(): number {
        return 50;
    }

    public getWidth(): number {
        return 500;
    }

    public setPosX(value: number) {
        this.x = value;
    }

    public setPosY(value: number) {
        this.y = value;
    }

    public onAdded(): void {
        this.init();
    }

}