
import { op_client } from "pixelpai_proto";
import { ClickEvent, Button } from "apowophaserui";
import { Font, Handler, i18n, UIHelper } from "utils";
import { UIAtlasName } from "picaRes";
import { ItemButton } from "../Components";
export class PicaTreasureAllOpenPanel extends Phaser.GameObjects.Container {
    private confirmBtn: Button;
    private titleimage: Phaser.GameObjects.Image;
    // private pageCount: Phaser.GameObjects.Text;
    // private pagedown: Phaser.GameObjects.Text;
    private content: Phaser.GameObjects.Container;
    private maskGraphic: Phaser.GameObjects.Graphics;
    private lightSprite: Phaser.GameObjects.Sprite;
    private starSprite: Phaser.GameObjects.Sprite;
    private dpr: number;
    private zoom: number;
    private key: string;
    private treasureData: any;
    private closeHandler: Handler;
    private lightAniKey: string = "treasurelight";
    private starAniKey: string = "treasurestar";
    private curLayoutGroup: RewardLayoutGroup;
    private indexed: number = 0;
    private isDispose: boolean = false;
    private tweens: Phaser.Tweens.Tween[] = [];
    private maskWidth: number = 0;
    private maskHeight: number = 0;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.key = key;
        this.setSize(width, height);
        this.init();
    }

    resize(w: number, h: number) {
        this.setSize(w, h);
        const worldpos = this.getWorldTransformMatrix();
        this.maskGraphic.setPosition(worldpos.tx, worldpos.ty);
    }

    addListen() {
        this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnClick, this);
    }

    removeListen() {
        this.confirmBtn.off(ClickEvent.Tap, this.onConfirmBtnClick, this);
    }
    init() {
        const posY = -this.height * 0.5;
        const titlebgline = this.scene.make.image({ x: 0, y: posY + 5 * this.dpr, key: UIAtlasName.treasure, frame: "treasure_title_bg" }, false);
        this.titleimage = this.scene.make.image({ x: 0, y: titlebgline.y, key: UIAtlasName.treasure, frame: i18n.t("treasure.titleimg") }, false);
        this.titleimage.alpha = 0;
        // this.pageCount = this.scene.make.text({
        //     x: 0, y: this.titleimage.y + 40 * this.dpr, text: "1/6",
        //     style: { color: "#FFE400", fontFamily: Font.DEFULT_FONT, fontSize: 16 * this.dpr }
        // }).setOrigin(0.5).setFontStyle("bold");
        // this.pageCount.visible = false;
        this.add([titlebgline, this.titleimage]);

        this.lightSprite = this.createSprite(UIAtlasName.circleeffect, this.lightAniKey, "", [1, 16]);
        this.lightSprite.x = 5 * this.dpr;
        this.add(this.lightSprite);
        this.starSprite = this.createSprite(UIAtlasName.stareffect, this.starAniKey, "star", [1, 18], 10, -1);
        this.add(this.starSprite);
        this.starSprite.x = this.lightSprite.y;
        const maskW = this.maskWidth = this.width, maskH = this.maskHeight = 200 * this.dpr;
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(maskW, maskH);
        this.add(this.content);
        this.maskGraphic = this.scene.make.graphics(undefined, false);
        this.maskGraphic.fillStyle(0);
        this.maskGraphic.fillRect(-maskW * 0.5 * this.zoom, -maskH * 0.5 * this.zoom, maskW * this.zoom, maskH * this.zoom);
        const worldpos = this.getWorldTransformMatrix();
        this.maskGraphic.setPosition(worldpos.tx, worldpos.ty);
        this.content.setMask(this.maskGraphic.createGeometryMask());

        // this.pagedown = this.scene.make.text({
        //     x: 0, y: -posY - 45 * this.dpr, text: i18n.t("treasure.pagedown"),
        //     style: { color: "#96F7FF", fontFamily: Font.DEFULT_FONT, fontSize: 12 * this.dpr }
        // }).setOrigin(0.5);
        // this.add(this.pagedown);
        // this.pagedown.visible = false;
        this.confirmBtn = new Button(this.scene, UIAtlasName.treasure, "butt", "butt", i18n.t("common.confirm"));
        this.confirmBtn.y = -posY - 8 * this.dpr;
        this.confirmBtn.setTextStyle(UIHelper.brownishStyle(this.dpr, 20));
        this.confirmBtn.setFontStyle("bold");
        this.confirmBtn.alpha = 0;
        this.add(this.confirmBtn);
    }
    setHandler(close: Handler) {
        this.closeHandler = close;
    }
    destroy() {
        super.destroy();
        this.isDispose = true;
        if (this.tweens.length > 0) {
            for (const tween of this.tweens) {
                tween.stop();
                tween.remove();
            }
        }
        this.tweens.length = 0;
    }

    setTreasureData(datas: any[]) {
        if (!datas) return;
        this.treasureData = datas;
        const tempdatas = this.getNextDatas();
        const group = this.createLayoutGroup(tempdatas);
        const offsety = (group.height - this.maskHeight) * 0.5;
        this.setLayoutPanel(group.width, group.height);
        this.playAnimation();
        const from = 280 * this.dpr + offsety;
        group.y = from;
        this.playItemTween(group, from, offsety, 620);
        this.curLayoutGroup = group;
    }

    private setLayoutPanel(width: number, height: number) {
        const maskW = this.width, maskH = height + 40 * this.dpr;
        this.maskGraphic.clear();
        this.maskGraphic.fillStyle(0);
        this.maskGraphic.fillRect(-maskW * 0.5 * this.zoom, -maskH * 0.5 * this.zoom, maskW * this.zoom, maskH * this.zoom);
        const worldpos = this.getWorldTransformMatrix();
        const offsety = (height - this.maskHeight) * 0.5;
        this.maskGraphic.setPosition(worldpos.tx, worldpos.ty + offsety);
        this.confirmBtn.y = this.height * 0.5 + 38 * this.dpr + offsety;
    }

    private playAnimation() {
        this.titleimage.alpha = 0;
        this.lightSprite.play(this.lightAniKey);
        setTimeout(() => {
            this.starSprite.play(this.starAniKey);
        }, 208);
        const titleTween = this.scene.tweens.add({
            targets: this.titleimage,
            alpha: {
                from: 0,
                to: 1
            },
            duration: 300,
            onComplete: () => {
                titleTween.stop();
                titleTween.remove();
            },
        });
        this.tweens.push(titleTween);
        const buttonTween = this.scene.tweens.add({
            targets: this.confirmBtn,
            alpha: {
                from: 0,
                to: 1
            },
            duration: 200,
            delay: 720,
            onComplete: () => {
                buttonTween.stop();
                buttonTween.remove();
            },
        });
        this.tweens.push(buttonTween);
    }
    private playItemTween(gameobjet: RewardLayoutGroup, from: number, to: number, delay: number) {
        const tweenIn = this.scene.tweens.add({
            targets: gameobjet,
            y: {
                from,
                to
            },
            ease: "Back.easeOut",
            duration: 300,
            delay,
            onComplete: () => {
                tweenIn.stop();
                tweenIn.remove();
                this.playPageCount();
            },
        });
        this.tweens.push(tweenIn);
        const target = this.curLayoutGroup;
        if (target) {
            const tweenOut = this.scene.tweens.add({
                targets: target,
                alpha: {
                    from: 1,
                    to: 0
                },
                duration: 200,
                onComplete: () => {
                    tweenOut.stop();
                    tweenOut.remove();
                    target.destroy();
                },
            });
            this.tweens.push(tweenOut);
        }
    }

    private playPageCount() {
        if (this.isDispose) return;
        // const len = this.treasureData.length;
        // if (len < 6) return;
        // this.pageCount.visible = true;
        // this.pagedown.visible = true;
        // const total = Math.ceil(len / 6);
        // const index = Math.ceil(this.indexed / 6);
        // this.pageCount.text = index + " /" + total;
    }
    private getNextDatas() {
        const datas: any[] = this.treasureData;
        if (this.indexed >= datas.length) return undefined;
        const start = this.indexed;
        const end = datas.length;
        this.indexed = end;
        return datas.slice(start, end);

    }

    private createLayoutGroup(arr: any[]) {
        const group = new RewardLayoutGroup(this.scene, 0, this.maskHeight, 235 * this.dpr, this.maskHeight, this.dpr, this.zoom);
        this.content.add(group);
        group.setRewardDatas(arr);
        return group;
    }

    private createSprite(key: string, animkey: string, frame: string, indexs: number[], frameRate: number = 30, repeat = 0) {
        const sprite = this.scene.make.sprite({ key, frame: frame + "1" });
        this.scene.anims.create({ key: animkey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "", start: indexs[0], end: indexs[1] }), frameRate, repeat });
        return sprite;
    }

    private onConfirmBtnClick() {
        const datas = this.getNextDatas();
        if (datas) {
            const group = this.createLayoutGroup(datas);
            const offsety = (group.height - this.maskHeight) * 0.5;
            const from = 280 * this.dpr + offsety;
            group.y = from;
            this.playItemTween(group, from, offsety, 200);
            this.curLayoutGroup = group;
        } else {
            if (this.closeHandler) this.closeHandler.run();
        }
    }
}

class RewardLayoutGroup extends Phaser.GameObjects.Container {
    private dpr: number;
    private zoom: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
    }

    setRewardDatas(datas: any[]) {
        if (!datas) return;
        const len = datas.length;
        for (let i = 0; i < len; i++) {
            const prop = new ItemButton(this.scene, UIAtlasName.uicommon1, "roam_reward_ordinary_bg", this.dpr, this.zoom, true);
            prop.setStateFrames("roam_reward_ordinary_bg", "roam_reward_rare_bg");
            prop.setItemData(datas[i]);
            this.add(prop);
        }
        this.setLayout();
    }

    setLayout() {
        const list = this.list;
        if (list.length === 0) return;
        const cell = <ItemButton>list[0];
        const len = list.length;
        const cellwidth = cell.width, cellHeight = cell.height;
        let tempWidth: number = 0, tempHeight: number = 0;
        if (len <= 3) {
            const space = len === 2 ? 20 * this.dpr : 10 * this.dpr;
            const width = len * cellwidth + space * (len - 1);
            for (let i = 0; i < len; i++) {
                const item = <ItemButton>list[i];
                item.x = -width * 0.5 + (cellwidth + space) * i + cellwidth * 0.5;
            }
        } else if (len === 4) {
            const spaceW = 20 * this.dpr, spaceH = 15 * this.dpr;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    const item = <ItemButton>(list[i * 2 + j]);
                    item.x = -(cellwidth + spaceW) * 0.5 + (cellwidth + spaceW) * j;
                    item.y = -(cellHeight + spaceH) * 0.5 + (cellHeight + spaceH) * i;
                }
            }
        } else if (len === 5) {
            const spaceW = 10 * this.dpr, spaceH = 15 * this.dpr;
            const width = 3 * cellwidth + spaceW * 2;
            const height = 2 * cellHeight + spaceH;
            for (let i = 0; i < 3; i++) {
                const item = <ItemButton>(list[i]);
                item.x = -width * 0.5 + (cellwidth + spaceW) * i + cellwidth * 0.5;
                item.y = -height * 0.5 + cellHeight * 0.5;
            }
            for (let j = 0; j < 2; j++) {
                const item = <ItemButton>(list[j + 3]);
                item.x = -(2 * cellwidth + spaceW) * 0.5 + cellwidth * 0.5 + (cellwidth + spaceW) * j;
                item.y = height * 0.5 - cellHeight * 0.5;
            }
        } else if (len === 6) {
            const spaceW = 10 * this.dpr, spaceH = 15 * this.dpr;
            const width = 3 * cellwidth + spaceW * 2;
            const height = 2 * cellHeight + spaceH;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 3; j++) {
                    const item = <ItemButton>(list[i * 3 + j]);
                    item.x = -width * 0.5 + (cellwidth + spaceW) * j + cellwidth * 0.5;
                    item.y = -height * 0.5 + (cellHeight + spaceH) * i + cellHeight * 0.5;
                }
            }
        } else {
            const spaceW = 10 * this.dpr, spaceH = 10 * this.dpr;
            const hcount = 4;
            const roundlen = Math.floor(list.length / hcount);
            const remainder = list.length % hcount;
            const width = hcount * cellwidth + spaceW * (hcount - 1);
            const heightLen = roundlen + (remainder === 0 ? 0 : 1);
            const height = heightLen * cellHeight + spaceH * (heightLen - 1);
            for (let i = 0; i < roundlen; i++) {
                for (let j = 0; j < hcount; j++) {
                    const item = <ItemButton>(list[i * hcount + j]);
                    item.x = -width * 0.5 + (cellwidth + spaceW) * j + cellwidth * 0.5;
                    item.y = -height * 0.5 + (cellHeight + spaceH) * i + cellHeight * 0.5;
                }
            }
            const remaWdith = remainder * cellwidth + spaceW * (remainder - 1);
            for (let j = 0; j < remainder; j++) {
                const item = <ItemButton>(list[j + roundlen * hcount]);
                item.x = -remaWdith * 0.5 + cellwidth * 0.5 + (cellwidth + spaceW) * j;
                item.y = height * 0.5 - cellHeight * 0.5;
            }
            tempWidth = width;
            tempHeight = height;
            if (this.width < tempWidth) this.width = tempWidth;
            if (this.height < tempHeight) this.height = tempHeight;
        }
    }
}
