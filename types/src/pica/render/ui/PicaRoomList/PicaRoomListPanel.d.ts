import { op_client, op_def } from "pixelpai_proto";
import { BaseScroller } from "apowophaserui";
import { BasePanel, Render, UiManager } from "gamecoreRender";
export declare class PicaRoomListPanel extends BasePanel {
    private mCloseBtn;
    private mRoomDeleBtn;
    private mMyRoomDeleBtn;
    private mRoomDele;
    private mMyRoomDele;
    private mSeachBtn;
    private mRoomContainer;
    private mScroller;
    private mBackGround;
    private content;
    private preTabButton;
    private mSelectIndex;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    updateRoomList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_LIST): void;
    updateMyRoomList(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PLAYER_ENTER_ROOM_HISTORY): void;
    addListen(): void;
    removeListen(): void;
    destroy(): void;
    protected preload(): void;
    protected init(): void;
    private showRoomList;
    private showMyRoomList;
    private onEnterRoomHandler;
    private onSelectedHandler;
    private onSeachHandler;
    private onCloseHandler;
}
export declare class RoomDelegate extends Phaser.Events.EventEmitter {
    protected mChildPad: number;
    protected mScene: Phaser.Scene;
    protected mDpr: number;
    protected mScroller: BaseScroller;
    protected activity: Phaser.GameObjects.Image;
    protected mContainer: Phaser.GameObjects.Container;
    protected mKey: string;
    protected mRender: Render;
    protected mHeight: number;
    protected mContent: any;
    private mPopularityRoom;
    private mPlayerRoom;
    constructor(container: Phaser.GameObjects.Container, scroller: BaseScroller, scene: Phaser.Scene, render: Render, key: string, dpr?: number);
    addListen(): void;
    removeListen(): void;
    updateList(content: any): void;
    addToContainer(): void;
    removeFromContainer(): void;
    destroy(): void;
    overminHandler(): void;
    setUpdateScrollInteractive(roomList: RoomItem[]): void;
    protected init(): void;
    protected refreshPos(): void;
    protected onEnterRoomHandler(room: any): void;
    protected setScrollInteractive(roomList: RoomItem[]): void;
}
export declare class RoomZoon extends Phaser.Events.EventEmitter {
    mRefreshRooms: RoomItem[];
    protected mShowList: any[];
    protected mRooms: RoomItem[];
    protected mKey: string;
    protected mIconFrame: string;
    protected mDpr: number;
    protected mScene: Phaser.Scene;
    protected mPad: number;
    protected mOrientaction: number;
    protected mAddCallBack: Function;
    protected mWidth: number;
    protected mHeight: number;
    protected icon: Phaser.GameObjects.Image;
    protected text: Phaser.GameObjects.Text;
    protected mLabel: string;
    protected uiScale: number;
    protected mRoomDatas: any[];
    protected mPad1: number;
    /**
     *
     * @param scene
     * @param key
     * @param iconFrame
     * @param label
     * @param dpr
     * @param scrollMode 0 竖直  1 水平
     * @param pad
     * @param addCallBack
     */
    constructor(scene: Phaser.Scene, key: string, iconFrame: string, label: string, dpr: number, uiscale: number, scrollMode: number, pad: number, addCallBack: Function);
    get showList(): any[];
    get roomList(): RoomItem[];
    addItem(rooms: op_client.IEditModeRoom[], pad?: number): void;
    updateItem(): number;
    get width(): number;
    get height(): number;
    destroy(): void;
    clear(): void;
    protected onEnterRoomHandler(room: any): void;
}
declare class RoomItem extends Phaser.GameObjects.Container {
    static Hei: number;
    protected mBackground: Phaser.GameObjects.Image;
    protected mNickName: Phaser.GameObjects.Text;
    protected mCounter: Phaser.GameObjects.Text;
    protected mCounterIcon: Phaser.GameObjects.Image;
    protected mLabelImg: Phaser.GameObjects.Image;
    protected mLabelText: Phaser.GameObjects.Text;
    protected mRoom: op_client.IEditModeRoom;
    protected mKey: string;
    protected mDpr: number;
    constructor(scene: Phaser.Scene, key: string, dpr?: number);
    setInfo(room: op_client.IEditModeRoom): void;
    roomData(): op_client.IEditModeRoom;
    onEnterRoomHandler(pointer?: Phaser.Input.Pointer): void;
    protected init(key: string, dpr: number): void;
    protected crateLabel(state: op_def.EditModeRoomPrivacy): void;
}
export {};
