import "phaser-ce";
import {TerrainImageItem} from "./TerrainImageItem";
import {RoomNode} from "../grid/RoomNode";
import {TerrainSceneLayer} from "../view/TerrainSceneLayer";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";

export class TerrainNullItem extends TerrainImageItem {
    protected mCurrentNode: RoomNode;

    public constructor(game: Phaser.Game, owner: TerrainSceneLayer) {
        super(game, owner);
        this.terrainIsoDisplayObject = this.game.add.isoSprite(0, 0, 0);
        this.terrainIsoDisplayObject.anchor.set(0.5, 0);
        this.add(this.terrainIsoDisplayObject);
        this.draw();
    }


    public onFrame(deltaTime: number): void {
        let p2 = Globals.Room45Util.p3top2(this.isoX, this.isoY, this.isoZ);
        this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.x, this.camera.y,
            this.camera.width, this.camera.height, p2.x, p2.y, this.itemWidth, this.itemHeight);
        if (this.mTerrainItemIsInCamera) {
            this.mTerrainItemOutCameraTime = 0;
            this.visible = true;
        } else {
            this.mTerrainItemOutCameraTime += deltaTime;
            if (this.mTerrainItemOutCameraTime > Const.GameConst.OUT_OF_CAMERA_RELEASE_WAITE_TIME) {
                this.mTerrainItemOutCameraTime = 0;
            }
            this.visible = false;
        }

        if (this.terrainIsoDisplayObject) {
            this.terrainIsoDisplayObject.isoX = this.isoX;
            this.terrainIsoDisplayObject.isoY = this.isoY;
            this.terrainIsoDisplayObject.isoZ = this.isoZ;
        }
    }

    public releaseNodeWalable(): void {
        if (this.mCurrentNode != null) {
            this.mCurrentNode.walkable = true;
            this.mCurrentNode.terrainContent = null;
        }
    }

    public updateNodeWalkAble(node: RoomNode): void {
        this.releaseNodeWalable();


        this.mCurrentNode = node;

        if (this.mCurrentNode != null) {
            this.mCurrentNode.walkable = true;
            this.mCurrentNode.terrainType = 0;
            this.mCurrentNode.terrainContent = this;
        }
    }

    protected draw(): void {
        let graphics = Globals.game.make.graphics();
        graphics.clear();
        // graphics.lineStyle(2, 0xff0000, 1);
        graphics.beginFill(0xff0000);
        graphics.drawCircle(0, 0, 2);
        graphics.endFill();
        this.terrainIsoDisplayObject.addChild(graphics);
    }
}