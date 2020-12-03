import { AvatarEditorCanvas, EditorCanvasType, EditorLauncher } from "editorCanvas";
import { Render } from "../render";

export class EditorCanvasManager {
    public readonly AVATAR_CANVAS_TEST_DATA = [{ id: "5facff1a67d3b140e835e1d0", parts: ["head_hair"] }];

    private readonly AVATAR_CANVAS_WIDTH = 72;
    private readonly AVATAR_CANVAS_HEIGHT = 72;
    private readonly AVATAR_CANVAS_RESOURCE_PATH = "https://osd-alpha.tooqing.com/avatar/part";
    private readonly AVATAR_CANVAS_PARENT = "avatarCanvas";
    private readonly HEAD_ICON_WIDTH = 71;// 头像截图中，图片宽度
    private readonly HEAD_ICON_HEIGHT = 57;// 头像截图中，图片高度

    private avatarCanvas: AvatarEditorCanvas;

    constructor(private render: Render) {
        this.createAvatarCanvas();
    }

    public destroy() {
        if (this.avatarCanvas) this.avatarCanvas.destroy();
        const ifrm = document.getElementById(this.AVATAR_CANVAS_PARENT);
        if (ifrm) ifrm.remove();
    }

    public createHeadIcon(sets: any[]): Promise<string> {// IAvatarSet
        this.avatarCanvas.mergeParts(sets);
        return this.avatarCanvas.generateHeadIcon(this.HEAD_ICON_WIDTH, this.HEAD_ICON_HEIGHT);
    }

    private createAvatarCanvas() {
        let ifrm = document.getElementById(this.AVATAR_CANVAS_PARENT);
        if (!ifrm) {
            const renderParentName = this.render.config.parent;
            const renderParent = document.getElementById(renderParentName);

            ifrm = document.createElement("iframe");
            ifrm.setAttribute("id", this.AVATAR_CANVAS_PARENT);
            ifrm.style.height = "0px";
            renderParent.appendChild(ifrm);
        }

        this.avatarCanvas = EditorLauncher.CreateCanvas(
            EditorCanvasType.Avatar,
            {
                width: this.AVATAR_CANVAS_WIDTH,
                height: this.AVATAR_CANVAS_HEIGHT,
                parent: this.AVATAR_CANVAS_PARENT,
                node: {
                    WEB_AVATAR_PATH: this.AVATAR_CANVAS_RESOURCE_PATH
                },
            }
        ) as AvatarEditorCanvas;
    }
}
