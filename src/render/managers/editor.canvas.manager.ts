import { Scene } from "tooqinggamephaser";
import { AvatarEditorScene } from "../../editor/canvas/avatar/avatar.editor.canvas";
import { AvatarEditorDragonbone } from "../../editor/canvas/avatar/avatar.editor.dragonbone";
import { Render } from "../render";

export class EditorCanvasManager {
    public readonly AVATAR_CANVAS_TEST_DATA = [{ id: "5facff1a67d3b140e835e1d0", parts: ["head_hair"] }];

    private readonly AVATAR_CANVAS_RESOURCE_PATH = "https://osd-alpha.tooqing.com";
    private readonly AVATAR_CANVAS_PARENT = "avatarCanvas";
    private readonly SCENEKEY_SNAPSHOT: string = "AvatarEditorSnapshotScene";

    constructor(private render: Render) {
    }

    public destroy() {
        if (this.render.game) {
            this.render.game.scene.stop(this.SCENEKEY_SNAPSHOT);
            this.render.game.scene.remove(this.SCENEKEY_SNAPSHOT);
        }
    }

    public createHeadIcon(sets: any[]): Promise<string> {// IAvatarSet
        return new Promise<string>((resolve, reject) => {
            if (!this.render.game.scene.getScene(this.SCENEKEY_SNAPSHOT)) this.render.game.scene.add(this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
            this.render.sceneManager.currentScene.scene.launch(this.SCENEKEY_SNAPSHOT, {
                onCreated: (s: Scene) => {
                    this.render.game.scene.sendToBack(this.SCENEKEY_SNAPSHOT);
                    const a = new AvatarEditorDragonbone(s, this.AVATAR_CANVAS_RESOURCE_PATH, this.render.emitter, false, sets,
                        (dragonbone) => {
                            dragonbone.generateHeadIcon().then((src) => {
                                resolve(src);

                                dragonbone.destroy();
                                this.render.game.scene.stop(this.SCENEKEY_SNAPSHOT);
                                this.render.game.scene.remove(this.SCENEKEY_SNAPSHOT);
                            });
                        });
                }
            });
        });
    }
}
