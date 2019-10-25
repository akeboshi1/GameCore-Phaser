import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { Url } from "../../utils/resUtil";
import { IconBtn } from "./icon.btn";

export class TopBtnGroup extends Panel {
    private mWorld: WorldService;
    private mWid: number = 0;
    private mBtnList: IconBtn[];
    private mResKey: string;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width - this.width;
        this.y = 0;
    }

    public hide() {
        super.hide();
    }

    public destroy() {
        super.destroy();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.mResKey = "baseView";
        this.mScene.load.atlas(this.mResKey, Url.getRes("ui/baseView/topBtnGroup.png"), Url.getRes("ui/baseView/topBtnGroup.json"));
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width >> 1;
        this.y = size.height - 300;
        this.mBtnList = [];
        const bgResKey: string = "btnGroup_bg";
        const bgTexture: string = "";
        const turnBtn: IconBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, bgResKey, "btnGroup_top_expand");
        this.mWid += 56 + 8;
        this.mBtnList.push(turnBtn);
        const bagBtn: IconBtn = new IconBtn(this.mScene, this.mWorld, this.mResKey, bgResKey, "");
        this.mWid += 56 + 8;
        this.mBtnList.push(bagBtn);
        super.init();
    }


}
