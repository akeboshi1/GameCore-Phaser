import {Panel} from "../components/panel";
import {Border, Url} from "../../utils/resUtil";
import {NinePatch} from "../components/nine.patch";
import { FramesDisplay } from "../../rooms/display/frames.display";
import { DragonbonesDisplay } from "../../rooms/display/dragonbones.display";
import { EditorRoomService } from "../../rooms/editor.room";
import { DisplayObject } from "../../rooms/display/display.object";
import { Pos } from "../../utils/pos";
import { Position45, IPosition45Obj } from "../../utils/position45";
import { IRoomService } from "../../rooms/room";
import { Logger } from "../../utils/log";

export class DecoratePanel extends Panel {
    private readonly resKey = "decorate";
    private mControllContainer: Phaser.GameObjects.Container;
    private mTurnBtn: Phaser.GameObjects.Image;
    private mPutBtn: Phaser.GameObjects.Image;
    private mConfirmBtn: Phaser.GameObjects.Image;

    private mArrow1: Phaser.GameObjects.Image;
    private mArrow3: Phaser.GameObjects.Image;
    private mArrow5: Phaser.GameObjects.Image;
    private mArrow7: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, private mRoomService: IRoomService) {
        super(scene, null);
        this.setTween(false);
    }

    public setElement(ele: DisplayObject) {
        this.x = ele.x;
        this.y = ele.y;
        const rows = ele.collisionArea.length;
        const cols = ele.collisionArea[0].length;
        const originPoint = ele.originPoint;
        const miniSize = this.mRoomService.roomSize;
        const position: IPosition45Obj = {
            rows,
            cols,
            tileWidth: miniSize.tileWidth / 2,
            tileHeight: miniSize.tileHeight / 2,
        };


        let pos = Position45.transformTo90(new Pos(rows + originPoint[0], (cols >> 1) + originPoint[1]), position);
        Logger.getInstance().log("pos5", pos);
        if (this.mArrow5) {
            this.mArrow5.x = pos.x + this.mArrow5.width;
            this.mArrow5.y = pos.y;
        }

        // pos = Position45.transformTo90(new Pos(rows >> 1, cols), position);
        // Logger.getInstance().log("pos3", pos);
        // if (this.mArrow3) {
        //     this.mArrow3.x = pos.x - this.mArrow3.width;
        //     this.mArrow3.y = pos.y;
        // }

    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.atlas(this.resKey, Url.getRes("ui/decorate/decorate_atlas.png"), Url.getRes("ui/decorate/decorate_atlas.json"));
        super.preload();
    }

    protected init() {
        this.mControllContainer = this.scene.make.container({ y: -100 }, false);
        const border = new NinePatch(this.scene, 0, 0, 196, 70, Border.getName(), null, Border.getConfig());

        this.mTurnBtn = this.createImage(this.resKey, "turn_btn.png", -57, 0);
        this.mPutBtn = this.createImage(this.resKey, "put_btn.png", 0, 0);
        this.mConfirmBtn = this.createImage(this.resKey, "confirm_btn.png", 57, 0);

        this.mArrow1 = this.createImage(this.resKey, "dir_1.png", 0, 0);
        this.mArrow1.on("pointerup", this.onLeftUpHandler, this);
        this.mArrow3 = this.createImage(this.resKey, "dir_3.png", 0, 300);
        this.mArrow3.on("pointerup", this.onLeftDownHandler, this);
        this.mArrow5 = this.createImage(this.resKey, "dir_1.png", 300, 300).setScale(-1);
        this.mArrow5.on("pointerup", this.onRightUpHandler, this);
        this.mArrow7 = this.createImage(this.resKey, "dir_3.png", 300, 100).setScale(-1);
        this.mArrow7.on("pointerup", this.onRightDownHandler, this);

        this.add([this.mControllContainer, this.mArrow5]);
        this.mControllContainer.add([border, this.mTurnBtn, this.mPutBtn, this.mConfirmBtn]);
        super.init();

        this.x = 700;
        this.y = 300;
    }

    private onLeftUpHandler() {
    }

    private onLeftDownHandler() {
    }

    private onRightUpHandler() {
    }

    private onRightDownHandler() {

    }

    private onMoveElement() {
        // this.emit()
    }

    private createImage(key: string, frame?: string, x?: number, y?: number): Phaser.GameObjects.Image {
        return this.scene.make.image({ key, frame, x, y }, false).setOrigin(0, 0).setInteractive();
    }
}
