import {ListComponent} from "../list/core/ListComponent";
import {UI, CustomWebFonts} from "../../../Assets";
import {ComboTextItem} from "./item/ComboTextItem";
import {IDisposeObject} from "../../object/interfaces/IDisposeObject";
import {UIEvents} from "../event/UIEvents";

export class ComboBox extends Phaser.Group implements IDisposeObject {
    protected mList: ListComponent;
    protected mWidth: number;
    protected mHeight: number;
    protected mLabel: Phaser.Text;
    protected mDropDownBt: Phaser.Button;
    protected mListBg: PhaserNineSlice.NineSlice;
    protected mDatas: IComoboxData[];
    protected mOpen = false;
    protected mSelectedItem: any;
    public onSelectedItem: Phaser.Signal;

    constructor(game: Phaser.Game, x: number, y: number, parent: PIXI.DisplayObjectContainer, data?: any[], width: number = 112, height: number = 26) {
        super(game, parent);
        this.x = x;
        this.y = y;
        this.mWidth = width;
        this.mHeight = height;
        this.mDatas = data || [];
        this.init();
        this.onSelectedItem = new Phaser.Signal();
    }

    public changeData(value: IComoboxData[]): void {
        this.mDatas = value;
        this.render();
    }

    public setLabelStyle(style: Phaser.PhaserTextStyle, update?: boolean) {
        if (this.mLabel) {
            this.mLabel.setStyle(style, update);
        }
    }

    protected init(): void {
        // this.game.add.nineSlice(0, 0, UI.Background.getName(), null, this.mWidth, this.mHeight, this);
        this.mLabel = this.game.make.text(0, 0, "", {font: "bold 12px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"} );
        this.mLabel.setShadow(2, 2, 0x333333, 2, false, false);
        this.mLabel.setTextBounds(0, 0, this.mWidth - UI.DropDownBtn.getWidth(), this.mHeight);
        this.mLabel.inputEnabled = true;
        this.mLabel.smoothed = false;
        this.add(this.mLabel);
        // this.mDropDownBt = this.game.make.button(this.mWidth - UI.DropDownBtn.getWidth() - 4, (this.mHeight - UI.DropDownBtn.getHeight()) / 2, UI.DropDownBtn.getName(), null, this
        // , 1, 0 , 2);
        // this.add(this.mDropDownBt);
        this.mListBg = this.game.make.nineSlice(0, -this.mHeight, UI.Background.getName(), null, this.mWidth, 1);
        this.mList = new ListComponent(this.game);
        this.mList.on(UIEvents.LIST_ITEM_UP, this.onListItemUp, this);
        this.render();
        this.addEvent();
    }

    private onListItemUp(item: ComboTextItem): void {
        this.mLabel.text = item.data.label;
        this.mSelectedItem = item;
        this.mOpen = false;
        this.remove(this.mListBg);
        this.remove(this.mList);
        this.onSelectedItem.dispatch(item);
    }

    protected addEvent(): void {
        // this.events.onInputUp.add(this.onHandleBt, this);
        this.onChildInputDown.add(this.onHandleBt, this);
    }

    protected removeEvent(): void {
        this.mDropDownBt.events.onInputUp.remove(this.onHandleBt, this);
    }

    protected onHandleBt(): void {
        this.mOpen = !this.mOpen;
        this.render();
    }

    protected render(): void {
        this.mList.onClear();

        let len = this.mDatas.length;

        if (this.mOpen) {
            let item: ComboTextItem;
            for (let i = 0; i < len; i++) {
                item = new ComboTextItem(this.game, this.mWidth - UI.DropDownBtn.getWidth(), this.mHeight);
                item.data = this.mDatas[i];
                this.mList.addItem(item);
            }
            this.mListBg.resize(this.mWidth, this.mHeight * len);
            this.add(this.mListBg);
            this.add(this.mList);
        } else {
            this.remove(this.mListBg);
            this.remove(this.mList);
        }

        if (!!this.mSelectedItem === false) {
            this.mLabel.text = this.mDatas[0].label;
            this.mSelectedItem = this.mDatas[0];
        }
        this.mList.y = -this.mList.height;
        this.mListBg.y = -this.mListBg.height - 8;
    }

    public onClear(): void {
    }

    public switchSelectedItem() {
        if (!!this.mSelectedItem === false) {
            return;
        }
        let index = this.mDatas.findIndex(data => this.mSelectedItem.value === data.value);
        index++;
        if (index >= this.mDatas.length) {
            index = 0;
        }
        this.mLabel.text = this.mDatas[index].label;
        this.mSelectedItem = this.mDatas[index];
    }

    public setSelectedData(item: any) {
        this.mLabel.text = item.label;
        this.mSelectedItem = item;
    }

    public set selectedItem(item: ComboTextItem) {
        this.mLabel.text = item.data.label;
        this.mSelectedItem = item;
    }

    public onDispose(): void {
        this.mSelectedItem = null;
        this.removeEvent();
        this.destroy(true);
    }

    public get selectedItem(): ComboTextItem {
        return this.mSelectedItem;
    }
}

export interface IComoboxData {
    label: string;
    value: any;
}