import {TerrainImageItem} from "./TerrainImageItem";
import {RoomNode} from "../grid/RoomNode";
import {TerrainSceneLayer} from "../TerrainSceneLayer";
import Globals from "../../Globals";

export class TerrainNullItem extends TerrainImageItem {
    protected mCurrentNode: RoomNode;

    public constructor(game: Phaser.Game, owner: TerrainSceneLayer) {
        super(game, owner);
    }


    public onFrame(deltaTime: number): void {
        // this.mTerrainItemIsInCamera = Globals.Tool.isRectangleOverlap(this.camera.scrollX, this.camera.scrollY,
        //     this.camera.width, this.camera.height, this.itemX, this.itemY, this.itemWidth, this.itemHeight)
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
        
        this.setPosition(this.itemX, this.itemY, this.itemZ);
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