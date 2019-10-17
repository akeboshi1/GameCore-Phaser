import {Font} from "../../utils/font";
import {Logger} from "../../utils/log";
import {DynamicSprite} from "../../ui/components/dynamic.sprite";
import {DynamicImage} from "../../ui/components/dynamic.image";
import { op_def } from "pixelpai_proto";
import {Url} from "../../utils/resUtil";

export enum DisplayField {
    BACKEND = 1,
    STAGE,
    FRONTEND,
    FLAG
}

export class DisplayObject extends Phaser.GameObjects.Container {
    protected mFlagContainer: Phaser.GameObjects.Container;
    protected mNickname: Phaser.GameObjects.Text;
    protected mBadges: DynamicImage[];
    protected mBackEffect: DynamicSprite;
    protected mFrontEffect: DynamicSprite;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

    public destroy(fromScene?: boolean): void {
        if (this.mFlagContainer) {

            if (this.mNickname) {
                this.mNickname.destroy();
                this.mNickname = null;
            }

            if (this.mBackEffect) {
                this.mBackEffect.destroy();
                this.mBackEffect = null;
            }

            if (this.mFrontEffect) {
                this.mFrontEffect.destroy();
                this.mFrontEffect = null;
            }

            this.clearBadges();

            this.mFlagContainer.destroy();
            this.mFlagContainer = null;
        }
        super.destroy(fromScene);
    }

    public showNickname(val: string) {
        if (!this.mNickname) {
            this.mNickname = this.scene.make.text({ style: { font: Font.YAHEI_14_BOLD } }, false).setOrigin(0.5, 0.5);
            this.flagContainer.add(this.mNickname);
        }
        this.mNickname.setText(val);
        this.layouFlag();
    }

    public setDisplayBadges(cards: op_def.IBadgeCard[]) {
        if (this.mBadges) this.mBadges = [];
        else this.clearBadges();
        for (const card of cards) {
            const badge = new DynamicImage(this.scene, 0, 0);
            badge.load(card.thumbnail, this, this.layouFlag);
            this.mFlagContainer.add(badge);
            this.mBadges.push(badge);
        }
    }

    public showEffect() {
        this.addEffect(this.mBackEffect, Url.getRes("ui/vip/vip_effect_back.png"), Url.getRes("ui/vip/vip_effect_back.json"), true, 15, false, true);
        this.addEffect(this.mFrontEffect, Url.getRes("ui/vip/vip_effect_front.png"), Url.getRes("ui/vip/vip_effect_front.json"), true, 15, false, true);
    }

    protected addEffect(target: DynamicSprite, textureURL: string, atlasURL?: string, isBack?: boolean, framerate?: number, loop?: boolean, killComplete?: boolean) {
        if (!target) {
            target = new DynamicSprite(this.scene, 0, 0);
        }
        target.load(textureURL, atlasURL);
        if (isBack) {
            this.addAt(target, DisplayField.BACKEND);
        } else {
            this.addAt(target, DisplayField.FRONTEND);
        }
        // target.play(textureURL + atlasURL);
        target.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
            target.destroy();
        });
    }

    protected layouFlag(offset: number = 4) {
        if (!this.mFlagContainer) return;
        this.mFlagContainer.y = -96;
        const children = this.mFlagContainer.list;
        // let _x = 0;
        for (const child of children) {
            // child["x"] = _x;
            // if (child["width"])
        }
    }

    protected clearBadges() {
        if (!this.mBadges) return;
        for (const badge of this.mBadges) {
            badge.destroy();
        }
        this.mBadges.length = 0;
    }

    protected get flagContainer(): Phaser.GameObjects.Container {
        if (this.mFlagContainer) return this.mFlagContainer;
        this.mFlagContainer = this.scene.make.container(undefined, false);
        this.addAt(this.mFlagContainer, DisplayField.FLAG);
        return this.mFlagContainer;
    }

}
