import { BBCodeText, NineSlicePatch } from "apowophaserui";
import { Font, i18n } from "utils";

export class DetailBubble extends Phaser.GameObjects.Container {

    private dpr: number;
    private key: string;
    private timeID: any;
    private tipsbg: NineSlicePatch;
    private tipsText: BBCodeText;
    private mExpires: BBCodeText;
    private mixWidth: number;
    private mixHeight: number;
    // private testText: Phaser.GameObjects.Text;
    constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1, mixWidth?: number, mixHeight?: number,) {
        super(scene);
        this.dpr = dpr;
        this.key = key;
        this.mixWidth = mixWidth || 100 * dpr;
        this.mixHeight = mixHeight || 96 * dpr;
        const tipsWidth = this.mixWidth;
        const tipsHeight = this.mixHeight;
        this.setSize(tipsWidth, tipsHeight);
        this.tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, this.key, "tips_bg", {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        }, undefined, undefined, 0);
        this.tipsbg.setPosition(tipsWidth * 0.5, tipsHeight * 0.5);
        this.tipsbg.alpha = 0.6;
        this.tipsText = new BBCodeText(this.scene, 7 * dpr, -tipsHeight + 60 * this.dpr, "", {
            color: "#333333",
            fontSize: 12 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
            lineSpacing: 5 * dpr,
            padding: {
                top: 2 * dpr
            }
        }).setOrigin(0);
        this.tipsText.setWrapMode("char");
        this.tipsText.setWrapWidth(200 * dpr);
        this.mExpires = new BBCodeText(scene, 7 * dpr, 85 * dpr, "", {
            fontSize: 12 * this.dpr,
            fontFamily: Font.DEFULT_FONT,
        }).setOrigin(0);
        this.add([this.tipsbg, this.tipsText, this.mExpires]);
        this.tipsText.addImage("iv_coin", { key: this.key, frame: "iv_coin", y: -3 * this.dpr });
        this.tipsText.addImage("iv_diamond", { key: this.key, frame: "iv_diamond", y: -3 * this.dpr });
    }

    setTipsText(text: string) {
        this.tipsText.setText(text);
    }

    setProp(prop: any, servertime: number, property: any): this {// op_client.ICountablePackageItem, PlayerProperty
        if (!prop) {
            this.tipsText.setText(i18n.t("furni_bag.empty_backpack"));
            this.mExpires.text = "";
            this.resize();
        } else {
            const name = `[color=#32347b][b][size=${14 * this.dpr}]${prop.shortName || prop.name}[/size][/b][/color]`;
            // let price = "";
            let source = "";
            let describle = "";
            let attri = "";
            let need = "";
            let tips = name;
            let mixWidth: number = this.mixWidth;
            this.tipsText.text = tips;
            mixWidth = mixWidth < this.tipsText.width ? this.tipsText.width : mixWidth;
            if (prop.source) {
                // source = `${i18n.t("furni_bag.source")}：${prop.source}`;
                source = `${prop.source}`;
                tips += `\n[color=#ffffff][size=${12 * this.dpr}]${source}[/size][/color]`;
                this.tipsText.text = source;
                mixWidth = mixWidth < this.tipsText.width ? this.tipsText.width : mixWidth;
            }
            if (prop.des && prop.des !== "") {
                describle = prop.des;
                tips += "\n" + describle;
                this.tipsText.text = describle;
                mixWidth = mixWidth < this.tipsText.width ? this.tipsText.width : mixWidth;
            }
            let isline = false;
            if (prop.affectValues) {
                const len = prop.affectValues.length;
                for (let i = 0; i < len; i++) {
                    const affect = prop.affectValues[i];
                    if (property.propertiesMap) {
                        const proper = property.propertiesMap.get(affect.key);
                        if (proper) {
                            const value = affect.value > 0 ? `[color=#ffff00]+${affect.value}[/color]` : `[color=#ff0000]${affect.value}[/color]`;
                            attri += `\n${proper.name}: ${value}`;
                        }
                    }
                }
                if (attri.length > 0) {
                    if (!isline) {
                        isline = true;
                        tips += "\n-- -- -- -- -- -- -- --";
                    }
                    tips += `\n[color=#ffffff]${i18n.t("furni_bag.properties")}[/color]` + `${attri}`;
                }
            }
            if (prop.requireValues) {
                const len = prop.requireValues.length;
                for (let i = 0; i < len; i++) {
                    const require = prop.requireValues[i];
                    if (property.propertiesMap) {
                        const proper = property.propertiesMap.get(require.key);
                        if (proper) {
                            const value = proper.value >= require.value ? `[color=#00ff00](${require.value})[/color]` : `[color=#ff0000](${require.value})[/color]`;
                            need += `\n${proper.name}: ${value}`;
                        }
                    }
                }
                if (need.length > 0) {
                    if (!isline) {
                        isline = true;
                        tips += "\n-- -- -- -- -- -- -- --";
                    }
                    tips += `\n${i18n.t("furni_bag.needproper")}:${need}`;
                }
            }
            // const wrapwidth = mixWidth > maxWidth ? maxWidth : mixWidth;
            // this.tipsText.setWrapWidth(wrapwidth);
            this.tipsText.text = tips;
            this.width = this.tipsText.width + 14 * this.dpr;
            if (prop.expiredTime > 0) {
                if (!isline) {
                    isline = true;
                    tips += "\n-- -- -- -- -- -- -- --";
                }
                let interval = prop.expiredTime - servertime;
                const timeout = () => {
                    (<any>this.mExpires).visible = true;
                    this.mExpires.text = this.getDataFormat(interval * 1000);
                    if (interval > 0) {
                        this.timeID = setTimeout(() => {
                            interval -= 1;
                            timeout();
                        }, 1000);
                    } else {
                        this.timeID = undefined;
                    }
                };
                timeout();
            } else {
                (<any>this.mExpires).visible = false;
                if (this.timeID) clearTimeout(this.timeID);
            }
            this.resize();
        }
        return this;
    }
    private resize(w?: number, h?: number) {
        const mixheight: number = this.mixHeight;
        let height = this.tipsText.height;
        if ((<any>this.mExpires).visible) height += this.mExpires.height + 3 * this.dpr;
        height += 14 * this.dpr;
        height = height < mixheight ? mixheight : height;
        this.setSize(this.width, height);
        this.tipsbg.resize(this.width, this.height);
        this.tipsbg.x = this.width * 0.5;
        this.tipsbg.y = this.height * 0.5;
        this.tipsText.y = 7 * this.dpr;
        this.mExpires.y = this.tipsText.y + this.tipsText.height + 3 * this.dpr;

    }

    private getDataFormat(time: number) {
        const day = Math.floor(time / 86400000);
        const hour = Math.floor(time / 3600000) % 24;
        const minute = Math.floor(time / 60000) % 60;
        const second = Math.floor(time / 1000) % 60;
        let text = i18n.t("furni_bag.timelimit") + ":  ";
        if (day > 0) {
            const temptime = `${day}-${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
            text += `[color=#FF0000]${temptime}[/color]`;
        } else if (hour > 0 || minute > 0 || second > 0) {
            const temptime = `${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
            text += `[color=#FF0000]${temptime}[/color]`;
        } else {
            const temptime = `${i18n.t("furni_bag.expires")}`;
            text += `[color=#FF0000]${temptime}[/color]`;
        }
        // else if (minute > 0) {
        //   const temptime = `${this.stringFormat(minute)}:${this.stringFormat(second)}`;
        //   text += `[color=#FF0000]${temptime}[/color]`;
        // } else if (second > 0) {
        //   const temptime = `${this.stringFormat(second)}`;
        //   text += `[color=#FF0000]${temptime}[/color]`;
        // }
        //  else {
        //   const temptime = `${i18n.t("furni_bag.expires")}`;
        //   text += `[color=#FF0000]${temptime}[/color]`;
        // }
        return text;
    }
    private stringFormat(num: number) {
        let str = num + "";
        if (str.length <= 1) {
            str = "0" + str;
        }
        return str;
    }
}
