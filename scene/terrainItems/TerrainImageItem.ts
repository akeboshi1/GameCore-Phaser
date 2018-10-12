import {BasicTerrainItem} from "./BasicTerrainItem";
import {TerrainSceneLayer} from "../TerrainSceneLayer";
import {Room45Util} from "../../modules/system/Room45Util";
import {Globals} from "../../Globals";
import Image = Phaser.Image;
import BasicSprite from "../../display/BasicSprite";
import {Const} from "../../const/Const";

export class TerrainImageItem extends BasicTerrainItem {
    private mBitmap: Image;
    private room45Util: Room45Util;

    public constructor(owner: TerrainSceneLayer) {
        super(owner);
    }

    protected onTerrainItemCreate(): void {

        if (this.room45Util == null) {
            this.room45Util = new Room45Util();
            this.room45Util.setting(1, 1, Const.GameConst.MAP_TILE_WIDTH, Const.GameConst.MAP_TILE_HEIGHT);
        }

        let graphics = Globals.LayerManager.game.make.graphics();
        graphics.lineStyle(2, 0xff0000, 1);
        this.draw(graphics);
        this.addChild(graphics);

        this.terrainItemDisplayObject = this.mBitmap;
        super.onTerrainItemCreate();

    }

    protected onTerrainItemLoad(): void {
        super.onTerrainItemLoad();
        Globals.LayerManager.game.load.onLoadComplete.addOnce(this.onTerrainItemLoadComplete, this);
        Globals.LayerManager.game.load.image(this.data.sign, this.data.path);
    }

    protected onTerrainItemLoadComplete(thisObj: any): void {

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
