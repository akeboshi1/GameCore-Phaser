import {BasicTerrainItem} from "./BasicTerrainItem";
import {TerrainSceneLayer} from "../view/TerrainSceneLayer";
import Globals from "../../../Globals";
import {BasicTerrainAvatar} from "../../../common/avatar/BasicTerrainAvatar";

export class TerrainAnimationItem extends BasicTerrainItem  {
    private avatar: BasicTerrainAvatar;
    protected mAnimationDirty = false;
    protected myAnimationName: string;
    public constructor(game: Phaser.Game, owner: TerrainSceneLayer) {
        super(game, owner);
    }

    public releaseTerrainItem() {
        super.releaseTerrainItem();
        if (this.avatar) this.avatar.onDispose();
        this.avatar = null;
    }

    protected onTerrainItemCreate(): void {
        this.terrainIsoDisplayObject = new BasicTerrainAvatar(Globals.game);
        super.onTerrainItemCreate();
    }

    protected onTerrainItemLoad(): void {
        super.onTerrainItemLoad();
        (<BasicTerrainAvatar>this.terrainIsoDisplayObject).loadModel(this.data.type, this.onTerrainItemLoadComplete, this);
    }

    protected onTerrainItemLoadComplete(): void {
        this.setAnimation(this.data.animationName);
        super.onTerrainItemLoadComplete();
    }

    protected invalidAnimation(): void {
        this.mAnimationDirty = true;
    }

    public setAnimation(value: string): void {
        // Log.trace("角度-->"+value);
        this.myAnimationName = value;

        this.invalidAnimation();
    }

    public onTick(deltaTime: number): void {
        if (this.mAnimationDirty) {
            this.onAvatarAnimationChanged();
            this.mAnimationDirty = false;
        }
        super.onTick(deltaTime);
    }

    protected onAvatarAnimationChanged(): void {
        (<BasicTerrainAvatar>this.terrainIsoDisplayObject).animationName = this.myAnimationName;
    }
}
