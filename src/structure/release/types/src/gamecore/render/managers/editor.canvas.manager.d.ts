import { Render } from "../render";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
export declare class EditorCanvasManager {
    protected render: Render;
    readonly AVATAR_CANVAS_TEST_DATA: {
        id: string;
        parts: string[];
    }[];
    private readonly AVATAR_CANVAS_RESOURCE_PATH;
    private readonly AVATAR_CANVAS_PARENT;
    private readonly SCENEKEY_SNAPSHOT;
    constructor(render: Render);
    destroy(): void;
    saveAvatar(dbDisplay: DragonbonesDisplay): Promise<any>;
    createHeadIcon(sets: any[]): Promise<string>;
}
