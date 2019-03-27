import {IDragManager} from "./interfaces/IDragManager";
import {IDragable} from "./interfaces/IDragable";
import {IDragDropData} from "./interfaces/IDragDropData";
import {IDropable} from "./interfaces/IDropable";
import {DragDropData} from "./base/DragDropData";
import BaseSingleton from "../BaseSingleton";
import {Const} from "../../common/const/Const";
import UIConst = Const.UIConst;
import {Log} from "../../Log";
import Globals from "../../Globals";

export class DragManager  extends BaseSingleton implements IDragManager {

    protected m_Proxy: Phaser.Sprite;
    private m_DragLayer: Phaser.Group;

    private m_BitmapData: Phaser.BitmapData;
    private m_DragData: IDragDropData;
    private m_Dragable: IDragable;
    private m_AcceptDrag: IDropable;

    private m_IsDraging: boolean;
    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        super();
    }

    public get isDraging(): boolean {
        return this.m_IsDraging;
    }

    public init(game: Phaser.Game): void {
        this.game = game;
        this.m_BitmapData = this.game.make.bitmapData(UIConst.UI_DRAG_WIDTH, UIConst.UI_DRAG_HEIGHT);
        this.m_Proxy = this.game.make.sprite(0, 0, this.m_BitmapData);
        this.m_Proxy.inputEnabled = true;
        this.m_Proxy.input.enableDrag(true);

        this.m_DragLayer = Globals.LayerManager.dragLayer;
        this.m_DragLayer.inputEnableChildren = false;
        this.m_DragLayer.add(this.m_Proxy);
    }

    public startDrag(dragable: IDragable): boolean {
        if (null == dragable || this.m_IsDraging) {
            return false;
        }
        this.m_IsDraging = true;
        this.m_Dragable = dragable;
        this.m_DragData = new DragDropData(dragable);
        this.m_BitmapData.draw(dragable, 0,  0, UIConst.UI_DRAG_WIDTH, UIConst.UI_DRAG_HEIGHT);
        this.m_Proxy.events.onDragStart.add(this.handleDragStart, this);
        this.m_Proxy.events.onDragUpdate.add(this.handleDragUpdate, this);
        this.m_Proxy.events.onDragStop.add(this.handleDragStop, this);
        this.m_Proxy.input.startDrag(this.game.input.activePointer);
        return true;
    }

    private handleDragStart(): void {
        Log.trace("start");
    }

    private handleDragUpdate(): void {
        Log.trace("update");
    }

    private handleDragStop(spr: Phaser.Sprite, pointer: Phaser.Pointer): void {
        Log.trace("stop");
        this.m_BitmapData.cls();
        this.m_IsDraging = false;
    }
}