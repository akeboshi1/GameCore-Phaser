import {Panel} from "../components/panel";
import {Border, Url} from "../../utils/resUtil";
import {NinePatch} from "../components/nine.patch";
import { DisplayObject } from "../../rooms/display/display.object";
import { Pos } from "../../utils/pos";
import { Position45, IPosition45Obj } from "../../utils/position45";
import { IRoomService } from "../../rooms/room";
import { DecorateRoom } from "../../rooms/decorate.room";
import { Logger } from "../../utils/log";
import { MessageType } from "../../const/MessageType";

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

    private mMoveMenuContainer: Phaser.GameObjects.Container;
    private mArrow1: Phaser.GameObjects.Image;
    private mArrow3: Phaser.GameObjects.Image;
    private mArrow5: Phaser.GameObjects.Image;
    private mArrow7: Phaser.GameObjects.Image;
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

    protected preload() {
        // this.scene.load.image(Border.getName(), Border.getPNG());
        // this.scene.load.image("arrow", Url.getRes("ui/common/common_arrow.png"));
        // this.scene.load.atlas(this.resKey, Url.getRes("ui/decorate/decorate_atlas.png"), Url.getRes("ui/decorate/decorate_atlas.json"));
        this.addAtlas(this.key, "decorate_edit_menu/decorate_edit_menu.png", "decorate_edit_menu/decorate_edit_menu.json");
        super.preload();
    }

    protected init() {
        // this.mControllContainer = this.scene.make.container({ y: -100 }, false);
        // const border = new NinePatch(this.scene, 0, 0, 196, 70, Border.getName(), null, Border.getConfig());

        // this.mTurnBtn = this.createImage(this.resKey, "turn_btn.png", -60, 0);
        // this.mRecycleBtn = this.createImage(this.resKey, "recycle_btn.png", 0, 0);
        // this.mConfirmBtn = this.createImage(this.resKey, "confirm_btn.png", 60, 0);
        // const arrow = this.scene.make.image({
        //     key: "arrow",
        //     y: 46
        // }).setAngle(90);
        // this.mControllContainer.add(arrow);

        // this.mArrow1 = this.createImage(this.resKey, "arrow_1.png", 0, 0).setOrigin(0, 0);
        // this.mArrow1.on("pointerup", this.onLeftUpHandler, this);
        // this.mArrow3 = this.createImage(this.resKey, "arrow_3.png", 0, 300).setOrigin(0, 0);
        // this.mArrow3.on("pointerup", this.onLeftDownHandler, this);
        // this.mArrow5 = this.createImage(this.resKey, "arrow_5.png", 300, 300).setOrigin(0, 0);
        // this.mArrow5.on("pointerup", this.onRightDownHandler, this);
        // this.mArrow7 = this.createImage(this.resKey, "arrow_7.png", 300, 100).setOrigin(0, 0);
        // this.mArrow7.on("pointerup", this.onRightUpHandler, this);
        const w = this.scene.cameras.main.width / this.scene.cameras.main.zoom;
        const h = this.scene.cameras.main.height / this.scene.cameras.main.zoom;

        this.mMainMenus = [];
        this.mMenuContainer = this.scene.make.container({
            x: w >> 1,
        }, false);
        this.mSubMenus = this.scene.make.container({
            x: w >> 1,
            y: 60 * this.dpr
        }, false);
        this.mMoveMenuContainer = this.scene.make.container(undefined, false);
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

        // this.add(this.mMenuGroup);
        // this.mMenuGroup.addMultiple([this.mOkBtn, this.mTurnBtn, this.mRecycleBtn, this.mCancelBtn])

        // this.mMainMenus = ;
        // this.mSubMenus = ;
        this.add([this.mMenuContainer, this.mSubMenus]);
        this.mMenuContainer.add([this.mOkBtn, this.mTurnBtn, this.mRecycleBtn, this.mCancelBtn]);
        this.mSubMenus.add([this.mHorizontalBtn, this.mMoveBtn, this.mRepeatBtn, this.mExtendBtn]);
        // this.add(this.mSubMenus);
        let mainMenuW = w - 55 * this.dpr * 2;
        this.mMenuContainer.x = -mainMenuW >> 1;
        const list = this.mMenuContainer.list;
        list.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.width);
        let margin = mainMenuW / (list.length - 1);
        for (let i = 1; i < list.length; i++) {
            const preButton = <Phaser.GameObjects.Image> list[i - 1];
            const button = <Phaser.GameObjects.Image> list[i];
            button.x = preButton.width + preButton.x + margin;
        }

        mainMenuW = w - 70 * this.dpr * 2;
        this.mSubMenus.x = -mainMenuW >> 1;
        const subList = this.mSubMenus.list;
        subList.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.width);
        margin = mainMenuW / (subList.length - 1);
        for (let i = 1; i < subList.length; i++) {
            const preButton = <Phaser.GameObjects.Image> subList[i - 1];
            const button = <Phaser.GameObjects.Image> subList[i];
            button.x = preButton.width + preButton.x + margin;
        }

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
        // this.mTurnBtn.on("pointerup", this.onTurnHandler, this);
        // this.mRecycleBtn.on("pointerup", this.onRecycleHandler, this);
        // this.mOkBtn.on("pointerup", this.onPutHandler, this);
    }

    protected unregister() {
        if (!this.mInitialized) {
            return;
        }
        this.mCancelBtn.on("pointerup", this.onCancelHandler, this);
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

    private onPutHandler() {
        this.mWorld.emitter.emit(MessageType.PUT_ELEMENT, this.mDisplayObject);
    }
}

class MoveMenu extends Phaser.GameObjects.Container {
    private mArrow1: Phaser.GameObjects.Image;
    private mArrow3: Phaser.GameObjects.Image;
    private mArrow5: Phaser.GameObjects.Image;
    private mArrow7: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, key: string) {
        super(scene);
        const bg = scene.make.image({
            key,
            frame: "bg.png"
        }, false);

        this.mArrow1 = scene.make.image({
            key,
            frame: "arrow1.png"
        }, false);
        this.mArrow3 = scene.make.image({
            key,
            frame: "arrow3.png"
        }, false);
        this.mArrow5 = scene.make.image({
            key,
            frame: "arrow5.png"
        }, false);
        this.mArrow7 = scene.make.image({
            key,
            frame: "arrow7.png"
        }, false);
        this.add([bg, this.mArrow1, this.mArrow3, this.mArrow5, this.mArrow7]);
    }
}
