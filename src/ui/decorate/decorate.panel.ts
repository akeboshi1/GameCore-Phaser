import { BasePanel } from "../components/BasePanel";
import { Pos } from "../../utils/pos";
import { Position45, IPosition45Obj } from "../../utils/position45";
import { DecorateRoom } from "../../rooms/decorate.room";
import { MessageType } from "../../const/MessageType";
import { Direction, IElement } from "../../rooms/element/element";
import { ISprite } from "../../rooms/element/sprite";
import { Button } from "../components/button";

export class DecoratePanel extends BasePanel {
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
    private mDisplayObject: IElement;
    private mSprite: ISprite;
    private readonly key = "decorate_edit_menu";
    private offset: Pos = new Pos();
    private mScaleRatio: number = 1;

    private mCanPut: boolean;

    constructor(scene: Phaser.Scene, private mRoomService: DecorateRoom) {
        super(scene, mRoomService.world);
        this.setTween(false);
        if (this.mWorld) this.mScaleRatio = this.mWorld.scaleRatio;
    }
    public show(param?: any) {
        this.mData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
    }

    public addListen() {
        if (this.mCancelBtn) this.mCancelBtn.on("pointerup", this.onCancelHandler, this);
        if (this.mOkBtn) this.mOkBtn.on("pointerup", this.onAddHandler, this);
        if (this.mRecycleBtn) this.mRecycleBtn.on("pointerup", this.onRecycleHandler, this);
        if (this.mTurnBtn) this.mTurnBtn.on("pointerup", this.onTurnHandler, this);
        if (this.mMoveBtn) this.mMoveBtn.on("pointerup", this.onShowMoveMenuHandler, this);
        if (this.mRepeatBtn) this.mRepeatBtn.on("pointerup", this.onShowRepeatHandler, this);
        if (this.mExtendBtn) this.mExtendBtn.on("pointerup", this.onShowExtendsHandler, this);
        if (this.mMoveMenuContainer) {
            this.mMoveMenuContainer.register();
            this.mMoveMenuContainer.on("move", this.onMoveHandler, this);
        }
        if (this.mRepeatMenuContainer) {
            this.mRepeatMenuContainer.register();
            this.mRepeatMenuContainer.on("move", this.onRepeatHandler, this);
            this.mRepeatMenuContainer.on("hold", this.onHoldRepeatHandler, this);
        }
    }

    public removeListen() {
        if (this.mCancelBtn) this.mCancelBtn.off("pointerup", this.onCancelHandler, this);
        if (this.mOkBtn) this.mOkBtn.off("pointerup", this.onAddHandler, this);
        if (this.mRecycleBtn) this.mRecycleBtn.off("pointerup", this.onRecycleHandler, this);
        if (this.mTurnBtn) this.mTurnBtn.off("pointerup", this.onTurnHandler, this);
        if (this.mMoveBtn) this.mMoveBtn.off("pointerup", this.onShowMoveMenuHandler, this);
        if (this.mRepeatBtn) this.mRepeatBtn.off("pointerup", this.onShowRepeatHandler, this);
        if (this.mExtendBtn) this.mExtendBtn.off("pointerup", this.onShowExtendsHandler, this);
        if (this.mMoveMenuContainer) {
            this.mMoveMenuContainer.unRegister();
            this.mMoveMenuContainer.off("move", this.onMoveHandler, this);
        }
        if (this.mRepeatMenuContainer) {
            this.mRepeatMenuContainer.unRegister();
            this.mRepeatMenuContainer.off("move", this.onRepeatHandler, this);
            this.mRepeatMenuContainer.off("hold", this.onHoldRepeatHandler, this);
        }
    }

    public setElement(ele: IElement) {
        this.mDisplayObject = ele;
        this.mSprite = ele.model;
        if (!this.mInitialized) {
            return;
        }
        const pos = this.mDisplayObject.getPosition();
        this.x = pos.x;
        this.y = pos.y;

        this.updateArrowPos(ele);
        this.addListen();
    }

    public canPUt(val: boolean) {
        if (val !== this.mCanPut) {
            this.mCanPut = val;
            if (!this.mOkBtn) {
                return;
            }
            if (val) {
                this.mOkBtn.clearTint();
            } else {
                this.mOkBtn.setTint(0x666666);
            }
        }
    }

    public setPosition(x: number, y?: number, z?: number) {
        this.x = x * this.mScaleRatio;
        this.y = (y + this.offset.y) * this.mScaleRatio;
        this.z = z || 0;
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
            const preButton = <Phaser.GameObjects.Image>list[i - 1];
            const button = <Phaser.GameObjects.Image>list[i];
            button.x = preButton.width + preButton.x + margin;
        }

        mainMenuW = w - 70 * this.dpr * this.mWorld.uiScale * 2;
        this.mSubMenus.x = -mainMenuW >> 1;
        const subList = this.mSubMenus.list;
        subList.map((btn: Phaser.GameObjects.Image) => mainMenuW -= btn.width);
        margin = mainMenuW / (subList.length - 1) / zoom;
        for (let i = 1; i < subList.length; i++) {
            const preButton = <Phaser.GameObjects.Image>subList[i - 1];
            const button = <Phaser.GameObjects.Image>subList[i];
            button.x = preButton.width + preButton.x + margin;
        }

        this.mMoveMenuContainer.x = this.mSubMenus.x + this.mMoveBtn.x + this.mMoveBtn.width / 2 + 29 * this.dpr;
        this.mRepeatMenuContainer.x = this.mSubMenus.x + this.mRepeatBtn.x + this.mRepeatBtn.width / 2 + 29 * this.dpr;

        if (this.mCanPut) {
            this.mOkBtn.clearTint();
        } else {
            this.mOkBtn.setTint(0x666666);
        }

        // this.mControllContainer.add([border, this.mTurnBtn, this.mRecycleBtn, this.mConfirmBtn]);
        super.init();

        this.setElement(this.mDisplayObject);
    }

    // protected register() {
    //     if (!this.mInitialized) {
    //         return;
    //     }
    //     this.mCancelBtn.on("pointerup", this.onCancelHandler, this);
    //     this.mOkBtn.on("pointerup", this.onAddHandler, this);
    //     this.mRecycleBtn.on("pointerup", this.onRecycleHandler, this);
    //     this.mTurnBtn.on("pointerup", this.onTurnHandler, this);
    //     this.mMoveBtn.on("pointerup", this.onShowMoveMenuHandler, this);
    //     this.mRepeatBtn.on("pointerup", this.onShowRepeatHandler, this);
    //     this.mExtendBtn.on("pointerup", this.onShowExtendsHandler, this);
    //     this.mMoveMenuContainer.register();
    //     this.mMoveMenuContainer.on("move", this.onMoveHandler, this);
    //     this.mRepeatMenuContainer.register();
    //     this.mRepeatMenuContainer.on("move", this.onRepeatHandler, this);
    //     this.mRepeatMenuContainer.on("hold", this.onHoldRepeatHandler, this);
    //     // this.mTurnBtn.on("pointerup", this.onTurnHandler, this);
    //     // this.mRecycleBtn.on("pointerup", this.onRecycleHandler, this);
    //     // this.mOkBtn.on("pointerup", this.onPutHandler, this);
    // }

    // protected unregister() {
    //     if (!this.mInitialized) {
    //         return;
    //     }
    //     this.mCancelBtn.off("pointerup", this.onCancelHandler, this);
    //     this.mOkBtn.off("pointerup", this.onAddHandler, this);
    //     this.mRecycleBtn.off("pointerup", this.onRecycleHandler, this);
    //     this.mTurnBtn.off("pointerup", this.onTurnHandler, this);
    //     this.mMoveBtn.off("pointerup", this.onShowMoveMenuHandler, this);
    //     this.mRepeatBtn.off("pointerup", this.onShowRepeatHandler, this);
    //     this.mExtendBtn.off("pointerup", this.onShowExtendsHandler, this);
    //     this.mMoveMenuContainer.off("move", this.onMoveHandler, this);
    //     this.mMoveMenuContainer.unRegister();
    //     this.mRepeatMenuContainer.off("move", this.onRepeatHandler, this);
    //     this.mRepeatMenuContainer.off("hold", this.onHoldRepeatHandler, this);
    //     this.mRepeatMenuContainer.unRegister();

    //     // this.mTurnBtn.off("pointerup", this.onTurnHandler, this);
    //     // this.mRecycleBtn.off("pointerup", this.onRecycleHandler, this);
    //     // this.mOkBtn.off("pointerup", this.onPutHandler, this);
    // }

    private onLeftUpHandler() {
        if (!this.mDisplayObject) {
            return;
        }
        const pos45 = this.mRoomService.transformToMini45(this.mDisplayObject.getPosition());
        pos45.x -= 1;
        this.onMoveElement(pos45);
    }

    private onLeftDownHandler() {
        const pos45 = this.mRoomService.transformToMini45(this.mDisplayObject.getPosition());
        pos45.y += 1;
        this.onMoveElement(pos45);
    }

    private onRightUpHandler() {
        const pos45 = this.mRoomService.transformToMini45(this.mDisplayObject.getPosition());
        pos45.y -= 1;
        this.onMoveElement(pos45);
    }

    private onRightDownHandler() {
        const pos45 = this.mRoomService.transformToMini45(this.mDisplayObject.getPosition());
        pos45.x = pos45.x + 1;
        this.onMoveElement(pos45);
    }

    private getNorthWestPoints(count: number = 10) {
        const area = this.mSprite.currentCollisionArea;
        const origin = this.mSprite.currentCollisionPoint;
        const posList = [];
        const pos45 = this.mRoomService.transformToMini45(this.mSprite.pos);
        for (let i = 0; i < count; i++) {
            posList[i] = this.mRoomService.transformToMini90(pos45);
            pos45.x -= area[0].length;
        }
        return this.checkNextPos(posList, area, origin);
    }

    private getWestSouthPoints(count: number = 10) {
        const area = this.mSprite.currentCollisionArea;
        const origin = this.mSprite.currentCollisionPoint;
        const posList = [];
        const pos45 = this.mRoomService.transformToMini45(this.mSprite.pos);
        for (let i = 0; i < count; i++) {
            posList[i] = this.mRoomService.transformToMini90(pos45);
            pos45.y += area.length;
        }
        return this.checkNextPos(posList, area, origin);
    }

    private getSouthEastPoints(count: number = 10) {
        const area = this.mSprite.currentCollisionArea;
        const origin = this.mSprite.currentCollisionPoint;
        const posList = [];
        const pos45 = this.mRoomService.transformToMini45(this.mSprite.pos);
        for (let i = 0; i < count; i++) {
            posList[i] = this.mRoomService.transformToMini90(pos45);
            pos45.x += area[0].length;
        }
        return this.checkNextPos(posList, area, origin);
    }

    private getEastNorthPoints(count: number = 10) {
        const area = this.mSprite.currentCollisionArea;
        const origin = this.mSprite.currentCollisionPoint;
        const posList = [];
        const pos45 = this.mRoomService.transformToMini45(this.mSprite.pos);
        for (let i = 0; i < count; i++) {
            posList[i] = this.mRoomService.transformToMini90(pos45);
            pos45.y -= area.length;
        }
        return this.checkNextPos(posList, area, origin);
    }

    private checkNextPos(pos45: Pos[], collisionArea: number[][], origin: Phaser.Geom.Point) {
        const result = [];
        for (const pos of pos45) {
            const nextPos = this.getNextRepeatPos(pos, collisionArea, origin);
            if (nextPos) {
                result.push(nextPos);
            } else {
                break;
            }
        }
        return result;
    }

    private getNextRepeatPos(pos: Pos, collisionArea: number[][], origin: Phaser.Geom.Point) {
        if (this.mRoomService.canPut(pos, collisionArea, origin)) {
            return pos;
        }
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

    private updateArrowPos(ele: IElement) {
        if (!ele || !ele.model || !ele.getDisplay()) {
            return;
        }
        // return;
        const display = ele.getDisplay();
        let rows = ele.model.currentCollisionArea.length;
        let cols = ele.model.currentCollisionArea[0].length;

        rows = this.validateGrid(rows);
        cols = this.validateGrid(cols);
        if (ele.getDisplay().scaleX === -1) {
            [rows, cols] = [cols, rows];
        }

        const miniSize = this.mRoomService.roomSize;
        const position: IPosition45Obj = {
            rows,
            cols,
            tileWidth: miniSize.tileWidth / 2,
            tileHeight: miniSize.tileHeight / 2,
        };

        // const reference = ele.getElement("reference");
        // if (!reference) {
        //     return;
        // }
        const sprite = ele.model;
        const pos = Position45.transformTo90(new Pos(cols - sprite.currentCollisionPoint.y, rows - sprite.currentCollisionPoint.x), position);
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
        if (this.mCanPut) {
            this.mWorld.emitter.emit(MessageType.PUT_ELEMENT, this.mDisplayObject);
        }
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
        let result = null;
        switch (dir) {
            case Direction.north_west:
                result = this.getNorthWestPoints(2);
                break;
            case Direction.west_south:
                result = this.getWestSouthPoints(2);
                break;
            case Direction.south_east:
                result = this.getSouthEastPoints(2);
                break;
            case Direction.east_north:
                result = this.getEastNorthPoints(2);
                break;
        }
        this.onSendAddSingleSprite(result);
    }

    private onHoldRepeatHandler(dir: Direction) {
        let result = null;
        switch (dir) {
            case Direction.north_west:
                result = this.getNorthWestPoints();
                break;
            case Direction.west_south:
                result = this.getWestSouthPoints();
                break;
            case Direction.south_east:
                result = this.getSouthEastPoints();
                break;
            case Direction.east_north:
                result = this.getEastNorthPoints();
                break;
        }
        this.onSendAddSprites(result);
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

    private onSendAddSprites(points: Pos[]) {
        if (points.length > 1) {
            this.emit("addSprite", this.mSprite, points);
        }
    }

    private onSendAddSingleSprite(points: Pos[]) {
        if (points.length > 1) {
            this.emit("addSingleSprite", this.mSprite, points);
        }
    }
}

class MoveMenu extends Phaser.GameObjects.Container {
    private mBtns: Button[];
    private mArrow1: Button;
    private mArrow3: Button;
    private mArrow5: Button;
    private mArrow7: Button;
    constructor(scene: Phaser.Scene, key: string, dpr: number = 1, uiScale: number = 1) {
        super(scene);
        const bg = scene.make.image({
            key,
            frame: "bg.png"
        }, false);
        this.setSize(bg.displayWidth, bg.displayHeight);

        // this.mArrow1 = scene.make.image({
        //     key,
        //     frame: "arrow_1.png"
        // }, false).setInteractive().setData("dir", 1);

        // this.mArrow3 = scene.make.image({
        //     key,
        //     frame: "arrow_3.png"
        // }, false).setInteractive().setData("dir", 3);
        // this.mArrow5 = scene.make.image({
        //     key,
        //     frame: "arrow_5.png"
        // }, false).setInteractive().setData("dir", 5);
        // this.mArrow7 = scene.make.image({
        //     key,
        //     frame: "arrow_7.png"
        // }, false).setInteractive().setData("dir", 7);
        this.mArrow1 = new Button(this.scene, key, "arrow_1.png").setData("dir", Direction.north_west);
        this.mArrow3 = new Button(this.scene, key, "arrow_3.png").setData("dir", Direction.west_south);
        this.mArrow5 = new Button(this.scene, key, "arrow_5.png").setData("dir", Direction.south_east);
        this.mArrow7 = new Button(this.scene, key, "arrow_7.png").setData("dir", Direction.east_north);
        this.mBtns = [this.mArrow1, this.mArrow3, this.mArrow5, this.mArrow7];
        this.add(bg);
        this.add(this.mBtns);

        const w = this.width;
        let totalWidth = this.width - 20 * dpr;
        this.mBtns.map((btn) => totalWidth -= btn.displayWidth);
        const space = totalWidth = totalWidth / (this.mBtns.length - 1);
        const arrowH = (3 * dpr);
        for (let i = 0; i < this.mBtns.length; i++) {
            if (i === 0) {
                this.mBtns[i].x = 10 * dpr + this.mBtns[i].width / 2 - this.width / 2;
            } else {
                this.mBtns[i].x = space + this.mBtns[i - 1].x + this.mBtns[i - 1].width;
            }
            this.mBtns[i].y = arrowH;
        }
        this.setInteractive();
    }

    public register() {
        // for (const btn of this.mBtns) {
        //     btn.on("pointerup", this.onArrowHandler, this);
        // }
        this.mArrow1.on("hold", this.onHoldHandler, this);
        this.mArrow1.on("click", this.onClickHandler, this);
        this.mArrow3.on("hold", this.onHoldHandler, this);
        this.mArrow3.on("click", this.onClickHandler, this);
        this.mArrow5.on("hold", this.onHoldHandler, this);
        this.mArrow5.on("click", this.onClickHandler, this);
        this.mArrow7.on("hold", this.onHoldHandler, this);
        this.mArrow7.on("click", this.onClickHandler, this);
        // this.mArrow1.on("pointerup", this.onArrow1Handler, this);
        // this.mArrow3.on("pointerup", this.onArrow3Handler, this);
        // this.mArrow5.on("pointerup", this.onArrow5Handler, this);
        // this.mArrow7.on("pointerup", this.onArrow7Handler, this);
    }

    public unRegister() {
        this.mArrow1.off("hold", this.onHoldHandler, this);
        this.mArrow1.off("click", this.onClickHandler, this);
        this.mArrow3.off("hold", this.onHoldHandler, this);
        this.mArrow3.off("click", this.onClickHandler, this);
        this.mArrow5.off("hold", this.onHoldHandler, this);
        this.mArrow5.off("click", this.onClickHandler, this);
        this.mArrow7.off("hold", this.onHoldHandler, this);
        this.mArrow7.off("click", this.onClickHandler, this);
        // this.mArrow1.off("pointerup", this.onArrow1Handler, this);
        // this.mArrow3.off("pointerup", this.onArrow3Handler, this);
        // this.mArrow5.off("pointerup", this.onArrow5Handler, this);
        // this.mArrow7.off("pointerup", this.onArrow7Handler, this);
    }

    private onArrow1Handler(pointer: Phaser.Input.Pointer) {
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

    private onHoldHandler(gameobject) {
        this.emit("hold", gameobject.getData("dir"));
    }

    private onClickHandler(pointer, gameobject) {
        this.emit("move", gameobject.getData("dir"));
    }
}
