import { BasePanel } from "../Components/BasePanel";
import { DecorateRoom } from "../../rooms/decorate.room";
import { Direction, IElement } from "../../rooms/element/element";
import { ISprite } from "../../rooms/element/sprite";
import { Button, ClickEvent } from "apowophaserui";
import { Pos } from "../../../../utils/pos";
import { IPosition45Obj } from "../../../../utils/iposition45";
import { Position45 } from "../../../../utils/position45";
import { MessageType } from "../../../../const/MessageType";
export class DecoratePanel extends BasePanel {
    private readonly resKey = "decorate";
    private readonly minGrid: number = 2;
    private readonly maxGrid: number = 10;
    private mControllContainer: Phaser.GameObjects.Container;
    private mTurnBtn: Button;
    private mRecycleBtn: Button;
    private mOkBtn: Button;
    private mCancelBtn: Button;
    private mMenuContainer: Phaser.GameObjects.Container;
    private mMainMenus: Button[];

    private mHorizontalBtn: Button;
    private mMoveBtn: Button;
    private mRepeatBtn: Button;
    private mExtendBtn: Button;
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
        this.mShowData = param;
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
        if (this.mCancelBtn) this.mCancelBtn.on(String(ClickEvent.Tap), this.onCancelHandler, this);
        if (this.mOkBtn) this.mOkBtn.on(String(ClickEvent.Tap), this.onAddHandler, this);
        if (this.mRecycleBtn) this.mRecycleBtn.on(String(ClickEvent.Tap), this.onRecycleHandler, this);
        if (this.mTurnBtn) this.mTurnBtn.on(String(ClickEvent.Tap), this.onTurnHandler, this);
        if (this.mMoveBtn) this.mMoveBtn.on(String(ClickEvent.Tap), this.onShowMoveMenuHandler, this);
        if (this.mRepeatBtn) this.mRepeatBtn.on(String(ClickEvent.Tap), this.onShowRepeatHandler, this);
        if (this.mExtendBtn) this.mExtendBtn.on(String(ClickEvent.Tap), this.onShowExtendsHandler, this);
        if (this.mMoveMenuContainer) {
            this.mMoveMenuContainer.register();
            this.mMoveMenuContainer.on("tap", this.onMoveHandler, this);
        }
        if (this.mRepeatMenuContainer) {
            this.mRepeatMenuContainer.register();
            this.mRepeatMenuContainer.on("tap", this.onRepeatHandler, this);
            this.mRepeatMenuContainer.on("hold", this.onHoldRepeatHandler, this);
        }
    }

    public removeListen() {
        if (this.mCancelBtn) this.mCancelBtn.off(String(ClickEvent.Tap), this.onCancelHandler, this);
        if (this.mOkBtn) this.mOkBtn.off(String(ClickEvent.Tap), this.onAddHandler, this);
        if (this.mRecycleBtn) this.mRecycleBtn.off(String(ClickEvent.Tap), this.onRecycleHandler, this);
        if (this.mTurnBtn) this.mTurnBtn.off(String(ClickEvent.Tap), this.onTurnHandler, this);
        if (this.mMoveBtn) this.mMoveBtn.off(String(ClickEvent.Tap), this.onShowMoveMenuHandler, this);
        if (this.mRepeatBtn) this.mRepeatBtn.off(String(ClickEvent.Tap), this.onShowRepeatHandler, this);
        if (this.mExtendBtn) this.mExtendBtn.off(String(ClickEvent.Tap), this.onShowExtendsHandler, this);
        if (this.mMoveMenuContainer) {
            this.mMoveMenuContainer.unRegister();
            this.mMoveMenuContainer.off("tap", this.onMoveHandler, this);
        }
        if (this.mRepeatMenuContainer) {
            this.mRepeatMenuContainer.unRegister();
            this.mRepeatMenuContainer.off("tap", this.onRepeatHandler, this);
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
            this.mOkBtn.enable = val;
            // if (val) {
            //     this.mOkBtn.clearTint();
            // } else {
            //     this.mOkBtn.setTint(0x666666);
            // }
        }
    }

    public setPos(x: number, y?: number, z?: number): this {
        this.x = x * this.mScaleRatio;
        this.y = (y + this.offset.y) * this.mScaleRatio;
        this.z = z || 0;
        return this;
    }

    public destroy() {
        if (this.mRepeatMenuContainer) {
            this.mRepeatMenuContainer.destroy();
        }
        if (this.mMoveMenuContainer) {
            this.mMoveMenuContainer.destroy();
        }
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

        this.mOkBtn = new Button(this.scene, this.key, "ok_btn.png");
        this.mRecycleBtn = new Button(this.scene, this.key, "recycly_btn.png");
        this.mTurnBtn = new Button(this.scene, this.key, "turn_btn.png");
        this.mCancelBtn = new Button(this.scene, this.key, "cancel_btn.png");
        this.mMenuContainer.y = this.mOkBtn.height * 0.5;
        this.mSubMenus.y = this.mMenuContainer.y + 60 * this.dpr;

        // this.mOkBtn = this.scene.make.image({
        //     key: this.key,
        //     frame: "ok_btn.png"
        // }, false).setInteractive().setOrigin(0);

        // this.mRecycleBtn = this.scene.make.image({
        //     key: this.key,
        //     frame: "recycly_btn.png"
        // }, false).setInteractive().setOrigin(0);
        // this.mTurnBtn = this.scene.make.image({
        //     key: this.key,
        //     frame: "turn_btn.png"
        // }, false).setInteractive().setOrigin(0);

        // this.mCancelBtn = this.scene.make.image({
        //     key: this.key,
        //     frame: "cancel_btn.png"
        // }, false).setInteractive().setOrigin(0);
        // this.add([this.mControllContainer, this.mArrow1, this.mArrow7, this.mArrow3, this.mArrow5]);

        this.mHorizontalBtn = new Button(this.scene, this.key, "horizontal_btn.png");
        this.mMoveBtn = new Button(this.scene, this.key, "move_btn.png");
        this.mRepeatBtn = new Button(this.scene, this.key, "repeat_btn.png");
        this.mExtendBtn = new Button(this.scene, this.key, "extend_btn.png");
        // this.mHorizontalBtn = this.scene.make.image({
        //     key: this.key,
        //     frame: "horizontal_btn.png"
        // }, false).setInteractive().setOrigin(0);

        // this.mMoveBtn = this.scene.make.image({
        //     key: this.key,
        //     frame: "move_btn.png"
        // }, false).setInteractive().setOrigin(0);

        // this.mRepeatBtn = this.scene.make.image({
        //     key: this.key,
        //     frame: "repeat_btn.png"
        // }, false).setInteractive().setOrigin(0);

        // this.mExtendBtn = this.scene.make.image({
        //     key: this.key,
        //     frame: "extend_btn.png"
        // }, false).setInteractive().setOrigin(0);

        this.mMoveMenuContainer = new MoveMenu(this.scene, this.key, this.dpr, this.scale);
        this.mMoveMenuContainer.y = this.mSubMenus.y + 15 * this.dpr + this.mMoveMenuContainer.height;

        this.mRepeatMenuContainer = new MoveMenu(this.scene, this.key, this.dpr, this.scale);
        this.mRepeatMenuContainer.y = this.mMoveMenuContainer.y;

        const zoom = this.scale;

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

        this.mMoveMenuContainer.x = this.mSubMenus.x + this.mMoveBtn.x + 29 * this.dpr;
        this.mRepeatMenuContainer.x = this.mSubMenus.x + this.mRepeatBtn.x + 29 * this.dpr;

        // if (this.mCanPut) {
        //     this.mOkBtn.clearTint();
        // } else {
        //     this.mOkBtn.setTint(0x666666);
        // }
        this.mOkBtn.enable = this.mCanPut;

        super.init();

        this.setElement(this.mDisplayObject);
    }

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

        const sprite = ele.model;
        const pos = Position45.transformTo90(new Pos(cols - sprite.currentCollisionPoint.y, rows - sprite.currentCollisionPoint.x), position);
        this.offset.y = pos.y;

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
    private mBtns: any[];
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

        this.mArrow1 = new Button(this.scene, key, "arrow_1.png");
        this.mArrow1.setData("dir", Direction.north_west);
        this.mArrow3 = new Button(this.scene, key, "arrow_3.png");
        this.mArrow3.setData("dir", Direction.west_south);
        this.mArrow5 = new Button(this.scene, key, "arrow_5.png");
        this.mArrow5.setData("dir", Direction.south_east);
        this.mArrow7 = new Button(this.scene, key, "arrow_7.png");
        this.mArrow7.setData("dir", Direction.east_north);
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
        this.mArrow1.on("Hold", this.onHoldHandler, this);
        this.mArrow1.on("Tap", this.onClickHandler, this);
        this.mArrow3.on("Hold", this.onHoldHandler, this);
        this.mArrow3.on("Tap", this.onClickHandler, this);
        this.mArrow5.on("Hold", this.onHoldHandler, this);
        this.mArrow5.on("Tap", this.onClickHandler, this);
        this.mArrow7.on("Hold", this.onHoldHandler, this);
        this.mArrow7.on("Tap", this.onClickHandler, this);
    }

    public unRegister() {
        this.mArrow1.off("Hold", this.onHoldHandler, this);
        this.mArrow1.off("Tap", this.onClickHandler, this);
        this.mArrow3.off("Hold", this.onHoldHandler, this);
        this.mArrow3.off("Tap", this.onClickHandler, this);
        this.mArrow5.off("Hold", this.onHoldHandler, this);
        this.mArrow5.off("Tap", this.onClickHandler, this);
        this.mArrow7.off("Hold", this.onHoldHandler, this);
        this.mArrow7.off("Tap", this.onClickHandler, this);
    }

    private onHoldHandler(gameobject) {
        this.emit("hold", gameobject.getData("dir"));
    }

    private onClickHandler(pointer, gameobject) {
        this.emit("tap", gameobject.getData("dir"));
    }
}
