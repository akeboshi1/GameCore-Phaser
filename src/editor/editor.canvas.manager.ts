import "tooqingphaser";
import "dragonBones";
import { IEditorCanvasConfig, ElementEditorCanvas, AvatarEditorCanvas, SceneEditorCanvas } from "../editor/canvas";

/*
编辑器画布生成器 用于生成编辑器专用的画布 和游戏用的launcher分开

使用方法(以ElementEditorCanvas为例)：
const canvas = EditorLauncher.createCanvas(EditorCanvasType.Element, {width:xx, height:xx, parent:xx});
canvas.start(data);
...
canvas.destroy();
*/
export enum EditorCanvasType {
    Element,
    Avatar,
    Scene
}

export class EditorCanvasManager {
    // public static CreateCanvas<T extends EditorCanvas>(type: string, config: IEditorCanvasConfig): T {
    //     var canvas = Object.create(window[type].prototype);
    //     canvas.constructor.apply(canvas, config);
    //     return canvas as T;
    // }

    public static CreateCanvas(type: EditorCanvasType, config: IEditorCanvasConfig) {
        switch (type) {
            case EditorCanvasType.Element:
                return new ElementEditorCanvas(config);
            case EditorCanvasType.Avatar:
                return new AvatarEditorCanvas(config);
            case EditorCanvasType.Scene:
                return new SceneEditorCanvas(config);
        }
    }
}
