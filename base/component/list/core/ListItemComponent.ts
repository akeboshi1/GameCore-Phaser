import {IListItemComponent} from "../interfaces/IListItemComponent";
import {IListItemEventListener} from "../interfaces/IListItemEventListener";

export class ListItemComponent extends Phaser.Group implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_List: IListItemEventListener;
    protected m_Init = false;

    constructor(game) {
        super(game);
    }

    public get data(): any {
        return this.m_Data;
    }

    public set data(value: any) {
        this.m_Data = value;
        if (this.m_Init) {
            this.render();
        }
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

    public onClear() {
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
        return this.height;
    }

    public getWidth(): number {
        return this.width;
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

    protected init(): void {
        this.render();
        if (this.m_Init === false) {
            this.m_Init = true;
        }
    }

    protected render(): void {
    }
}