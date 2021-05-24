/// <reference types="phaser" />
export declare class AvatarEditorDragonbone extends Phaser.GameObjects.Container {
    private static readonly DRAGONBONE_NAME_DEFAULT;
    private static readonly DRAGONBONE_NAME_HEAD;
    private static readonly DRAGONBONE_ARMATURE_NAME;
    private static readonly BASE_PARTS;
    private static readonly ADD_PARTS;
    private static readonly BOTTOM_BODY_PARTS;
    private static readonly HAIR_BACK;
    private static readonly DEFAULT_SETS;
    private static readonly SPECIAL_SETS;
    private static readonly MODEL_SETS;
    private static readonly DEFAULT_SCALE_GAME_HEIGHT;
    private static readonly DEFAULT_SCALE_BOTTOM_PIX;
    private static readonly ARMATURE_HEIGHT;
    private static readonly ARMATURE_LEG_PERCENT;
    private static readonly HEAD_ICON_HIDE_PIX;
    private static readonly HEAD_ICON_WIDTH;
    private static readonly HEAD_ICON_HEIGHT;
    private static readonly HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT;
    private static readonly HEAD_ICON_DEFAULT_BOTTOM_PIX;
    private mDisplay_default;
    private mDisplay_head;
    private mEmitter;
    private mAutoScale;
    private mWebHomePath;
    private mCurAnimationName;
    private mCurDir;
    private mBaseSets;
    private mSets;
    private mParts;
    private mArmatureBottomArea;
    private mArmatureBottomArea_head;
    private mOnReadyForSnapshot;
    constructor(scene: Phaser.Scene, webHomePath: string, emitter: Phaser.Events.EventEmitter, autoScale: boolean, startSets?: any[], onReadyForSnapshot?: (a: AvatarEditorDragonbone) => any);
    destroy(): void;
    loadLocalResources(img: any, part: string, dir: string): Promise<string>;
    setDir(dir: number): void;
    play(animationName: string): void;
    clearParts(): void;
    mergeParts(sets: any[]): void;
    cancelParts(sets: any[]): void;
    generateShopIcon(width: number, height: number): Promise<string>;
    generateHeadIcon(): Promise<string>;
    get curSets(): any[];
    private createDisplays;
    private setBaseSets;
    private addSets;
    private applySets;
    private removeSets;
    private reloadDisplay;
    private partTextureSaveKey;
    private removePartsInSets;
    private removePartsInCurParts;
    private getSnapshotModelData;
    private snapshot;
    private convertPartsToIDragonbonesModel;
    private convertPartNameToIAvatarKey;
}
