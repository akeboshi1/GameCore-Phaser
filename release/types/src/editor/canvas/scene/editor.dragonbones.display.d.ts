import { Sprite } from "baseGame";
import { BaseDragonbonesDisplay, ReferenceArea } from "baseRender";
import { EditorTopDisplay } from "./top.display";
import { op_def } from "pixelpai_proto";
import { IEditorCanvasConfig } from "../editor.canvas";
export declare class EditorDragonbonesDisplay extends BaseDragonbonesDisplay {
    sprite: Sprite;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: EditorTopDisplay;
    protected mNodeType: op_def.NodeType;
    constructor(scene: Phaser.Scene, config: IEditorCanvasConfig, sprite: Sprite);
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
    clear(): void;
    getMountIds(): any[];
    toSprite(): import("pixelpai_proto").op_client.ISprite;
    protected createArmatureDisplay(): void;
    get isMoss(): boolean;
    get nodeType(): number;
    /**
     * 兼容没有Layer的情况
     * @deprecated
     */
    protected defaultLayer(): void;
    protected get topDisplay(): EditorTopDisplay;
}
