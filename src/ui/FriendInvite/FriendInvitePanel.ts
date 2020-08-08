import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { i18n } from "../../i18n";
import { NinePatchButton } from "../components/ninepatch.button";
import { NineSliceButton } from "../../../lib/rexui/lib/ui/button/NineSliceButton";
import BBCodeText from "../../../lib/rexui/lib/plugins/gameobjects/text/bbcodetext/BBCodeText";
import { Font } from "../../utils/font";
import { CoreUI } from "../../../lib/rexui/lib/ui/interface/event/MouseEvent";
import i18next from "i18next";

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

    show() {
        super.show();
        if (this.mInitialized) {
            this.showInvite();
        }
    }

    public addListen() {
        super.addListen();
        this.refused.on(CoreUI.MouseEvent.Tap, this.onRefusedHandler, this);
        this.agree.on(CoreUI.MouseEvent.Tap,this.onAgreeHandler, this);
    }

    public removeListen() {
        super.removeListen();
        this.refused.off(CoreUI.MouseEvent.Tap, this.onRefusedHandler, this);
        this.agree.off(CoreUI.MouseEvent.Tap,this.onAgreeHandler, this);
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
        this.bg.fillRoundedRect(0, 0, this.width, this.height, { tl: 0, tr: radius, br: radius, bl: 0});

        this.text = new BBCodeText(this.scene, this.width * 0.5, 7 * this.dpr, {}).setOrigin(0.5, 0).setFontSize(10 * this.dpr).setFontFamily(Font.DEFULT_FONT);

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
        this.x = -this.width;
        this.text.text = `[color=#FFFF00]1323[/color] focus on you`;
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
        this.emit("agree");
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
                this.emit("hide");
            }
        });
    }

    private setAgressText() {
        if (this.agree) {
            this.agree.setText(`${i18n.t("friend_invite.agree")}(${this.countdown})`);
        }
    }
}
