import {ListComponent} from "../list/core/ListComponent";
import {UI} from "../../../Assets";
import {NiceSliceButton} from "../button/NiceSliceButton";
import {ComboTextItem} from "./item/ComboTextItem";
import {IDisposeObject} from "../../IDisposeObject";
import {UIEvents} from "../event/UIEvents";

export class ComboBox extends Phaser.Group implements IDisposeObject{
    protected mList: ListComponent;
    protected mWidth: number;
    protected mHeight: number;
    protected mLabel: Phaser.Text;
    protected mDropDownBt: NiceSliceButton;
    protected mListBg: PhaserNineSlice.NineSlice;
    protected mDatas: string[];
    protected mOpen = false;

    constructor(game: Phaser.Game, x: number, y: number, parent: PIXI.DisplayObjectContainer, data?: string[], width: number = 112, height: number = 26) {
        super(game, parent);
        this.x = x;
        this.y = y;
        this.mWidth = width;
        this.mHeight = height;
        this.mDatas = data || [];
        this.init();
    }

    public setData(value: string[]): void {
        this.mDatas = value;
        this.render();
    }

    protected init(): void {
        this.game.add.nineSlice(0, 0, UI.InputBg.getName(), null, this.mWidth, this.mHeight, this);
        this.mLabel = this.game.make.text(0, 0, "", {fontSize: 12, fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"} );
        this.mLabel.setShadow(2, 2, 0x333333, 2, false, false);
        this.mLabel.setTextBounds(0, 0, this.mWidth - UI.DropDownBtn.getWidth(), this.mHeight);
        this.add(this.mLabel);
        this.mDropDownBt = new NiceSliceButton(this.game, this.mWidth - UI.DropDownBtn.getWidth() - 4, (this.mHeight - UI.DropDownBtn.getHeight()) / 2, UI.DropDownBtn.getName(), "button_over.png", "button_out.png", "button_down.png", UI.DropDownBtn.getWidth(), UI.DropDownBtn.getHeight(), {
            top: 8,
            bottom: 8,
            left: 8,
            right: 8
        });
        this.add(this.mDropDownBt);
        this.mListBg = this.game.add.nineSlice(0, this.mHeight, UI.InputBg.getName(), null, this.mWidth, 1);
        this.mList = new ListComponent(this.game);
        this.mList.on(UIEvents.LIST_ITEM_CLICK, this.onListItemClick, this);
        this.mList.y = this.mHeight;
        this.render();
        this.addEvent();
    }

    private onListItemClick(item: ComboTextItem): void {
        this.mLabel.text = item.data;
        this.mOpen = false;
        this.remove(this.mListBg);
        this.remove(this.mList);
    }

    protected addEvent(): void {
        this.mDropDownBt.events.onInputUp.add(this.onHandleBt, this);
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
        if (len > 0) {
            this.mLabel.text = this.mDatas[0];
        }

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
    }

    public onClear(): void {
    }

    public onDispose(): void {
        this.removeEvent();
        this.destroy(true);
    }
}