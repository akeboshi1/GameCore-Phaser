import "phaser-ce";
import {UI} from "../../../../Assets";
import {IListItemComponent} from "../../../../base/component/list/interfaces/IListItemComponent";
import {IListItemEventListener} from "../../../../base/component/list/interfaces/IListItemEventListener";
import {SlotInfo} from "../../../../common/struct/SlotInfo";

export class AttriListItem extends Phaser.Group implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_List: IListItemEventListener;
    private bar: Phaser.Graphics;

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
    }

    protected init(): void {
        this.game.add.nineSlice(0, 0, UI.ProgressBg.getName(), null, 138, 26, this);
        this.bar = this.game.make.graphics(0, 0);
        this.addChild(this.bar);
        this.game.add.nineSlice(0, 0, UI.ProgressFill.getName(), null, 138, 26, this);
    }

    protected render(): void {
        let slot: SlotInfo = this.data;
        this.bar.clear();
        let color: any = "0x" + slot.color.substr(1);
        this.bar.beginFill(color, 0.8);
        this.bar.drawRect(2, 2, 134 , 20);
        let prec = slot.bondAttrCur / slot.bondAttrMax;
        this.bar.scale.x = prec;
    }
}