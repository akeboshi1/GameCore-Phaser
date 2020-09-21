import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { i18n } from "../../i18n";
import { Font } from "../../utils/font";
import { NineSliceButton, BBCodeText, ClickEvent } from "apowophaserui";

export class FriendInvitePanel extends BasePanel {
    private bg: Phaser.GameObjects.Graphics;
    private refused: NineSliceButton;
    private agree: NineSliceButton;
    private text: BBCodeText;
    private countdown: number;
    private interval: any;
    private tween: Phaser.Tweens.Tween;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    show(params?: any) {
        super.show(params);
        if (this.mInitialized) {
            this.showInvite();
        }
    }

    public addListen() {
        super.addListen();
        this.refused.on(String(ClickEvent.Tap), this.onRefusedHandler, this);
        this.agree.on(String(ClickEvent.Tap), this.onAgreeHandler, this);
    }

    public removeListen() {
        super.removeListen();
        this.refused.off(String(ClickEvent.Tap), this.onRefusedHandler, this);
        this.agree.off(String(ClickEvent.Tap), this.onAgreeHandler, this);
    }

    public destroy() {
        if (this.tween) {
            this.tween.stop();
        }
        super.destroy();
    }

    protected preload() {
        this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
        super.preload();
    }

    protected init() {
        this.setSize(168 * this.dpr, 59 * this.dpr);
        const radius = 5 * this.dpr;
        this.bg = this.scene.make.graphics(undefined, false);
        this.bg.fillStyle(0, 0.6);
        this.bg.fillRoundedRect(0, 0, this.width, this.height, { tl: 0, tr: radius, br: radius, bl: 0 });

        this.text = new BBCodeText(this.scene, this.width * 0.5, 7 * this.dpr, "", {}).setOrigin(0.5, 0).setFontSize(10 * this.dpr).setFontFamily(Font.DEFULT_FONT);

        const width = 55 * this.dpr;
        const height = 24 * this.dpr;
        const config = {
            left: 12 * this.dpr,
            top: 12 * this.dpr,
            right: 12 * this.dpr,
            bottom: 12 * this.dpr
        };
        this.refused = new NineSliceButton(this.scene, (width) * 0.5 + 17.67 * this.dpr, (height) * 0.5 + 31 * this.dpr, width, height, UIAtlasKey.commonKey, "red_btn_normal", i18n.t("friend_invite.refused"), this.dpr, this.scale, config);
        this.agree = new NineSliceButton(this.scene, (this.width - width * 0.5) - 24.33 * this.dpr, (height) * 0.5 + 31 * this.dpr, width, height, UIAtlasKey.commonKey, "button_g", i18n.t("friend_invite.agree"), this.dpr, this.scale, config);

        this.add([this.bg, this.text, this.refused, this.agree]);

        super.init();
        this.y = 374 * this.dpr;
    }

    private showInvite() {
        if (this.tween) {
            this.tween.stop();
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (!this.showData || this.showData.length < 0) {
            return;
        }
        const data = this.showData[0];
        const buttons = data.button;
        if (buttons.length < 2) {
            return;
        }
        this.x = -this.width;
        this.text.text = `[color=#FFFF00]${data.text[0].text}[/color]`;
        this.agree.setText(buttons[1].text);
        this.agree.setData("data", buttons[1]);
        this.refused.setText(buttons[0].text);
        this.refused.setData("data", buttons[0]);
        this.countdown = 10;
        this.setAgressText();
        this.tween = this.scene.tweens.add({
            targets: this,
            props: { x: 0 },
            duration: 200,
            onComplete: () => {
                this.interval = setInterval(() => {
                    // this.countdown--;
                    if (--this.countdown < 0) {
                        this.close();
                        return;
                    }
                    this.setAgressText();
                }, 1000);
            }
        });
    }

    private onAgreeHandler() {
        if (!this.mShowData || this.mShowData.length < 1) {
            return;
        }
        const data = this.agree.getData("data");
        if (!data || !data.node) {
            return;
        }
        this.emit("targetUI", this.mShowData[0].id, data.node.id);
        this.close();
    }

    private onRefusedHandler() {
        this.close();
    }

    private close() {
        if (this.interval) clearInterval(this.interval);
        if (this.tween) {
            this.tween.stop();
        }
        this.tween = this.scene.tweens.add({
            targets: this,
            props: { x: -this.width },
            duration: 200,
            onComplete: () => {
                const data = this.refused.getData("data");
                if (data && data.node) this.emit("targetUI", this.mShowData[0].id, data.node.id);
                // this.emit("hide");
            }
        });
    }

    private setAgressText() {
        if (this.agree) {
            const data = this.agree.getData("data");
            if (data) {
                this.agree.setText(`${data.text}(${this.countdown})`);
            }
        }
    }
}
