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
        this.removeEvent();
    }

    public onDispose() {
        this.onClear();
        this.removeAll(true);
    }

    public setEnable(value: boolean) {
        this.inputEnableChildren = value;
        if (value) {
            this.addEvent();
        } else {
            this.removeEvent();
        }
    }

    protected addEvent(): void {
        this.onChildInputOver.add(this.handleChildOver, this);
        this.onChildInputOut.add(this.handleChildOut, this);
        this.onChildInputDown.add(this.handleChildDown, this);
        this.onChildInputUp.add(this.handleChildUp, this);
    }

    protected removeEvent(): void {
        this.onChildInputOver.remove(this.handleChildOver, this);
        this.onChildInputOut.remove(this.handleChildOut, this);
        this.onChildInputDown.remove(this.handleChildDown, this);
        this.onChildInputUp.remove(this.handleChildUp, this);
    }

    protected handleChildOver(): void {
        if (this.m_List) {
            this.m_List.onTriggerOver(this);
        }
    }

    protected handleChildOut(): void {
        if (this.m_List) {
            this.m_List.onTriggerOut(this);
        }
    }

    protected handleChildDown(): void {
        if (this.m_List) {
            this.m_List.onTriggerDown(this);
        }
    }

    protected handleChildUp(): void {
        if (this.m_List) {
            this.m_List.onTriggerUp(this);
        }
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