import {Panel} from "../components/panel";
import { DisplayObject } from "../../rooms/display/display.object";
import { Pos } from "../../utils/pos";
import { Position45, IPosition45Obj } from "../../utils/position45";
import { DecorateRoom } from "../../rooms/decorate.room";
import { MessageType } from "../../const/MessageType";
import { Direction } from "../../rooms/element/element";

export class DecoratePanel extends Panel {
    private readonly resKey = "decorate";
    private readonly minGrid: number = 2;
    private readonly maxGrid: number = 10;
    private mControllContainer: Phaser.GameObjects.Container;
    private mTurnBtn: Phaser.GameObjects.Image;
    private mRecycleBtn: Phaser.GameObjects.Image;
    private mOkBtn: Phaser.GameObjects.Image;
    private mCancelBtn: Phaser.GameObjects.Image;
    private mMenuContainer: Phaser.GameObjects.Container;
    private mMainMenus: Phaser.GameObjects.Image[];

    private mHorizontalBtn: Phaser.GameObjects.Image;
    private mMoveBtn: Phaser.GameObjects.Image;
    private mRepeatBtn: Phaser.GameObjects.Image;
    private mExtendBtn: Phaser.GameObjects.Image;
    private mSubMenus: Phaser.GameObjects.Container;

    private mMoveMenuContainer: MoveMenu;
    private mRepeatMenuContainer: MoveMenu;
    private mDisplayObject: DisplayObject;
    private readonly key = "decorate_edit_menu";
    private offset: Pos = new Pos();
    private mScaleRatio: number = 1;

    constructor(scene: Phaser.Scene, private mRoomService: DecorateRoom) {
        super(scene, mRoomService.world);
        this.setTween(false);
        if (this.mWorld) this.mScaleRatio = this.mWorld.scaleRatio;
    }

    public setElement(ele: DisplayObject) {
        this.mDisplayObject = ele;
        if (!this.mInitialized) {
            return;
        }
        this.x = ele.x;
        this.y = ele.y;

        this.updateArrowPos(ele);

        this.register();
    }

    public updatePos(x: number, y?: number, z?: number) {
        this.setPosition(x * this.mScaleRatio, (y  + this.offset.y) * this.mScaleRatio, z);
    }

    public close() {
        this.unregister();
    }

    public destroy() {
        this.unregister();
        super.destroy();
    }

    protected preload() {
        // this.scene.load.image(Border.getName(), Border.getPNG());
        // this.scene.load.image("arrow", Url.getRes("ui/common/common_arrow.png"));
        // this.scene.load.atlas(this.resKey, Url.getRes("ui/decorate/decorate_atlas.png"), Url.getRes("ui/decorate/decorate_atlas.json"));
        this.addAtlas(this.key, "decorate_edit_menu/decorate_edit_menu.png", "decorate_edit_menu/decorate_edit_menu.json");
        super.preload();
    }

    protected init() {
        const w = this.scene.cameras.main.width / this.scale;
        const h = this.scene.cameras.main.height / this.scale;

        this.mMainMenus = [];
        this.mMenuContainer = this.scene.make.container({
            x: w >> 1,
        }, false);
        this.mSubMenus = this.scene.make.container({
            x: w >> 1,
            y: 60 * this.dpr
        }, false);

        this.mOkBtn = this.scene.make.image({
            key: this.key,
            frame: "ok_btn.png"
        }, false).setInteractive().setOrigin(0);

        this.mRecycleBtn = this.scene.make.image({
            key: this.key,
            frame: "recycly_btn.png"
        }, false).setInteractive().setOrigin(0);
        this.mTurnBtn = this.scene.make.image({
            key: this.key,
            frame: "turn_btn.png"
        }, false).setInteractive().setOrigin(0);

        this.mCancelBtn = this.scene.make.image({
            key: this.key,
            frame: "cancel_btn.png"
        }, false).setInteractive().setOrigin(0);
        // this.add([this.mControllContainer, this.mArrow1, this.mArrow7, this.mArrow3, this.mArrow5]);

        this.mHorizontalBtn = this.scene.make.image({
            key: this.key,
            frame: "horizontal_btn.png"
        }, false).setInteractive().setOrigin(0);

        this.mMoveBtn = this.scene.make.image({
            key: this.key,
            frame: "move_btn.png"
        }, false).setInteractive().setOrigin(0);

        this.mRepeatBtn = this.scene.make.image({
            key: this.key,
            frame: "repeat_btn.png"
        }, false).setInteractive().setOrigin(0);

        this.mExtendBtn = this.scene.make.image({
            key: this.key,
            frame: "extend_btn.png"
        }, false).setInteractive().setOrigin(0);

        this.mMoveMenuContainer = new MoveMenu(this.scene, this.key, this.dpr, this.scale);
        this.mMoveMenuContainer.y = this.mSubMenus.y + 60 * this.dpr + this.mMoveMenuContainer.height / 2;

        this.mRepeatMenuContainer = new MoveMenu(this.scene, this.key, this.dpr, this.scale);
        this.mRepeatMenuContainer.y = this.mMoveMenuContainer.y;

        const zoom = this.scale;

        // this.add(this.mMenuGroup);
        // this.mMenuGroup.addMultiple([this.mOkBtn, this.mTurnBtn, this.mRecycleBtn, this.mCancelBtn])

        // this.mMainMenus = ;
        // this.mSubMenus = ;
        this.add([this.mMenuContainer, this.mSubMenus]);
        this.mMenuContainer.add([this.mOkBtn, this.mTurnBtn, this.mRecycleBtn, this.mCancelBtn]);
        this.mSubMenus.add([this.mHorizontalBtn, this.mMoveBtn, this.mRepeatBtn, this.mExtendBtn]);
        // this.add(this.mSubMenus);
        let mainMenuW = w - 55 * this.dpr * this.mWorld.uiScale * 2;
        this.mMenuContainer.x = -mainMenuW >> 1;
        const list = this.mMenuContainer.list;
        list.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.width);
        let margin = mainMenuW / (list.length - 1) / zoom;
        for (let i = 1; i < list.length; i++) {
            const preButton = <Phaser.GameObjects.Image> list[i - 1];
            const button = <Phaser.GameObjects.Image> list[i];
            button.x = preButton.width + preButton.x + margin;
        }

        mainMenuW = w - 70 * this.dpr * this.mWorld.uiScale * 2;
        this.mSubMenus.x = -mainMenuW >> 1;
        const subList = this.mSubMenus.list;
        subList.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.width);
        margin = mainMenuW / (subList.length - 1) / zoom;
        for (let i = 1; i < subList.length; i++) {
            const preButton = <Phaser.GameObjects.Image> subList[i - 1];
            const button = <Phaser.GameObjects.Image> subList[i];
            button.x = preButton.width + preButton.x + margin;
        }

        this.mMoveMenuContainer.x = this.mSubMenus.x + this.mMoveBtn.x + this.mMoveBtn.width / 2 + 29 * this.dpr;
        this.mRepeatMenuContainer.x = this.mSubMenus.x + this.mRepeatBtn.x + this.mRepeatBtn.width / 2 + 29 * this.dpr;

        // this.mControllContainer.add([border, this.mTurnBtn, this.mRecycleBtn, this.mConfirmBtn]);
        super.init();

        this.setElement(this.mDisplayObject);
    }

    protected register() {
        if (!this.mInitialized) {
            return;
        }
        this.mCancelBtn.on("pointerup", this.onCancelHandler, this);
        this.mOkBtn.on("pointerup", this.onAddHandler, this);
        this.mRecycleBtn.on("pointerup", this.onRecycleHandler, this);
        this.mTurnBtn.on("pointerup", this.onTurnHandler, this);
        this.mMoveBtn.on("pointerup", this.onShowMoveMenuHandler, this);
        this.mRepeatBtn.on("pointerup", this.onShowRepeatHandler, this);
        this.mExtendBtn.on("pointerup", this.onShowExtendsHandler, this);
        this.mMoveMenuContainer.register();
        this.mMoveMenuContainer.on("move", this.onMoveHandler, this);
        this.mRepeatMenuContainer.register();
        this.mRepeatMenuContainer.on("move", this.onRepeatHandler, this);
        // this.mTurnBtn.on("pointerup", this.onTurnHandler, this);
        // this.mRecycleBtn.on("pointerup", this.onRecycleHandler, this);
        // this.mOkBtn.on("pointerup", this.onPutHandler, this);
    }

    protected unregister() {
        if (!this.mInitialized) {
            return;
        }
        this.mCancelBtn.off("pointerup", this.onCancelHandler, this);
        this.mOkBtn.off("pointerup", this.onAddHandler, this);
        this.mRecycleBtn.off("pointerup", this.onRecycleHandler, this);
        this.mTurnBtn.off("pointerup", this.onTurnHandler, this);
        this.mMoveBtn.off("pointerup", this.onShowMoveMenuHandler, this);
        this.mRepeatBtn.off("pointerup", this.onShowRepeatHandler, this);
        this.mExtendBtn.off("pointerup", this.onShowExtendsHandler, this);
        this.mMoveMenuContainer.off("move", this.onMoveHandler, this);
        this.mMoveMenuContainer.unRegister();
        this.mRepeatMenuContainer.off("move", this.onRepeatHandler, this);
        this.mRepeatMenuContainer.unRegister();

        // this.mTurnBtn.off("pointerup", this.onTurnHandler, this);
        // this.mRecycleBtn.off("pointerup", this.onRecycleHandler, this);
        // this.mOkBtn.off("pointerup", this.onPutHandler, this);
    }

    private onLeftUpHandler() {
        if (!this.mDisplayObject) {
            return;
        }
        const pos45 = this.mRoomService.transformToMini45(new Pos(this.mDisplayObject.x, this.mDisplayObject.y));
        pos45.x -= 1;
        this.onMoveElement(pos45);
    }

    private onLeftDownHandler() {
        const pos45 = this.mRoomService.transformToMini45(new Pos(this.mDisplayObject.x, this.mDisplayObject.y));
        pos45.y += 1;
        this.onMoveElement(pos45);
    }

    private onRightUpHandler() {
        const pos45 = this.mRoomService.transformToMini45(new Pos(this.mDisplayObject.x, this.mDisplayObject.y));
        pos45.y -= 1;
        this.onMoveElement(pos45);
    }

    private onRightDownHandler() {
        const pos45 = this.mRoomService.transformToMini45(new Pos(this.mDisplayObject.x, this.mDisplayObject.y));
        pos45.x  = pos45.x + 1;
        this.onMoveElement(pos45);
    }

    private onRepeatNorthWestHandler() {
    }

    private onMoveElement(pos45: Pos) {
        if (!this.mDisplayObject) {
            return;
        }
        const position = this.mRoomService.transformToMini90(pos45);
        this.emit("moveElement", position);
    }

    private createImage(key: string, frame?: string, x?: number, y?: number): Phaser.GameObjects.Image {
        return this.scene.make.image({ key, frame, x, y }, false).setInteractive().setOrigin(0);
    }

    private validateGrid(val: number): number {
        if (val > this.maxGrid) {
            val = this.maxGrid;
        }
        if (val < this.minGrid) {
            val = this.minGrid;
        }
        return val;
    }

    private updateArrowPos(ele: DisplayObject) {
        if (!ele || !ele.collisionArea) {
            return;
        }
        // return;
        let rows = ele.collisionArea.length;
        let cols = ele.collisionArea[0].length;

        rows = this.validateGrid(rows);
        cols = this.validateGrid(cols);
        if (ele.scaleX === -1) {
            [rows, cols] = [cols, rows];
        }

        const miniSize = this.mRoomService.roomSize;
        const position: IPosition45Obj = {
            rows,
            cols,
            tileWidth: miniSize.tileWidth / 2,
            tileHeight: miniSize.tileHeight / 2,
        };

        const reference = ele.getElement("reference");
        if (!reference) {
            return;
        }

        const pos = Position45.transformTo90(new Pos(cols - ele.originPoint.y, rows - ele.originPoint.x), position);
        this.offset.y = pos.y;

        // let pos = Position45.transformTo90(new Pos(cols, (rows / 2)), position);
        // if (this.mArrow5) {
        //     this.mArrow5.x = pos.x + reference.x;
        //     this.mArrow5.y = pos.y + reference.y;
        // }

        // pos = Position45.transformTo90(new Pos((cols / 2), rows), position);
        // if (this.mArrow3) {
        //     this.mArrow3.x = pos.x - this.mArrow3.width + reference.x;
        //     this.mArrow3.y = pos.y + reference.y;
        // }

        // pos = Position45.transformTo90(new Pos(0, (rows / 2)), position);
        // if (this.mArrow1) {
        //     this.mArrow1.x = pos.x - this.mArrow1.width + reference.x;
        //     this.mArrow1.y = pos.y - this.mArrow1.height + reference.y;
        // }

        // pos = Position45.transformTo90(new Pos((cols / 2), 0), position);
        // if (this.mArrow7) {
        //     this.mArrow7.x = pos.x + reference.x;
        //     this.mArrow7.y = pos.y - this.mArrow7.height + reference.y;
        // }
    }

    private onTurnHandler() {
        this.mWorld.emitter.emit(MessageType.TURN_ELEMENT, this.mDisplayObject);
    }

    private onRecycleHandler() {
        this.mWorld.emitter.emit(MessageType.RECYCLE_ELEMENT, this.mDisplayObject);
    }

    private onCancelHandler() {
        this.mWorld.emitter.emit(MessageType.CANCEL_PUT, this.mDisplayObject);
    }

    private onAddHandler() {
        this.mWorld.emitter.emit(MessageType.PUT_ELEMENT, this.mDisplayObject);
    }

    private onMoveHandler(dir: number) {
        if (typeof dir !== "number") {
            return;
        }
        switch (dir) {
            case Direction.north_west:
                this.onLeftUpHandler();
                break;
            case Direction.west_south:
                this.onLeftDownHandler();
                break;
            case Direction.south_east:
                this.onRightDownHandler();
                break;
            case Direction.east_north:
                this.onRightUpHandler();
                break;
        }
    }

    private onPutHandler() {
        this.mWorld.emitter.emit(MessageType.PUT_ELEMENT, this.mDisplayObject);
    }

    private onRepeatHandler(dir: Direction) {
        switch (dir) {
            case Direction.north_west:
                this.onRepeatNorthWestHandler();
                break;
        }

    }

    private onShowMoveMenuHandler() {
        this.add(this.mMoveMenuContainer);
        this.remove(this.mRepeatMenuContainer);
    }

    private onShowRepeatHandler() {
        this.add(this.mRepeatMenuContainer);
        this.remove(this.mMoveMenuContainer);
    }

    private onShowExtendsHandler() {
        // this.mRoomService.canPut()
        // this.mDisplayObject.
    }
}

class MoveMenu extends Phaser.GameObjects.Container {
    private mBtns: Phaser.GameObjects.Image[];
    private mArrow1: Phaser.GameObjects.Image;
    private mArrow3: Phaser.GameObjects.Image;
    private mArrow5: Phaser.GameObjects.Image;
    private mArrow7: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string, dpr: number = 1, uiScale: number = 1) {
        super(scene);
        const bg = scene.make.image({
            key,
            frame: "bg.png"
        }, false);
        this.setSize(bg.displayWidth, bg.displayHeight);

        this.mArrow1 = scene.make.image({
            key,
            frame: "arrow_1.png"
        }, false).setInteractive().setData("dir", 1);

        this.mArrow3 = scene.make.image({
            key,
            frame: "arrow_3.png"
        }, false).setInteractive().setData("dir", 3);
        this.mArrow5 = scene.make.image({
            key,
            frame: "arrow_5.png"
        }, false).setInteractive().setData("dir", 5);
        this.mArrow7 = scene.make.image({
            key,
            frame: "arrow_7.png"
        }, false).setInteractive().setData("dir", 7);
        this.mBtns = [this.mArrow1, this.mArrow3, this.mArrow5, this.mArrow7];
        this.add(bg);
        this.add(this.mBtns);

        const w = this.width;
        let totalWidth = this.width - 20 * dpr;
        this.mBtns.map((btn) => totalWidth -= btn.displayWidth);
        const space = totalWidth = totalWidth / (this.mBtns.length - 1);
        const arrowH = (6 * dpr);
        for (let i = 0; i < this.mBtns.length; i++) {
            if (i === 0) {
                this.mBtns[i].x = 10 * dpr + this.mBtns[i].width / 2 - this.width / 2;
            } else {
                this.mBtns[i].x = space + this.mBtns[i - 1].x + this.mBtns[i - 1].width;
            }
            this.mBtns[i].y = (this.height - this.mBtns[i].height) / 2 - arrowH;
        }
        this.setInteractive();
    }

    public register() {
        // for (const btn of this.mBtns) {
        //     btn.on("pointerup", this.onArrowHandler, this);
        // }
        this.mArrow1.on("pointerup", this.onArrow1Handler, this);
        this.mArrow3.on("pointerup", this.onArrow3Handler, this);
        this.mArrow5.on("pointerup", this.onArrow5Handler, this);
        this.mArrow7.on("pointerup", this.onArrow7Handler, this);
    }

    public unRegister() {
        this.mArrow1.off("pointerup", this.onArrow1Handler, this);
        this.mArrow3.off("pointerup", this.onArrow3Handler, this);
        this.mArrow5.off("pointerup", this.onArrow5Handler, this);
        this.mArrow7.off("pointerup", this.onArrow7Handler, this);
    }

    private onArrow1Handler() {
        this.emit("move", Direction.north_west);
    }

    private onArrow3Handler() {
        this.emit("move", Direction.west_south);
    }

    private onArrow5Handler() {
        this.emit("move", Direction.south_east);
    }

    private onArrow7Handler() {
        this.emit("move", Direction.east_north);
    }
}
