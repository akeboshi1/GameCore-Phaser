import { BBCodeText } from "apowophaserui";
import { DynamicImage } from "gamecoreRender";
import { Font, Handler, i18n, UIHelper } from "utils";
export class PicaGiftLateralItem extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private headicon: Phaser.GameObjects.Image;
    private titletext: BBCodeText;
    private giftIcon: DynamicImage;
    private countTex: Phaser.GameObjects.Text;
    private giftCount: number = 0;
    private key: string;
    private dpr: number;
    private compl: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = scene.make.image({ key, frame: "gift_bg" });
        this.add(this.bg);
        this.setSize(this.bg.width, this.bg.height);
        this.headicon = scene.make.image({ key, frame: "gift_head" });
        this.headicon.x = -this.width * 0.5 + this.headicon.width * 0.5;
        this.add(this.headicon);
        this.titletext = new BBCodeText(scene, 0, 0, "", UIHelper.whiteStyle(dpr)).setOrigin(0);
        this.titletext.x = this.headicon.x + this.headicon.width * 0.5 + 3 * dpr;
        this.titletext.y = -this.height * 0.5 + 2 * dpr;
        this.add(this.titletext);
        this.giftIcon = new DynamicImage(scene, this.width * 0.5 - 50 * dpr, 0);
        this.add(this.giftIcon);
        this.countTex = this.scene.make.text({
            x: this.width * 0.5 - 15 * dpr, y: 0, text: "",
            style: { fontFamily: Font.DEFULT_FONT, fontSize: 28 * dpr, color: "#FCF863" }
        }).setFontStyle("bold italic").setStroke("#C25E0D", 1 * dpr).setOrigin(0, 0.5);
    }

    public setItemData(compl: Handler) {
        this.compl = compl;
        this.titletext.setText(`${"一只狐狸"}\n${i18n.t("common.give")}${"能量电池"}`);
        // this.giftIcon
        this.countTex.text = "x200";
        this.giftCount = Math.floor(Math.random() * 50);
    }

    playMove() {
        const tween = this.scene.tweens.add({
            targets: this,
            y: {
                from: -this.width + 20 * this.dpr,
                to: this.width * 0.5 + 10 * this.dpr
            },
            ease: "Linear",
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.playCount();
            },
        });
    }

    playCount() {
        const temp = this.getCountTweenData(this.giftCount);
        let tempcount = 0;
        let addNum = temp.acc === 0 ? 1 : 0;
        const tweenFun = () => {
            addNum += temp.acc;
            tempcount += addNum;
            if (tempcount > this.giftCount) tempcount = this.giftCount;
            this.countTex.text = `x${tempcount}`;
            const tween = this.scene.tweens.add({
                targets: this.countTex,
                scale: {
                    from: 0.1,
                    to: 1
                },
                ease: "Linear",
                duration: temp.duration,
                onComplete: () => {
                    tween.stop();
                    tween.remove();
                    if (tempcount < this.giftCount) {
                        setTimeout(() => {
                            this.playCount();
                        }, temp.interval);
                    } else {
                        setTimeout(() => {
                            this.playAlpha();
                        }, 1000);
                    }
                },
            });
        };

    }

    playAlpha() {
        const tween = this.scene.tweens.add({
            targets: this,
            alpha: {
                from: 1,
                to: 0
            },
            ease: "Back.easeOut",
            duration: 200,
            onComplete: () => {
                tween.stop();
                tween.remove();
                if (this.compl) this.compl.run();
                this.destroy();
            },
        });
    }

    private getCountTweenData(count: number) {
        let data: { duration: number, interval: number, acc: number };
        if (count < 10) {
            data = { duration: 40, interval: 10, acc: 0 };
        } else if (count >= 10 && count < 30) {
            data = { duration: 40, interval: 10, acc: 1 };
        } else if (count >= 30) {
            data = { duration: 40, interval: 0, acc: 3 };
        }
        return data;
    }
}
