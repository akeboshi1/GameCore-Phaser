import { Font } from "../../utils/font";
import { DynamicSprite } from "../../ui/components/dynamic.sprite";
import { DynamicImage } from "../../ui/components/dynamic.image";
import { op_def } from "pixelpai_proto";
import { Url } from "../../utils/resUtil";
import { ReferenceArea } from "../editor/reference.area";
import { IRoomService } from "../room";
import { ElementDisplay } from "./element.display";
import { IFramesModel } from "./frames.model";
import { IDragonbonesModel } from "./dragonbones.model";
import { IElement } from "../element/element";
import { AnimationData } from "../element/sprite";
import { DisplayEntity } from "./display.entity";

export enum DisplayField {
    BACKEND = 1,
    STAGE,
    FRONTEND,
    FLAG,
    Effect
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
    protected mReferenceArea: ReferenceArea;
    protected mElement: IElement;
    protected mChildMap: Map<string, any>;
    protected mDirection: number = 3;
    protected mAntial: boolean = false;
    protected mActionName: AnimationData;
    protected mDisplays: Map<DisplayField, DisplayEntity[]> = new Map<DisplayField, DisplayEntity[]>();
    constructor(scene: Phaser.Scene, roomService: IRoomService, element?: IElement, antial: boolean = false) {
        super(scene);
        this.mElement = element;
        this.mRoomService = roomService;
        this.mAntial = antial;
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

    play(animationName: AnimationData, field?: DisplayField, data?: IFramesModel | IDragonbonesModel) {
    }

    mount(ele: Phaser.GameObjects.Container, targetIndex?: number) { }

    unmount(ele: Phaser.GameObjects.Container) { }

    public destroy(fromScene?: boolean): void {
        if (this.mFlagContainer) {
            if (this.mNickname) {
                this.mNickname.destroy();
                this.mNickname = undefined;
            }
            this.clearBadges();
            this.mFlagContainer.destroy();
            this.mFlagContainer = undefined;
        }

        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
        if (this.mChildMap) {
            this.mChildMap.clear();
            this.mChildMap = null;
        }
        // this.removeAll(true);
        super.destroy(fromScene);
    }

    public showNickname(val: string) {
        if (!this.mNickname) {
            this.mNickname = this.scene.make.text({ style: { font: Font.YAHEI_14_BOLD } }, false).setOrigin(0.5, 0.5);
            this.mNickname.setStroke("#0", 2);
            if (this.mAntial) {
                this.mNickname.setShadow(2, 2, "#0", 4, true, true);
            }
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
            this.addChildMap("reference", this.mReferenceArea);
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

    scaleTween(): void { }

    public showEffect() {
        // this.addEffect(this.mBackEffect, Url.getRes("ui/vip/vip_effect_back.png"), Url.getRes("ui/vip/vip_effect_back.json"), true, 15, false, true);
        // this.addEffect(this.mFrontEffect, Url.getRes("ui/vip/vip_effect_front.png"), Url.getRes("ui/vip/vip_effect_front.json"), true, 15, false, true);
    }

    public getElement(key: string) {
        if (!this.mChildMap) {
            return;
        }
        return this.mChildMap.get(key);
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
        this.mFlagContainer = this.createFieldContainer(DisplayField.FLAG);
        return this.mFlagContainer;
    }

    protected getFieldIndex(field: DisplayField, index?: number) {
        const backend = this.getFieldCount(DisplayField.BACKEND, index);
        if (field === DisplayField.BACKEND) return backend;
        const stage = this.getFieldCount(DisplayField.STAGE, index);
        if (field === DisplayField.STAGE) return backend + stage;
        const frontend = this.getFieldCount(DisplayField.FRONTEND, index);
        if (field === DisplayField.FRONTEND) return backend + stage + frontend;
    }

    protected getFieldEnityIndex(field: DisplayField, enity: DisplayEntity) {
        const arr = this.mDisplays.get(field);
        const index = arr.indexOf(enity);
        if (index === -1) return undefined;
        return index;
    }

    protected getFieldCount(field: DisplayField, index?: number) {
        const arr = this.mDisplays.get(field);
        let count: number = 0;
        if (arr) {
            index = ((index === undefined) ? arr.length : index);
            for (let i = 0; i < index; i++) {
                count += arr[i].count;
            }
        }
        return count;
    }
    protected addFieldChild(child: DisplayEntity, field = DisplayField.STAGE, index?: number) {
        let arr: DisplayEntity[];
        if (this.mDisplays.has(field)) {
            arr = this.mDisplays.get(field);
        } else {
            arr = [];
            this.mDisplays.set(field, arr);
        }
        if (index !== undefined) {
            Phaser.Utils.Array.AddAt(arr, child, index);
        } else {
            arr.push(child);
        }
    }

    protected createFieldContainer(field: DisplayField) {
        const container = this.scene.make.container(undefined, false);
        this.addAt(container, field);
        return container;
    }

    protected addChildMap(key: string, display: Phaser.GameObjects.GameObject) {
        if (!this.mChildMap) {
            this.mChildMap = new Map();
        }
        this.mChildMap.set(key, display);
    }

    protected removeChildMap(key: string) {
        if (!this.mChildMap) {
            return;
        }
        this.mChildMap.delete(key);
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

    get sortZ(): number {
        return this.z || 0;
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
