import { Render } from "../render";
export declare class EditorCanvasManager {
    private render;
    readonly AVATAR_CANVAS_TEST_DATA: {
        id: string;
        parts: string[];
    }[];
    private readonly AVATAR_CANVAS_RESOURCE_PATH;
    private readonly AVATAR_CANVAS_PARENT;
    private readonly SCENEKEY_SNAPSHOT;
    constructor(render: Render);
    destroy(): void;
    createHeadIcon(sets: any[]): Promise<string>;
}
