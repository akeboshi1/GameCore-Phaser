import {BasicTerrainItem} from "./BasicTerrainItem";
import {TerrainSceneLayer} from "../TerrainSceneLayer";
import {Room45Util} from "../../modules/system/Room45Util";
import Globals from "../../Globals";
import {Const} from "../../const/Const";
import {Images} from "../../Assets";
import * as Assets from "../../Assets";

export class TerrainImageItem extends BasicTerrainItem {
    private room45Util: Room45Util;

    public constructor(game: Phaser.Game,owner: TerrainSceneLayer) {
        super(game,owner);
        // let graphics = Globals.game.make.graphics();
        // graphics.beginFill(0xFF0000);
        // graphics.drawCircle(-Const.GameConst.HALF_MAP_TILE_WIDTH,0,2);
        // graphics.endFill();
        // this.add(graphics);
    }

    protected onTerrainItemCreate(): void {

        if (this.room45Util == null) {
            this.room45Util = new Room45Util();
            this.room45Util.setting(1, 1, Const.GameConst.MAP_TILE_WIDTH, Const.GameConst.MAP_TILE_HEIGHT);
        }

        // let graphics = Globals.game.make.graphics();
        // graphics.lineStyle(2, 0xff0000, 1);
        // this.draw(graphics);
        // this.add(graphics);

        // this.terrainItemDisplayObject = new Phaser.Sprite(Globals.game,0,0);
        this.terrainIsoDisplayObject = this.game.add.isoSprite(0, 0, 0);

        super.onTerrainItemCreate();
    }

    public setPosition(x: number, y: number, z: number = 0) {
        if (this.terrainIsoDisplayObject) {
            let point3 = this.terrainIsoDisplayObject.isoPosition;
            point3.setTo(x, y, z);
        }
    }

    protected onTerrainItemLoad(): void {
        super.onTerrainItemLoad();
        if(Globals.game.cache.checkImageKey(Assets.Images.ImagesTile.getName(this.data.type))){
            this.onTerrainItemLoadComplete();
        }else{
            Globals.game.load.onLoadComplete.addOnce(this.onTerrainItemLoadComplete, this);
            Globals.game.load.image(Assets.Images.ImagesTile.getName(this.data.type), Assets.Images.ImagesTile.getPNG(this.data.type));
            Globals.game.load.start();
        }
    }

    protected onTerrainItemLoadComplete(): void {
        let bmd = this.game.make.bitmapData(Const.GameConst.MAP_TILE_WIDTH,Const.GameConst.MAP_TILE_HEIGHT + Const.GameConst.MAP_TILE_DEPTH);
        let rect = new Phaser.Rectangle(Const.GameConst.MAP_TILE_WIDTH * this.data.subIdx,(Const.GameConst.MAP_TILE_HEIGHT + Const.GameConst.MAP_TILE_DEPTH) * this.data.colorIdx,Const.GameConst.MAP_TILE_WIDTH,Const.GameConst.MAP_TILE_HEIGHT + Const.GameConst.MAP_TILE_DEPTH);
        bmd.copyRect(Images.ImagesTile.getName(this.data.type),rect);
        this.terrainIsoDisplayObject.loadTexture(bmd);
        super.onTerrainItemLoadComplete();
    }

    private draw(graphics: Phaser.Graphics): void {
        graphics.clear();
        let points = [[0, 0], [1, 0], [1, 1], [0, 1]];
        let p;
        if (points) {
            for (var i: number = 0; i < points.length; i++) {
                var _data: number[] = points[i];
                p = this.room45Util.tileToPixelCoords(_data[0], _data[1]);
                if (i == 0) {
                    graphics.moveTo(p.x, p.y);
                }
                else
                    graphics.lineTo(p.x, p.y);
            }
        }
        graphics.endFill();
    }
}
