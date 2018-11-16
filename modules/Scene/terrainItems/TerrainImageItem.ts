import {BasicTerrainItem} from "./BasicTerrainItem";
import {TerrainSceneLayer} from "../view/TerrainSceneLayer";
import BitmapData = Phaser.BitmapData;
import Globals from "../../../Globals";
import {Const} from "../../../common/const/Const";
import {Images} from "../../../Assets";

export class TerrainImageItem extends BasicTerrainItem {
    private bmd: BitmapData;
    public constructor(game: Phaser.Game, owner: TerrainSceneLayer) {
        super(game, owner);
    }

    protected onTerrainItemCreate(): void {

        this.terrainIsoDisplayObject = this.game.add.isoSprite(0, 0, 0);
        this.terrainIsoDisplayObject.anchor.set(0.5, 0);
        this.draw();
        super.onTerrainItemCreate();
    }

    public releaseTerrainItem() {
        if (this.bmd) this.bmd.destroy();
        this.bmd = null;
        super.releaseTerrainItem();
    }

    protected onTerrainItemLoad(): void {
        super.onTerrainItemLoad();
        if (Globals.game.cache.checkImageKey(Images.ImagesTile.getName(this.data.type))) {
            this.onTerrainItemLoadComplete();
        } else {
            Globals.game.load.onLoadComplete.addOnce(this.onTerrainItemLoadComplete, this);
            Globals.game.load.image(Images.ImagesTile.getName(this.data.type), Images.ImagesTile.getPNG(this.data.type));
            Globals.game.load.start();
        }
    }


    protected onTerrainItemLoadComplete(): void {
        // if(this.bmd)
        //     Log.trace("full--------------------------------------");
        // else
        //     Log.trace("kong--------------------------------------");
        this.bmd = this.game.make.bitmapData(Const.GameConst.MAP_TILE_WIDTH, Const.GameConst.MAP_TILE_HEIGHT + Const.GameConst.MAP_TILE_DEPTH);
        let rect = new Phaser.Rectangle(Const.GameConst.MAP_TILE_WIDTH * this.data.subIdx, (Const.GameConst.MAP_TILE_HEIGHT + Const.GameConst.MAP_TILE_DEPTH) * this.data.colorIdx, Const.GameConst.MAP_TILE_WIDTH, Const.GameConst.MAP_TILE_HEIGHT + Const.GameConst.MAP_TILE_DEPTH);
        this.bmd.copyRect(Images.ImagesTile.getName(this.data.type), rect);
        this.terrainIsoDisplayObject.loadTexture(this.bmd);
        super.onTerrainItemLoadComplete();
    }

    protected draw(): void {
        // let graphics = Globals.game.make.graphics();
        // graphics.clear();
        // // graphics.lineStyle(2, 0xff0000, 1);
        // graphics.beginFill(0xff0000);
        // graphics.drawCircle(0,0,2);
        // graphics.endFill();
        // this.terrainIsoDisplayObject.addChild(graphics);
    }
}
