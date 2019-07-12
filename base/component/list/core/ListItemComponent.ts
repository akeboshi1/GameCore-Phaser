import {IListItemComponent} from "../interfaces/IListItemComponent";
import {IListItemEventListener} from "../interfaces/IListItemEventListener";
import { IComoboxData } from "../../combobox/ComboBox";
import Globals from "../../../../Globals";
import { ToolTip } from "../../tooltip/ToolTip";

export class ListItemComponent extends Phaser.Sprite implements IListItemComponent {
    protected m_Data: any;
    protected m_Index: number;
    protected m_List: IListItemEventListener;
    protected m_Init = false;
    protected mToolTipText: string;
    protected mToolTip: ToolTip;

    constructor(game: Phaser.Game) {
        super(game, 0, 0);
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
    }

    public setEnable(value: boolean) {
        this.inputEnabled = value;
        if (value) {
            this.addEvent();
        } else {
            this.removeEvent();
        }
    }

    public setToolTip(toolTip: ToolTip) {
        this.mToolTip = toolTip;
        Globals.ToolTipManager.setToolTip(this, toolTip);
      }

    public setToolTipText(text: string) {
        this.mToolTipText = text;
        this.setToolTip(ToolTip.getInstance(this.game));
    }

    public initToolTip() {
        if (this.mToolTip) {
            this.mToolTip.setText(this.mToolTipText);
        }
    }

    protected addEvent(): void {
        this.events.onInputOver.add(this.handleChildOver, this);
        this.events.onInputOut.add(this.handleChildOut, this);
        this.events.onInputDown.add(this.handleChildDown, this);
        this.events.onInputUp.add(this.handleChildUp, this);
    }

    protected removeEvent(): void {
        this.events.onInputOver.remove(this.handleChildOver, this);
        this.events.onInputOut.remove(this.handleChildOut, this);
        this.events.onInputDown.remove(this.handleChildDown, this);
        this.events.onInputUp.remove(this.handleChildUp, this);
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

    protected handleChildUp(item: any, pointer: Phaser.Pointer, isOver: boolean): void {
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

    public destroy() {
        Globals.ToolTipManager.setToolTip(this, null);
        super.destroy();
    }
}