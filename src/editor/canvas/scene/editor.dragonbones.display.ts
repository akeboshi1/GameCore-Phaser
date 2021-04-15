import { Sprite } from "baseModel";
import { BaseDragonbonesDisplay, ReferenceArea } from "baseRender";
import { LayerEnum } from "game-capsule";
import { IDragonbonesModel } from "structure";
import { EditorTopDisplay } from "./top.display";
import { op_def  } from "pixelpai_proto";

export class EditorDragonbonesDisplay extends BaseDragonbonesDisplay {
    public sprite: Sprite;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: EditorTopDisplay;
    protected mNodeType: op_def.NodeType;
    constructor(scene: Phaser.Scene, sprite: Sprite) {
        super(scene);
        this.setSprite(sprite);
        this.mNodeType = sprite.nodeType;
    }

    asociate() {
    }

    selected() {
        this.showNickname();
    }

    unselected() {
        this.hideNickname();
    }

    showRefernceArea() {
    }

    hideRefernceArea() {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    }

    showNickname() {
        this.topDisplay.showNickname(this.name);
    }

    hideNickname() {
        this.mTopDisplay.hideNickname();
    }

    setPosition(x?: number, y?: number, z?: number, w?: number) {
        super.setPosition(x, y, z, w);
        if (this.mTopDisplay) {
            this.mTopDisplay.update();
        }
        return this;
    }

    updateSprite(sprite: Sprite) {
        this.setSprite(sprite);
        const displayInfo = sprite.displayInfo;
        if (displayInfo) {
            this.load(<IDragonbonesModel> displayInfo);
        }
        const pos = sprite.pos;
        if (pos) {
            this.setPosition(pos.x, pos.y, pos.z);
        }
        this.name = sprite.nickname;
        this.play(sprite.currentAnimation);
        this.asociate();
    }

    setSprite(sprite: Sprite) {
        this.sprite = sprite;
        if (!sprite.currentAnimationName) {
            sprite.setAnimationName("idle");
        }
        this.defaultLayer();
    }

    clear() {
        this.mMountList.forEach((val, key) => {
            this.unmount(val);
        });
    }

    getMountIds() {
        // const result = [];
        // if (this.mMountList) {
        //     this.mMountList.forEach((val, key) => {
        //         const id = (<BaseDragonbonesDisplay> val).id;
        //         if (id) result.push(id);
        //     });
        // }
        return [];
    }

    toSprite() {
        if (!this.sprite) {
            return;
        }
        const pos = this.sprite.pos;
        pos.x = this.x;
        pos.y = this.y;
        pos.z = this.z;
        const sprite = this.sprite.toSprite();
        const mountIds = this.getMountIds();
        sprite.mountSprites = mountIds;
        return sprite;
    }

    protected createArmatureDisplay() {
        super.createArmatureDisplay();
        this.setData("id", this.sprite.id);
    }

    get isMoss() {
        return false;
    }

    get nodeType(): number {
        return this.mNodeType;
    }

    get id(): number {
        return this.sprite.id;
    }

    /**
     * 兼容没有Layer的情况
     * @deprecated
     */
    protected defaultLayer() {
        if (!this.sprite.layer) {
            this.sprite.layer = LayerEnum.Surface;
        }
    }

    protected get topDisplay() {
        if (!this.mTopDisplay) {
            this.mTopDisplay = new EditorTopDisplay(this.scene, this, 1);
        }
        return this.mTopDisplay;
    }
}
