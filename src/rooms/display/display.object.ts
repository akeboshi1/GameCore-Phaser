import { Font } from "../../utils/font";
import { Logger } from "../../utils/log";
import { DynamicSprite } from "../../ui/components/dynamic.sprite";
import { DynamicImage } from "../../ui/components/dynamic.image";
import { op_def } from "pixelpai_proto";
import { Url } from "../../utils/resUtil";
import { ReferenceArea } from "../editor/reference.area";
import { IRoomService } from "../room";
import { Pos } from "../../utils/pos";
import { ElementDisplay } from "./element.display";
import { IFramesModel } from "./frames.model";
import { IDragonbonesModel } from "./dragonbones.model";
import { IElement } from "../element/element";

export enum DisplayField {
    BACKEND = 1,
    STAGE,
    FRONTEND,
    FLAG
}

export class DisplayObject extends Phaser.GameObjects.Container implements ElementDisplay {
    /**
     * 实际透明度，避免和tween混淆
     */
    protected mAlpha: number = 1;

    protected mBaseLoc: Phaser.Geom.Point;
    protected mCollisionArea: number[][];
    protected mOriginPoint: Phaser.Geom.Point;
    protected mRoomService: IRoomService;
    protected mFlagContainer: Phaser.GameObjects.Container;
    protected mNickname: Phaser.GameObjects.Text;
    protected mBadges: DynamicImage[];
    protected mBackEffect: DynamicSprite;
    protected mFrontEffect: DynamicSprite;
    protected mReferenceArea: ReferenceArea;
    protected mElement: IElement;
    constructor(scene: Phaser.Scene, roomService: IRoomService, element?: IElement) {
        super(scene);
        this.mElement = element;
        this.mRoomService = roomService;
    }

    public changeAlpha(val?: number) {
        if (this.mAlpha === val) {
            return;
        }
        this.alpha = val;
        this.mAlpha = val;
    }

    public removeFromParent(): void {
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
    }

    fadeIn(callback?: () => void) {
    }

    fadeOut(callback?: () => void) {
    }

    load(data: IFramesModel | IDragonbonesModel, field?: DisplayField) {
    }

    play(animationName: string, field?: DisplayField) {
    }

    public destroy(fromScene?: boolean): void {
        if (this.mFlagContainer) {
            if (this.mNickname) {
                this.mNickname.destroy();
                this.mNickname = undefined;
            }

            if (this.mBackEffect) {
                this.mBackEffect.destroy();
                this.mBackEffect = undefined;
            }

            if (this.mFrontEffect) {
                this.mFrontEffect.destroy();
                this.mFrontEffect = undefined;
            }

            this.clearBadges();

            this.mFlagContainer.destroy();
            this.mFlagContainer = undefined;
        }
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
        // this.removeAll(true);
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
        if (!this.mBadges) this.mBadges = [];
        else this.clearBadges();
        for (const card of cards) {
            const badge = new DynamicImage(this.scene, 0, 0);
            badge.load(Url.getOsdRes(card.thumbnail), this, this.layouFlag);
            this.flagContainer.add(badge);
            this.mBadges.push(badge);
        }
    }

    public showRefernceArea() {
        if (!this.mReferenceArea) {
            this.mReferenceArea = new ReferenceArea(this.scene, this.mRoomService);
        }
        if (!this.mCollisionArea || this.mCollisionArea.length <= 0) return;
        this.mReferenceArea.draw(this.mCollisionArea, this.mOriginPoint);
        this.addAt(this.mReferenceArea, 0);
    }

    public hideRefernceArea() {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
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
        target.y = -20;
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
        this.bringToTop(this.mNickname);
        const children = this.mFlagContainer.list;
        let _x = 0;
        for (const child of children) {
            child["x"] = _x;
            if (child["width"]) _x = child["width"];
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

    get baseLoc(): Phaser.Geom.Point {
        return this.mBaseLoc || new Phaser.Geom.Point();
    }

    get sortX(): number {
        return this.x;
    }

    get sortY(): number {
        return this.y;
    }

    get element(): IElement {
        return this.mElement;
    }

    get collisionArea() {
        return this.mCollisionArea;
    }

    get originPoint() {
        return this.mOriginPoint;
    }
}
