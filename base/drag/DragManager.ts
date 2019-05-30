import {IDragManager} from "./interfaces/IDragManager";
import {IDragable} from "./interfaces/IDragable";
import {IDragDropData} from "./interfaces/IDragDropData";
import {IDropable} from "./interfaces/IDropable";
import {DragDropData} from "./base/DragDropData";
import BaseSingleton from "../BaseSingleton";
import {Const} from "../../common/const/Const";
import {Log} from "../../Log";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import UIConst = Const.UIConst;

export class DragManager extends BaseSingleton implements IDragManager {

    protected m_Proxy: Phaser.Sprite;
    private m_DragLayer: Phaser.Group;

    private m_BitmapData: Phaser.BitmapData;
    private m_DragData: IDragDropData;
    private m_Dragable: IDragable;
    private m_DropableList: IDropable[];

    private m_IsDraging: boolean;
    private game: Phaser.Game;
    private boundRect: Phaser.Rectangle;

    constructor(game: Phaser.Game) {
        super();
    }

    public get isDraging(): boolean {
        return this.m_IsDraging;
    }

    public init(game: Phaser.Game): void {
        this.game = game;
        this.m_DropableList = [];
        this.m_BitmapData = this.game.make.bitmapData(UIConst.UI_DRAG_WIDTH, UIConst.UI_DRAG_HEIGHT);
        this.m_Proxy = this.game.make.sprite(0, 0, this.m_BitmapData);
        this.m_DragLayer = Globals.LayerManager.dragLayer;
        this.m_DragLayer.inputEnableChildren = false;
        this.m_DragLayer.add(this.m_Proxy);
    }

    public startDrag(dragable: IDragable): boolean {
        if (null == dragable) {
            return false;
        }
        this.m_IsDraging = true;
        this.m_Dragable = dragable;
        this.m_DragData = new DragDropData(dragable);
        this.m_BitmapData.draw(dragable.getDragImage(), UIConst.UI_DRAG_WIDTH >> 1, UIConst.UI_DRAG_HEIGHT >> 1, UIConst.UI_DRAG_WIDTH, UIConst.UI_DRAG_HEIGHT);
        this.m_Proxy.inputEnabled = true;
        this.m_Proxy.input.dragStopBlocksInputUp = true;
        this.m_Proxy.input.enableDrag(true);
        this.m_Proxy.events.onDragUpdate.add(this.handleDragUpdate, this);
        this.m_Proxy.events.onDragStop.add(this.handleDragStop, this);
        this.m_Proxy.events.onDragStop.add(this.handleDragStop, this);
        this.m_Proxy.input.startDrag(this.game.input.activePointer);
        return true;
    }

    public registerDrop(dropable: IDropable): void {
        let idx = this.searchDrop(dropable);
        if (idx !== -1) {
            return;
        }
        this.m_DropableList.push(dropable);
    }

    public unRegisterDrop(dropable: IDropable): void {
        let idx = this.searchDrop(dropable);
        if (idx === -1) {
            return;
        }
        this.m_DropableList.splice(idx, 1);
    }

    protected searchDrop(dropable: IDropable): number {
        let len = this.m_DropableList.length;
        let drop: IDropable;
        for (let i = 0; i < len; i++) {
            drop = this.m_DropableList[i];
            if (dropable === drop) {
                return i;
            }
        }
        return -1;
    }

    private handleDragUpdate(): void {
        Log.trace("update");
        let len = this.m_DropableList.length;
        let drop: IDropable;
        for (let i = 0; i < len; i++) {
            drop = this.m_DropableList[i];
            let a = drop.getBound();
            let b = this.getBound();
            let c = Phaser.Rectangle.intersection(a, b);
            if (c.width > 0 && c.height > 0) {
                drop.dragDrop(this.m_Dragable);
                Globals.MessageCenter.emit(MessageType.DRAG_OVER_DROP, [this.m_Dragable, drop]);
            }
        }
    }

    private getBound(): Phaser.Rectangle {
        let bound = this.m_Proxy.getBounds();
        if (this.boundRect === undefined) {
            this.boundRect = new Phaser.Rectangle(bound.x, bound.y, bound.width, bound.height);
        } else {
            this.boundRect.setTo(bound.x, bound.y, bound.width, bound.height);
        }
        return this.boundRect;
    }

    private handleDragStop(spr: Phaser.Sprite, pointer: Phaser.Pointer): void {
        Log.trace("stop");

        let len = this.m_DropableList.length;
        let drop: IDropable;
        for (let i = 0; i < len; i++) {
            drop = this.m_DropableList[i];
            let a = drop.getBound();
            let b = this.getBound();
            let c = Phaser.Rectangle.intersection(a, b);
            if (c.width > 0 && c.height > 0) {
                drop.dragDrop(this.m_Dragable);
                Globals.MessageCenter.emit(MessageType.DRAG_TO_DROP, [this.m_Dragable, drop]);
            }
        }

        this.m_Proxy.input.disableDrag();
        this.m_Proxy.inputEnabled = false;
        this.m_BitmapData.cls();
        this.m_IsDraging = false;
    }
}