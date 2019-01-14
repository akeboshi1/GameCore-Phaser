import {BasicTerrainItem} from "./BasicTerrainItem";
import BitmapData = Phaser.BitmapData;
import Globals from "../../../Globals";
import {Const} from "../../../common/const/Const";
import {Images} from "../../../Assets";
import {ITerrainLayer} from "../view/ITerrainLayer";

export class TerrainImageItem extends BasicTerrainItem {
    private bmd: BitmapData;

    public constructor(game: Phaser.Game, owner: ITerrainLayer) {
        super(game, owner);
    }

    protected releaseTerrainItem() {
        super.releaseTerrainItem();
        if (this.bmd) this.bmd.destroy();
        this.bmd = null;
    }

    protected onTerrainItemCreate(): void {
        this.terrainIsoDisplayObject = this.game.add.isoSprite(0, 0, 0);
        this.terrainIsoDisplayObject.anchor.set(0.5, 0);
        this.draw();
        super.onTerrainItemCreate();
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
        this.bmd = this.game.make.bitmapData(this.itemWidth, this.itemHeight + Const.GameConst.MAP_TILE_DEPTH);
        let rect = new Phaser.Rectangle(this.itemWidth * this.data.subIdx, (this.itemHeight + Const.GameConst.MAP_TILE_DEPTH) * this.data.colorIdx, this.itemWidth, this.itemHeight + Const.GameConst.MAP_TILE_DEPTH);
        let source = Images.ImagesTile.getName(this.data.type);
        this.bmd.copyRect(source, rect, 0, 0);
        this.terrainIsoDisplayObject.loadTexture(this.bmd);
        super.onTerrainItemLoadComplete();
    }

    protected draw(): void {
        // let graphics = Globals.game.make.graphics();
        // graphics.clear();
        // graphics.lineStyle(2, 0xff0000, 1);
        // graphics.beginFill(0xff0000);
        // graphics.drawCircle(0,0,2);
        // graphics.endFill();
        // this.terrainIsoDisplayObject.addChild(graphics);
    }
}
