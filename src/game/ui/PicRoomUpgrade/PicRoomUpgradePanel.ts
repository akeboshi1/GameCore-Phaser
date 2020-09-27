import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { i18n } from "../../game/core/utils/i18n";
import { Font } from "../../game/core/utils/font";
import { op_client } from "pixelpai_proto";
export class PicRoomUpgradePanel extends BasePanel {
    private readonly key = "picroomupgradepanel";
    private content: Phaser.GameObjects.Container;
    private mBackground: Phaser.GameObjects.Graphics;
    private mTitleName: Phaser.GameObjects.Text;
    private roomIcon: Phaser.GameObjects.Sprite;
    private mPlayedTimes: number;
    private readonly MAX_TIMES: number = 4;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        // this.scale = 1;
    }

    public resize(w: number, h: number) {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        this.content.x = width * 0.5;
        this.content.y = height * 0.5;
        this.setSize(width, height);
    }
    show(param?: any) {
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
        this.updateData();
    }

    hide() {
        this.mShow = false;
        this.removeListen();
    }
    updateData() {
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData[0];
        this.mTitleName.text = data.text[0].text;
        const lv = data.data[0];
        this.roomIcon.on(Phaser.Animations.Events.SPRITE_ANIMATION_REPEAT, this.animationRepeat, this);
        this.mPlayedTimes = 0;
        this.roomIcon.play("lv" + lv);
    }
    public addListen() {
        if (!this.mInitialized) return;
        this.setInteractive(new Phaser.Geom.Rectangle(this.width * 0.5, this.height * 0.5, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        this.on("pointerup", this.onClickHandler, this);
    }

    public removeListen() {
        if (!this.mInitialized) return;
        this.removeInteractive();
        this.off("pointerup", this.onClickHandler, this);
    }

    public destroy() {
        this.mPlayedTimes = 0;
        super.destroy();
    }

    protected preload() {
        this.addAtlas(this.key, "e_roomupgrade/e_roomupgrade.png", "e_roomupgrade/e_roomupgrade.json");
        super.preload();
    }

    protected init() {
        if (this.mInitialized) return;
        const w = this.scaleWidth;
        const h = this.scaleHeight;
        this.mBackground = this.scene.make.graphics(undefined, false);
        this.mBackground.clear();
        this.mBackground.fillStyle(0, 0.66);
        this.mBackground.fillRect(0, 0, w, h);
        this.add(this.mBackground);
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(w, 462 * this.dpr);
        const conbg = this.scene.make.image({ x: 0, y: -20 * this.dpr, key: this.key, frame: "effect_bg" });
        this.content.add(conbg);
        const titleBg = this.scene.make.image({ key: this.key, frame: "tittle_bg" });
        titleBg.y = -this.content.height * 0.5;
        const font = `${22 * this.dpr}px ${Font.BOLD_FONT}`;
        this.mTitleName = this.scene.make.text({
            x: 0, y: titleBg.y, text: "",
            style: { font, fill: "#FFF36D" }
        }).setOrigin(0.5);
        this.mTitleName.setStroke("#471C1E", 8);
        this.mTitleName.setShadow(2, 2, "#471C1E", 2, true, true);
        this.mTitleName.setTint(0xFFF36D, 0xFFF36D, 0xFFAE00, 0xFFAE00);
        this.content.add([titleBg, this.mTitleName]);
        const bottomTitle = this.scene.make.text({
            x: 0, y: this.content.height * 0.5 - 40 * this.dpr, text: i18n.t("room_upgrade.clicktocontinue"),
            style: { fontFamily: Font.DEFULT_FONT, fontSize: 16 * this.dpr, color: "#FFF000" }
        }).setOrigin(0.5);
        this.roomIcon = this.scene.make.sprite({ key: this.key, frame: "lv1" });
        this.roomIcon.y = -40 * this.dpr;
        this.content.add([this.roomIcon, bottomTitle]);
        this.add(this.content);
        this.createAnimations();
        this.resize(0, 0);
        super.init();
    }
    private onClickHandler() {
        if (this.mPlayedTimes < this.MAX_TIMES) {
            return;
        }
        const data: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData[0];
        this.emit("querytargetui", data.id);
    }

    private createAnimations() {
        for (let i = 1; i <= 4; i++) {
            this.scene.anims.create({ key: "lv" + i, frames: this.scene.anims.generateFrameNames(this.key, { prefix: "lv", frames: [i - 1, i] }), duration: 500, repeat: -1 });
        }
    }

    private animationRepeat() {
        this.mPlayedTimes++;
        if (this.mPlayedTimes >= this.MAX_TIMES) {
            this.roomIcon.off(Phaser.Animations.Events.SPRITE_ANIMATION_REPEAT, this.animationRepeat, this);
        }
    }
}
