import {IDragManager} from "./interfaces/IDragManager";
import {IDragable} from "./interfaces/IDragable";
import {IDragDropData} from "./interfaces/IDragDropData";
import {IDropable} from "./interfaces/IDropable";
import {DragDropData} from "./base/DragDropData";
import BaseSingleton from "../BaseSingleton";

export class DragManager  extends BaseSingleton implements IDragManager {
    protected m_Proxy: Phaser.Sprite;
    private m_DragLayer: Phaser.Group;

    private m_Bitmap: Phaser.Image;
    private m_DragData: IDragDropData;
    private m_Dragable: IDragable;
    private m_AcceptDrag: IDropable;
    private game: Phaser.Game;

    constructor(game: Phaser.Game) {
        super();
        this.game = game;
        this.m_Proxy = game.make.sprite(0, 0);
        this.m_Proxy.inputEnabled = true;
        this.m_Proxy.input.enableDrag(true);
    }
    public setup(container: Phaser.Group): void {
        this.m_DragLayer = container;
        this.m_DragLayer.inputEnableChildren = false;
        this.m_DragLayer.add(this.m_Proxy);
    }

    public startDrag(dragable: IDragable): boolean {
        if (null == dragable) {
            return false;
        }
        this.m_Dragable = dragable;
        this.m_DragData = new DragDropData(dragable);
        this.m_Proxy.events.onDragStop.add(this.handleDragStop, this);
        this.m_Proxy.input.startDrag(this.game.input.activePointer);
        return true;
    }

    private handleDragStop(): void {

    }
}