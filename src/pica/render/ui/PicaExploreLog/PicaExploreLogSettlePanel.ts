
import { op_client } from "pixelpai_proto";
import { ClickEvent, Button } from "apowophaserui";
import { Font, Handler, i18n, ResUtils, UIHelper } from "utils";
import { UIAtlasName } from "picaRes";
import { ItemButton } from "../Components";
import { ButtonEventDispatcher, ProgressMaskBar } from "gamecoreRender";
export class PicaExploreLogSettlePanel extends ButtonEventDispatcher {
    protected dpr: number;
    protected zoom: number;
    private blackGraphic: Phaser.GameObjects.Graphics;
    private titleimage: Phaser.GameObjects.Image;
    private starPro: ProgressMaskBar;
    private starText: Phaser.GameObjects.Text;
    private scorebg: Phaser.GameObjects.Image;
    private scoreTex: Phaser.GameObjects.Text;
    private content: Phaser.GameObjects.Container;
    private lightImg: Phaser.GameObjects.Image;
    private scoreTipsCon: Phaser.GameObjects.Container;
    private curLayoutGroup: RewardLayoutGroup;
    private maskGraphic: Phaser.GameObjects.Graphics;
    private settleData: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY;
    private scoreDatas: Array<{ tip: string, score: number }>;
    private closeHandler: Handler;
    private tweens: Phaser.Tweens.Tween[] = [];
    private curFadeOutObj: ScoreTipsPanel;
    private curFadeInObj: ScoreTipsPanel;
    private maskWidth: number;
    private maskHeight: number;
    private scoreTimer: any;
    private curTempScore: number = 0;
    private allScore: number = 0;
    private isPlayed: boolean = false;
    private finished: boolean = false;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene, 0, 0, false);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
        this.enable = true;
        this.on(ClickEvent.Tap, this.onClickHandler, this);
    }

    resize(w: number, h: number) {
        this.setSize(w, h);
        this.blackGraphic.clear();
        this.blackGraphic.fillStyle(0, 0.8);
        this.blackGraphic.fillRect(-w * 0.5, -h * 0.5, w, h);
    }

    init() {
        this.blackGraphic = this.scene.make.graphics(undefined, false);
        this.add(this.blackGraphic);
        this.content = this.scene.make.container(undefined, false);
        this.content.setSize(this.width, this.height);
        this.add(this.content);

        const posY = -200 * this.dpr;
        this.titleimage = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "Settlement_title" }, false);
        this.titleimage.y = posY;
        this.starPro = new ProgressMaskBar(this.scene, UIAtlasName.explorelog, "Settlement_star_default", "Settlement_star_Light");
        this.starPro.y = this.titleimage.y + this.titleimage.height * 0.5 + this.starPro.height * 0.5 + 5 * this.dpr;
        this.starText = this.scene.make.text({
            x: 0, y: this.titleimage.y + 40 * this.dpr, text: "1/6", style: UIHelper.whiteStyle(this.dpr, 11)
        }).setOrigin(0.5);
        this.starText.y = this.starPro.y + this.starPro.height * 0.5 + 10 * this.dpr;
        this.scorebg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "Settlement_score_bg" });
        this.scorebg.y = this.starText.y + 15 * this.dpr + this.scorebg.height * 0.5;
        this.scoreTex = this.scene.make.text({
            x: 0, y: this.scorebg.y, text: "", style: UIHelper.colorStyle("#FFE057", 39 * this.dpr)
        }).setOrigin(0.5);
        this.lightImg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "Settlement_light" });
        this.lightImg.y = this.scoreTex.y;
        this.lightImg.visible = false;
        this.scoreTipsCon = this.scene.make.container(undefined, false);
        this.scoreTipsCon.setSize(244 * this.dpr, 160 * this.dpr);
        this.scoreTipsCon.y = 40 * this.dpr;
        this.maskGraphic = this.scene.make.graphics(undefined, false);
        this.maskWidth = 336 * this.dpr;
        this.maskHeight = 215 * this.dpr;
        this.content.add([this.titleimage, this.starPro, this.starText, this.scorebg, this.scoreTex, this.lightImg, this.scoreTipsCon]);
    }
    setHandler(close: Handler) {
        this.closeHandler = close;
    }
    destroy() {
        super.destroy();
        if (this.tweens.length > 0) {
            for (const tween of this.tweens) {
                tween.stop();
                tween.remove();
            }
        }
        this.tweens.length = 0;
    }

    setSettleData(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY) {
        if (!content) return;
        this.initParam();
        this.settleData = content;
        this.scoreDatas = this.getScoreArr(content);
        this.playScoreTipsAnimation();
        this.curLayoutGroup = this.createLayoutGroup(content.rewards);
        this.curLayoutGroup.y = this.height * 0.5;
        this.curLayoutGroup.visible = false;
        this.setLayoutMask(this.maskWidth, this.maskHeight);
        this.starPro.setProgress(content.previousProgress, 500);
    }

    private initParam() {
        this.isPlayed = false;
        this.allScore = 0;
        this.curTempScore = 0;
        this.scoreTex.text = this.allScore + "";
    }
    private getScoreArr(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_EXPLORE_SUMMARY) {
        const arrs: Array<{ tip: string, score: number }> = [];
        if (content.pointBase >= 0) {
            arrs.push({ tip: i18n.t("explore.basetips"), score: content.pointBase });
            this.allScore += content.pointBase;
        }
        if (content.pointTime >= 0) {
            arrs.push({ tip: i18n.t("explore.timetips"), score: content.pointTime });
            this.allScore += content.pointTime;
        }
        if (content.pointAccuracy >= 0) {
            arrs.push({ tip: i18n.t("explore.accuracytips"), score: content.pointAccuracy });
            this.allScore += content.pointAccuracy;
        }
        if (content.pointHint >= 0) {
            arrs.push({ tip: i18n.t("explore.hinttips"), score: content.pointHint });
            this.allScore += content.pointHint;
        }
        return arrs;
    }
    private setLayoutMask(width: number, height: number) {
        const maskW = width, maskH = height;
        this.maskGraphic.clear();
        this.maskGraphic.fillStyle(0);
        this.maskGraphic.fillRect(-maskW * 0.5 * this.zoom, -maskH * 0.5 * this.zoom, maskW * this.zoom, maskH * this.zoom);
        const worldpos = this.getWorldTransformMatrix();
        const offsety = height * 0.5 + 30 * this.dpr;
        this.maskGraphic.setPosition(worldpos.tx, worldpos.ty + offsety);
        this.curLayoutGroup.setMask(this.maskGraphic.createGeometryMask());
    }
    private excuteNextDatas(fadeIn?: boolean) {
        const datas = this.scoreDatas;
        if (datas.length > 0) {
            const data = datas.shift();
            const obj = new ScoreTipsPanel(this.scene, 100 * this.dpr, 45 * this.dpr, this.dpr, this.zoom);
            obj.setTextData(data.tip, data.score);
            obj.y = this.scoreTipsCon.height * 0.5 + 10 * this.dpr;
            this.scoreTipsCon.add(obj);
            if (fadeIn === true) {
                this.playScoreTipsFadeIn(obj);
            } else if (fadeIn === false) {
                this.playScoreTipsFadeOut(obj);
            }
            obj.alpha = 0;
            return obj;
        } else {
            this.isPlayed = true;
            if (fadeIn) this.curFadeInObj = undefined;
            else this.curFadeOutObj = undefined;
        }
        return undefined;
    }

    private playScoreTipsAnimation() {
        const obj = this.excuteNextDatas(undefined);
        obj.y = 0;
        this.playAlphaTween(obj, 0, 1, 500, new Handler(this, () => {
            this.playScoreTipsFadeOut(obj);
        }));
    }

    private clearScoreAnimation() {
        if (this.tweens.length > 0) {
            for (const tween of this.tweens) {
                tween.stop();
                tween.remove();
            }
        }
        if (this.scoreTimer) {
            clearInterval(this.scoreTimer);
            this.scoreTimer = undefined;
        }
        this.tweens.length = 0;
        this.scoreTipsCon.removeAll(true);
        this.lightImg.visible = false;
        this.scoreTex.text = this.allScore + "";
        this.starPro.setProgress(this.settleData.latestProgress, 500);
    }

    private playCalculateScoreAnimation(score: number, time: number, compl: Handler) {
        const radio = 30;
        const step = score / (time / radio);/*每30ms增加的数值--*/
        const curScore = this.curTempScore;
        let count = 0; // 计数器
        let initial = 0;
        this.scoreTimer = setInterval(() => {
            count = count + step;
            if (count >= score) {
                clearInterval(this.scoreTimer);
                count = score;
                this.curTempScore += score;
                this.scoreTimer = undefined;
                if (compl) compl.run();
            }
            const t = Math.floor(count);
            if (t === initial) return;
            initial = t;
            this.scoreTex.text = curScore + initial + "";
        }, radio);
        this.playLightAnimation();
    }

    private playScoreTipsFadeIn(object: ScoreTipsPanel) {
        const from = this.scoreTipsCon.height * 0.5, to = 0;
        object.y = from;
        object.alpha = 0;
        this.playtPosYTween(object, from, to, 500);
        this.playAlphaTween(object, 0, 1, 500);
        this.curFadeInObj = object;
    }

    private playScoreTipsFadeOut(object: ScoreTipsPanel) {
        const from = 0, to = -this.scoreTipsCon.height * 0.5, delay = 300;
        object.y = from;
        object.alpha = 1;
        this.playtPosYTween(object, from, to, 500, undefined);
        this.playAlphaTween(object, 1, 0, 500, new Handler(this, () => {
            this.playCalculateScoreAnimation(object.value, 300, new Handler(this, () => {
                if (this.isPlayed) {
                    this.playLayoutAnimation();
                    this.lightImg.visible = false;
                    this.playStarAnimation(this.settleData.previousProgress, this.settleData.latestProgress, 500);
                }
                if (this.curFadeInObj)
                    this.playScoreTipsFadeOut(this.curFadeInObj);
            }));
            object.destroy();
        }));
        if (this.scene) this.excuteNextDatas(true);
        this.curFadeOutObj = object;
    }

    private playStarAnimation(from: number, to: number, max: number) {
        const allTime = 5000;
        const duration = allTime * ((to - from) / max);
        const tween = this.scene.tweens.addCounter({
            from,
            to,
            ease: "Linear",
            duration,
            onUpdate: (cope: any, param: any) => {
                this.starPro.setProgress(param.value, max);
            },
            onComplete: () => {
                tween.stop();
                tween.remove();
                this.removeTween(tween);
            },
        });
        this.tweens.push(tween);
        const width = 196 * this.dpr;
        const cellWidth = 29 * this.dpr;
        const space = 12 * this.dpr;
        this.starText.text = Math.floor(to % 100) + "%";
        const riado = Math.floor(to / 100);
        //     riado = to / 100 === riado ? riado - 1 > 0 ? riado - 1 : riado : riado;
        this.starText.x = -width * 0.5 + riado * (cellWidth + space) + cellWidth * 0.5;
    }

    private playLayoutAnimation() {
        const group = this.curLayoutGroup;
        const to = this.maskHeight * 0.5 + 30 * this.dpr;
        const from = to + this.maskHeight + 20 * this.dpr;
        group.y = from;
        this.curLayoutGroup.visible = true;
        this.playItemTween(group, from, to, 620);
    }
    private playItemTween(gameobjet: RewardLayoutGroup, from: number, to: number, delay: number) {
        const tweenIn = this.scene.tweens.add({
            targets: gameobjet,
            y: {
                from,
                to
            },
            ease: "Back.easeOut",
            duration: 400,
            delay,
            onComplete: () => {
                tweenIn.stop();
                tweenIn.remove();
                this.removeTween(tweenIn);
                this.finished = true;
            },
        });
        this.tweens.push(tweenIn);
    }
    private playLightAnimation() {
        if (this.lightImg.visible) return;
        this.lightImg.visible = true;
        this.lightImg.alpha = 0;
        const duration = 100;
        const handler = new Handler(this, (value: number) => {
            if (!this.lightImg.visible) return;
            if (value === 1) {
                this.playAlphaTween(this.lightImg, 1, 0.8, 60, handler);
            } else {
                this.playAlphaTween(this.lightImg, 0.8, 1, 60, handler);
            }
        });
        this.playAlphaTween(this.lightImg, 0, 1, duration, handler);
    }

    private playtPosYTween(obj: any, from: number, to: number, duration: number = 500, compl?: Handler, delay?: number) {
        if (!this.scene) return;
        const tweenY = this.scene.tweens.add({
            targets: obj,
            y: {
                from,
                to
            },
            ease: "Linear",
            duration,
            delay,
            onComplete: () => {
                tweenY.stop();
                tweenY.remove();
                this.removeTween(tweenY);
                if (compl) compl.run();
            },
        });
        this.tweens.push(tweenY);
    }

    private playAlphaTween(obj: any, from: number, to: number, duration: number = 500, compl?: Handler, delay?: number) {
        if (!this.scene) return;
        const tweenAlpha = this.scene.tweens.add({
            targets: obj,
            alpha: {
                from,
                to
            },
            ease: "Linear",
            duration,
            delay,
            onComplete: () => {
                tweenAlpha.stop();
                tweenAlpha.remove();
                this.removeTween(tweenAlpha);
                if (compl) compl.runWith(to);
            },
        });
        this.tweens.push(tweenAlpha);
    }

    private removeTween(tween: Phaser.Tweens.Tween) {
        const index = this.tweens.indexOf(tween);
        if (index !== -1) this.tweens.splice(index, 1);
    }

    private createLayoutGroup(arr: any[]) {
        const group = new RewardLayoutGroup(this.scene, 0, this.maskHeight, 235 * this.dpr, this.maskHeight, this.dpr, this.zoom);
        this.content.add(group);
        group.setRewardDatas(arr);
        return group;
    }

    private onClickHandler() {
        if (!this.isPlayed) {
            this.clearScoreAnimation();
            this.isPlayed = true;
            this.playLayoutAnimation();
        } else if (this.finished) {
            if (this.closeHandler) this.closeHandler.run();
        }
    }
}

class ScoreTipsPanel extends Phaser.GameObjects.Container {
    public value: number = 0;
    private dpr: number;
    private zoom: number;
    private title: Phaser.GameObjects.Text;
    private valueTex: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number) {
        super(scene);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.init();
    }

    public setTextData(title: string, value: number) {
        this.title.text = title;
        this.valueTex.text = "+" + value;
        this.value = value;
    }

    protected init() {
        this.title = this.scene.make.text({
            x: 0, y: 0, text: "", style: UIHelper.whiteStyle(this.dpr)
        }).setOrigin(0.5);
        this.title.y = -12 * this.dpr;
        this.valueTex = this.scene.make.text({
            x: 0, y: 0, text: "", style: UIHelper.whiteStyle(this.dpr, 24)
        }).setOrigin(0.5);
        this.valueTex.y = 11 * this.dpr;
        this.add([this.title, this.valueTex]);
    }
}

class RewardLayoutGroup extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Image;
    private content: Phaser.GameObjects.Container;
    private dpr: number;
    private zoom: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.zoom = zoom;
        this.setSize(width, height);
        this.bg = this.scene.make.image({ key: UIAtlasName.explorelog, frame: "Settlement_reward_bg" });
        this.content = this.scene.make.container(undefined, false);
        this.content.y = 10 * dpr;
        this.add([this.bg, this.content]);
    }

    setRewardDatas(datas: any[]) {
        if (!datas) return;
        const len = datas.length;
        for (let i = 0; i < len; i++) {
            const prop = new ItemButton(this.scene, UIAtlasName.uicommon1, "roam_reward_ordinary_bg", this.dpr, this.zoom, true);
            prop.setStateFrames("roam_reward_ordinary_bg", "roam_reward_rare_bg");
            prop.setItemData(datas[i]);
            this.content.add(prop);
        }
        this.setLayout();
    }

    setLayout() {
        const list = this.content.list;
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
