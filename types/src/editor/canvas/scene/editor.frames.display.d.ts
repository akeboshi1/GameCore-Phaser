import { Sprite } from "baseModel";
import { BaseDragonbonesDisplay, BaseFramesDisplay, ReferenceArea } from "baseRender";
import { RunningAnimation } from "structure";
import { SceneEditorCanvas } from "./scene.editor.canvas";
import { EditorTopDisplay } from "./top.display";
export declare class EditorFramesDisplay extends BaseFramesDisplay {
    protected sceneEditor: SceneEditorCanvas;
    sprite: Sprite;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: EditorTopDisplay;
    protected mIsMoss: boolean;
    protected mOverlapped: boolean;
    protected mLayer: number;
    constructor(sceneEditor: SceneEditorCanvas, sprite: Sprite);
    mount(display: BaseFramesDisplay | BaseDragonbonesDisplay, targetIndex?: number): void;
    unmount(display: BaseFramesDisplay | BaseDragonbonesDisplay): void;
    asociate(): void;
    selected(): void;
    unselected(): void;
    showRefernceArea(): void;
    hideRefernceArea(): void;
    showNickname(): void;
    hideNickname(): void;
    setPosition(x?: number, y?: number, z?: number, w?: number): this;
    updateSprite(sprite: Sprite): void;
    setSprite(sprite: Sprite): void;
    /**
     * TODO sprite仅用于和编辑器通信，后期会删除
     * @deprecated
     */
    toSprite(): import("pixelpai_proto").op_client.ISprite;
    clear(): void;
    getMountIds(): any[];
    updateMountPoint(ele: EditorFramesDisplay, x: number, y: number): void;
    play(val: RunningAnimation): void;
    protected fetchProjection(): void;
    protected getCollisionArea(): any;
    protected getOriginPoint(): any;
    protected get topDisplay(): EditorTopDisplay;
    protected get elementManager(): import("./manager/element.manager").EditorElementManager;
    /**
     * 兼容没有Layer的情况
     * @deprecated
     */
    protected defaultLayer(): void;
    set isMoss(val: boolean);
    get isMoss(): boolean;
    set overlapped(val: boolean);
}
