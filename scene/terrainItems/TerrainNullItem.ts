import {TerrainImageItem} from "./TerrainImageItem";
import {RoomNode} from "../grid/RoomNode";
import {TerrainSceneLayer} from "../TerrainSceneLayer";
import Globals from "../../Globals";

export class TerrainNullItem extends TerrainImageItem {
    protected mCurrentNode: RoomNode;

    public constructor(game: Phaser.Game, owner: TerrainSceneLayer) {
        super(game, owner);
        this.terrainIsoDisplayObject = this.game.add.isoSprite(0, 0, 0);
        this.terrainIsoDisplayObject.anchor.set(0.5,0);
        this.add(this.terrainIsoDisplayObject);
        this.draw();
    }


    public onFrame(deltaTime: number): void {
        // this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.scrollX, this.camera.scrollY,
        //     this.camera.width, this.camera.height, this.isoX, this.isoY, this.itemWidth, this.itemHeight)
        // if (this.mTerrainItemIsInCamera) {
        //     this.mTerrainItemOutCameraTime = 0;
        //     this.visible = true;
        // } else {
        //     this.mTerrainItemOutCameraTime += deltaTime;
        //     if (this.mTerrainItemOutCameraTime > Core.OUT_OF_CAMERA_RELEASE_WAITE_TIME) {
        //         this.mTerrainItemOutCameraTime = 0;
        //     }
        //     this.visible = false;
        // }

        if (this.terrainIsoDisplayObject) {
            this.terrainIsoDisplayObject.isoX = this.isoX;
            this.terrainIsoDisplayObject.isoY = this.isoY;
            this.terrainIsoDisplayObject.isoZ = this.isoZ;
        }
        this.visible = true;
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
}