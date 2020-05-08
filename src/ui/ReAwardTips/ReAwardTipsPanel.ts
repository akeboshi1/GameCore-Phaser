import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { Font } from "../../utils/font";
import { Url } from "../../utils/resUtil";

export class ReAwardTipsPanel extends BasePanel {
    private key: string = "reaward_tips";
    private mTips: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_REWARD_TIPS[] = [];
    private showingList: AwardItem[] = [];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public show() {
        super.show();
        if (this.mInitialized) {
            if (this.showingList.length === 0) this.showAward();
        }
    }

    public appendAward(tips: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_REWARD_TIPS) {
        // const award = new AwardItem(this.scene);
        // this.add(award);
        this.mTips.push(tips);
        this.show();
    }

    public addAward() {
    }

    protected preload() {
        this.addImage(this.key, "reaward_tips/bg.png");
        super.preload();
    }

    protected init() {
        super.init();

        this.y = 250 * this.dpr;
    }

    private showAward() {
        if (this.mTips.length < 1) {
            return;
        }
        if (this.showingList.length >= 3) {
            return;
        }
        for (const item of this.showingList) {
            // item.y -= 30 * this.dpr;
            item.beUp();
        }
        // TODO 使用对象池创建
        const award = new AwardItem(this.scene, this.key, this.dpr, this.scale);
        award.once("destroy", this.onDestroyHanlder, this);
        award.once("show", this.onAwardItemShowHandler, this);
        award.setProp(this.mTips.pop());
        // award.y = -(this.showingList.length * 30 * this.dpr);
        this.add(award);
        this.showingList.push(award);
    }

    private onAwardItemShowHandler() {
        this.showAward();
    }

    private onDestroyHanlder(item) {
        const index = this.showingList.indexOf(item);
        if (index > -1) {
            this.showingList.splice(index, 1);
        }
        this.showAward();
    }
}

class AwardItem extends Phaser.GameObjects.Container {
    private mBg: Phaser.GameObjects.Image;
    private mImage: DynamicImage;
    private mLabel: Phaser.GameObjects.Text;
    private mScaleRatio: number;
    private closeDelay: any;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
        super(scene);
        this.mBg = this.scene.make.image({
            key,
        }, false);
        this.mScaleRatio = dpr * zoom;

        this.mImage = new DynamicImage(this.scene, 0, 0);
        this.mImage.setScale(dpr);
        this.mImage.setOrigin(0.5, 1);
        this.mImage.y = this.mBg.height * dpr / 2;

        this.mLabel = this.scene.make.text({
            x: (this.mBg.width * zoom) / 2 - 8 * this.mScaleRatio,
            style: {
                fontFamily: Font.DEFULT_FONT,
                fontSize: 11 * this.mScaleRatio,
                color: "#00FF00"
            }
        }, false).setOrigin(1, 0.5);
        // this.add([this.mBg, this.mImage, this.mLabel]);
        this.addAt(this.mBg, 0);
        this.add([this.mImage, this.mLabel]);

        this.setSize(this.mBg.width * zoom, this.mBg.height * zoom);
    }

    setProp(award: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_REWARD_TIPS) {
        if (!award) {
            return;
        }
        if (award.display && award.display.texturePath) {
            this.mImage.load(Url.getOsdRes(award.display.texturePath));
        }
        this.mLabel.setText(award.text);
        this.showTween();
    }

    showTween() {
        this.scene.tweens.add({
            targets: this,
            props: {
                x: `+=${this.width * 0.3}`
            },
            ease: "Bounce.easeOut",
            onComplete: () => {
                this.emit("show");
                this.closeDelay = setTimeout(() => {
                    this.closeTween();
                }, 1000);
            },
            duration: 300
        });
    }

    closeTween() {
        if (!this.scene) {
            return;
        }
        this.scene.tweens.add({
            targets: this,
            props: {
                y: `-=${50 * this.mScaleRatio}`,
                alpha: "0"
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                this.destroy();
            }
        });
    }

    beUp() {
        clearTimeout(this.closeDelay);
        this.scene.tweens.add({
            targets: this,
            props: {
                y: `-=${50 * this.mScaleRatio}`
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                this.closeDelay = setTimeout(() => {
                    this.closeTween();
                }, 1000);
            }
        });

    }
}
