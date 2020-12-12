import { BBCodeText } from "apowophaserui";
import { DynamicImage, Render } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { Font, Handler, i18n, UIHelper } from "utils";
export class PicaFurniUnlockEffectPanel extends Phaser.GameObjects.Container {
    private key: string;
    private dpr: number;
    private effectQueue: any[] = [];
    private isPlaying: boolean = false;
    constructor(scene: Phaser.Scene, private render: Render, width: number, height: number, key: string, dpr: number) {
        super(scene);
        this.setSize(width, height);
        this.key = key;
        this.dpr = dpr;
    }
    play(data: any[]) {
        this.effectQueue = this.effectQueue.concat(new Array(30));
        this.playNext();
    }

    private playNext() {
        if (this.isPlaying) return;
        if (this.effectQueue.length > 0) {
            const data = this.effectQueue.shift();
            const item = new PicaUnlockEffectItem(this.scene, this.key, this.dpr);
            item.setItemData(Handler.create(this, () => {
                this.isPlaying = false;
                this.playNext();
            }));
            const from = -this.width * 0.5 - item.width * 0.5 - 10 * this.dpr;
            const to = -this.width * 0.5 + item.width * 0.5 + 10 * this.dpr;
            item.x = 0;
            item.y = from;
            item.alpha = 0;
            item.playMove(from, to);
            this.add(item);
            this.isPlaying = true;
        }
    }
}

class PicaUnlockEffectItem extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private titletext: BBCodeText;
    private furinIcon: DynamicImage;
    private sprite1: Phaser.GameObjects.Image;
    private sprite2: Phaser.GameObjects.Image;
    private key: string;
    private dpr: number;
    private compl: Handler;
    constructor(scene: Phaser.Scene, key: string, dpr: number) {
        super(scene);
        this.key = key;
        this.dpr = dpr;
        this.bg = scene.make.image({ key, frame: "repair_popup_bg" });
        this.add(this.bg);
        this.setSize(this.bg.width, this.bg.height);
        this.titletext = new BBCodeText(scene, 0, 0, "", { fontFamily: Font.DEFULT_FONT, fontSize: 28 * dpr, color: "#FCF863" }).setOrigin(0);
        this.titletext.x = -this.width * 0.5 + 10 * dpr;
        this.titletext.y = -this.height * 0.5 + 2 * dpr;
        this.add(this.titletext);
        this.furinIcon = new DynamicImage(scene, this.width * 0.5 - 50 * dpr, 0);
        this.add(this.furinIcon);
        this.sprite1 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "repair_popup_star1" });
        this.sprite1.x = this.width * 0.5 - this.sprite1.width * 0.5 - 20 * dpr;
        this.sprite1.y = -20 * dpr;
        this.sprite2 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "repair_popup_star2" });
        this.sprite2.x = - 20 * dpr;
        this.sprite2.y = -60 * dpr;
        this.add([this.sprite1, this.sprite2]);
    }

    public setItemData(compl: Handler) {
        this.compl = compl;
        this.titletext.setText(`[b][color=#FFFF41]${i18n.t("furni_unlock.successrepair")}\n${"皮卡堂大熊餐厨"}*${1}[/color][/b]`);
    }

    playMove(from: number, to: number) {
        const tween = this.scene.tweens.add({
            targets: this,
            y: { from, to, duration: 300, ease: "Elastic.easeOut" },
            alpha: { from: 0, to: 1, duration: 300, ease: "Linear" },
            duration: 300,
            onComplete: () => {
                tween.stop();
                tween.remove();
                setTimeout(() => {
                    this.playAlphaAni(this.sprite1);
                    this.playAlphaAni(this.sprite2);
                }, 300);
                setTimeout(() => {
                    this.playAlpha();
                }, 3000);
            },
        });
    }

    playAlphaAni(target, yoyo: boolean = true, duration: number = 1000) {
        let times = 0;
        const tween = this.scene.tweens.add({
            targets: target,
            alpha: {
                from: 0,
                to: 1
            },
            ease: "Linear",
            duration,
            yoyo,
            onComplete: () => {
                tween.stop();
                tween.remove();
                times++;
                if (times < 2) {
                    this.playAlphaAni(target);
                } else if (times === 2) {
                    this.playAlphaAni(target, false, 500);
                }

            },
        });
    }

    playAlpha() {
        const tween = this.scene.tweens.add({
            targets: this,
            alpha: {
                from: 1,
                to: 0
            },
            ease: "Linear",
            duration: 200,
            onComplete: () => {
                tween.stop();
                tween.remove();
                if (this.compl) this.compl.run();
                this.destroy();
            },
        });
    }
}
