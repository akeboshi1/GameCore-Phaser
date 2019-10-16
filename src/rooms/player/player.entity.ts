import { Element } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { DragonbonesDisplay } from "../display/dragonbones.display";
import { op_client, op_def } from "pixelpai_proto";
import { Sprite } from "../element/sprite";
import { PlayerModel } from "./player.model";
import { BagEntity } from "./bag/bag.entity";
import { WorldService } from "../../game/world.service";

export enum PlayerState {
    IDLE = "idle",
    WALK = "walk",
    RUN = "run",
    ATTACK = "attack",
    JUMP = "jump",
    INJURED = "injured",
    FAILED = "failed",
    DANCE01 = "dance01",
    DANCE02 = "dance02",
    FISHING = "fishing",
    GREET01 = "greet01",
    SIT = "sit",
    LIE = "lit",
    EMOTION01 = "emotion01",
}

export class PlayerEntity extends Element {
    protected nodeType: number = op_def.NodeType.CharacterNodeType;
    protected mFlagContainer: Phaser.GameObjects.Container;
    protected mNickName: Phaser.GameObjects.Text;
    protected mBagEntity: BagEntity;
    private mPlayerModel: PlayerModel;
    constructor(sprite: Sprite, protected mElementManager: IElementManager) {
        super(sprite, mElementManager);
        this.mPlayerModel = sprite;
        if (this.mPlayerModel && this.mPlayerModel.package) {
            this.mBagEntity = new BagEntity(mElementManager.roomService.world);
            this.mBagEntity.register();
        }
        this.showNickName(this.mPlayerModel.nickname);
    }

    public getPlayerModel(): PlayerModel {
        return this.mPlayerModel;
    }

    public getBagEntity(): BagEntity {
        return this.mBagEntity;
    }

    public move(moveData: op_client.IMoveData) {
        if (this.getDirection() !== moveData.direction) {
            this.setDirection(moveData.direction);
        }
        // Logger.log("dir0:" + moveData.direction);
        super.move(moveData);
    }

    public setDirection(dir: number) {
        if (dir !== this.mDisplayInfo.avatarDir) {
            this.mDisplayInfo.avatarDir = dir;
            this.mDisplay.play(this.mCurState);
        }
        // Logger.log("dir1:" + dir);
    }

    public changeState(val?: string) {
        if (this.mCurState === val) return;
        if (!val) val = "idle";
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            (this.mDisplay as DragonbonesDisplay).play(val);
        }
    }

    public removeDisplay() {
        super.removeDisplay();
    }

    public destroy() {
        if (this.mBagEntity) {
            this.mBagEntity.destroy();
            this.mBagEntity = null;
        }
        super.destroy();
    }

    protected onMoveStart() {
        this.changeState(PlayerState.WALK);
    }

    protected showNickName(value: string) {
        if (!this.mNickName) {
            this.mNickName = this.mElementManager.scene.make.text(undefined, false).setOrigin(0, 0);
            if (this.flagContainer) this.flagContainer.add(this.mNickName);
        }
        this.mNickName.setText(value);
    }

    private mCheckStateHandle(val: string): boolean {
        // if (this.mCurState === val) return false;
        return true;
    }

    protected get flagContainer(): Phaser.GameObjects.Container {
        if (this.mFlagContainer) return this.mFlagContainer;
        if (!this.mDisplay) {
            return;
        }
        this.mFlagContainer = this.mElementManager.scene.make.container(undefined, false);
        this.mFlagContainer.y = -80;
        this.mDisplay.add(this.mFlagContainer);
    }
}
