import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { NinePatch } from "../components/nine.patch";
import { op_client } from "pixelpai_proto";

export default class CharacterInfoPanel extends BasePanel {
    private key = "equip_upgrade";
    private commonkey = "common_key";
    private blackBg: Phaser.GameObjects.Graphics;
    private bg: NinePatch;
    private titlebg: Phaser.GameObjects.Image;
    private tilteName: Phaser.GameObjects.Text;
    private closeBtn: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.scale = 1;
    }
    resize(width: number, height: number) {
        const w: number = this.scene.cameras.main.width / this.scale;
        const h: number = this.scene.cameras.main.height / this.scale;
        super.resize(width, height);
        this.setSize(w, h);
        this.bg.x = w / 2;// - 24 * this.dpr * this.scale;
        this.bg.y = h / 2;// - 20 * this.dpr * this.scale;
        this.tilteName.x = this.bg.x;
        this.tilteName.y = this.bg.y - this.bg.height / 2;
        this.titlebg.x = this.bg.x;
        this.titlebg.y = this.bg.y - this.bg.height / 2;
        this.closeBtn.x = this.bg.x + this.bg.width / 2 - 10 * this.dpr * this.scale; // + this.bg.width / 2 - this.dpr * 8;
        this.closeBtn.y = this.bg.y - this.bg.height / 2 + 10 * this.dpr * this.scale; // + posY + this.dpr * 8;
        this.blackBg.clear();
        this.blackBg.fillStyle(0, 0.5);
        this.blackBg.fillRect(-this.x, -this.y, w, h);
        this.add([this.blackBg, this.bg, this.closeBtn, this.titlebg, this.tilteName]);
    }

    public show(param?: any) {
        this.mShowData = param;
        if (this.mPreLoad) return;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        if (this.mShow) return;
        if (this.soundGroup && this.soundGroup.open) this.playSound(this.soundGroup.open);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(true);
        } else {
            this.mShow = true;
        }
        this.addListen();
    }

    public addListen() {
        if (!this.mInitialized) return;
        this.closeBtn.on("pointerup", this.OnClosePanel, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.closeBtn.off("pointerup", this.OnClosePanel, this);
    }

    preload() {
        this.addAtlas(this.key, "equip_upgrade/mine_eqpm.png", "equip_upgrade/mine_eqpm.json");
        this.addAtlas(this.commonkey, "common/ui_base.png", "common/ui_base.json");
        super.preload();
    }
    init() {
        const w = this.scene.cameras.main.width / this.scale;
        const h = this.scene.cameras.main.height / this.scale;
        this.setSize(w, h);
        this.blackBg = this.scene.make.graphics(undefined, false);
        this.bg = new NinePatch(this.scene, 0, 0, 300 * this.dpr, 300 * this.dpr, this.commonkey, "bg", {
            left: 40,
            top: 40,
            bottom: 40,
            right: 40,
        });
        const posY = -this.bg.height * 0.5;
        this.titlebg = this.scene.make.image({ x: 0, y: posY, key: this.key, frame: "titlebg" });
        const mfont = `bold ${15 * this.dpr}px Source Han Sans`;
        this.tilteName = this.scene.make.text({ x: 0, y: posY, text: "装备", style: { font: mfont, color: "#8F4300", fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5, 0);
        this.closeBtn = this.scene.make.image({ x: this.bg.width * 0.5 - this.dpr * 5, y: posY + this.dpr * 5, key: this.commonkey, frame: "close" });
        this.tilteName.setStroke("#8F4300", 1);
        this.closeBtn.setInteractive();
        this.add([this.blackBg, this.bg, this.closeBtn, this.titlebg, this.tilteName]);
        this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
        super.init();
    }

    destroy() {
    }

    private OnClosePanel() {
        this.emit("hide");
    }

}
