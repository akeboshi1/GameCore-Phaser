import {Panel} from "../components/panel";
import {Border, Url} from "../../utils/resUtil";
import {NinePatch} from "../components/nine.patch";
import { DisplayObject } from "../../rooms/display/display.object";
import { Pos } from "../../utils/pos";
import { Position45, IPosition45Obj } from "../../utils/position45";
import { IRoomService } from "../../rooms/room";
import { DecorateRoom } from "../../rooms/decorate.room";
import { Logger } from "../../utils/log";

export class DecoratePanel extends Panel {
    private readonly resKey = "decorate";
    private readonly minGrid: number = 2;
    private readonly maxGrid: number = 10;
    private mControllContainer: Phaser.GameObjects.Container;
    private mTurnBtn: Phaser.GameObjects.Image;
    private mPutBtn: Phaser.GameObjects.Image;
    private mConfirmBtn: Phaser.GameObjects.Image;

    private mArrow1: Phaser.GameObjects.Image;
    private mArrow3: Phaser.GameObjects.Image;
    private mArrow5: Phaser.GameObjects.Image;
    private mArrow7: Phaser.GameObjects.Image;
    private mDisplayObject: DisplayObject;

    constructor(scene: Phaser.Scene, private mRoomService: DecorateRoom) {
        super(scene, null);
        this.setTween(false);
    }

    public setElement(ele: DisplayObject) {
        this.mDisplayObject = ele;
        if (!this.mInitialized) {
            return;
        }
        this.x = ele.x;
        this.y = ele.y;

        this.updateArrowPos(ele);
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image("arrow", Url.getRes("ui/common/common_arrow.png"));
        this.scene.load.atlas(this.resKey, Url.getRes("ui/decorate/decorate_atlas.png"), Url.getRes("ui/decorate/decorate_atlas.json"));
        super.preload();
    }

    protected init() {
        this.mControllContainer = this.scene.make.container({ y: -100 }, false);
        const border = new NinePatch(this.scene, 0, 0, 196, 70, Border.getName(), null, Border.getConfig());

        this.mTurnBtn = this.createImage(this.resKey, "turn_btn.png", -60, 0);
        this.mPutBtn = this.createImage(this.resKey, "put_btn.png", 0, 0);
        this.mConfirmBtn = this.createImage(this.resKey, "confirm_btn.png", 60, 0);
        const arrow = this.scene.make.image({
            key: "arrow",
            y: 46
        }).setAngle(90);
        this.mControllContainer.add(arrow);

        this.mArrow1 = this.createImage(this.resKey, "arrow_1.png", 0, 0).setOrigin(0, 0);
        this.mArrow1.on("pointerup", this.onLeftUpHandler, this);
        this.mArrow3 = this.createImage(this.resKey, "arrow_3.png", 0, 300).setOrigin(0, 0);
        this.mArrow3.on("pointerup", this.onLeftDownHandler, this);
        this.mArrow5 = this.createImage(this.resKey, "arrow_5.png", 300, 300).setOrigin(0, 0);
        this.mArrow5.on("pointerup", this.onRightDownHandler, this);
        this.mArrow7 = this.createImage(this.resKey, "arrow_7.png", 300, 100).setOrigin(0, 0);
        this.mArrow7.on("pointerup", this.onRightUpHandler, this);

        this.add([this.mControllContainer, this.mArrow1, this.mArrow7, this.mArrow3, this.mArrow5]);
        this.mControllContainer.add([border, this.mTurnBtn, this.mPutBtn, this.mConfirmBtn]);
        super.init();

        this.setElement(this.mDisplayObject);
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
        const position = this.mRoomService.transformToMini90(pos45);
        const canPut = this.mRoomService.canPut(pos45, this.mDisplayObject.collisionArea, this.mDisplayObject.originPoint);
        if (canPut) {
            const area = this.mDisplayObject.collisionArea;
            const origin = this.mDisplayObject.originPoint;
            let p = this.mRoomService.transformToMini45(new Pos(position.x, position.y));
            for (let i = 0; i < area.length; i++) {
                for (let j = 0; j < area[0].length; j++) {
                  // 避免影响到其他物件
                  if (area[i][j] === 1) this.mRoomService.setMap(p.x + i - origin.x, p.y + j - origin.y, 0);
                }
            }
            this.mDisplayObject.setPosition(position.x, position.y);
            p = this.mRoomService.transformToMini45(new Pos(position.x, position.y));
            for (let i = 0; i < area.length; i++) {
                for (let j = 0; j < area[0].length; j++) {
                  // 避免影响到其他物件
                  if (area[i][j] === 1) this.mRoomService.setMap(p.x + i - origin.x, p.y + j - origin.y, 1);
                }
            }
        }
    }

    private createImage(key: string, frame?: string, x?: number, y?: number): Phaser.GameObjects.Image {
        return this.scene.make.image({ key, frame, x, y }, false).setInteractive();
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

        let pos = Position45.transformTo90(new Pos(cols, (rows / 2)), position);
        if (this.mArrow5) {
            this.mArrow5.x = pos.x + reference.x;
            this.mArrow5.y = pos.y + reference.y;
        }

        pos = Position45.transformTo90(new Pos((cols / 2), rows), position);
        if (this.mArrow3) {
            this.mArrow3.x = pos.x - this.mArrow3.width + reference.x;
            this.mArrow3.y = pos.y + reference.y;
        }

        pos = Position45.transformTo90(new Pos(0, (rows / 2)), position);
        if (this.mArrow1) {
            this.mArrow1.x = pos.x - this.mArrow1.width + reference.x;
            this.mArrow1.y = pos.y - this.mArrow1.height + reference.y;
        }

        pos = Position45.transformTo90(new Pos((cols / 2), 0), position);
        if (this.mArrow7) {
            this.mArrow7.x = pos.x + reference.x;
            this.mArrow7.y = pos.y - this.mArrow7.height + reference.y;
        }
    }
}
