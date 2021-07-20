import { Scene } from "tooqingphaser";
import { Render } from "../render";
import { AvatarSuitType, Logger } from "structure";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
import { AvatarEditorDragonbone, AvatarEditorScene } from "editor";

// 在runtime和editor中共用的avatar功能
export class AvatarHelper {
    public readonly AVATAR_CANVAS_TEST_DATA = [{ id: "5facff1a67d3b140e835e1d0", parts: ["head_hair"] }];

    private readonly AVATAR_CANVAS_RESOURCE_PATH = "https://osd-alpha.tooqing.com";
    private readonly AVATAR_CANVAS_PARENT = "avatarCanvas";
    private readonly SCENEKEY_SNAPSHOT: string = "AvatarEditorSnapshotScene";

    constructor(protected render: Render) {
    }

    public destroy() {
        if (this.render.game) {
            this.render.game.scene.stop(this.SCENEKEY_SNAPSHOT);
            this.render.game.scene.remove(this.SCENEKEY_SNAPSHOT);
        }
    }

    // 生成合图；上传合图（png+json）；生成头像；上传头像
    // dbDisplay: 已经装扮完成（数据正确）的龙骨显示对象
    public saveAvatar(dbDisplay: DragonbonesDisplay): Promise<any> {
        if (!dbDisplay || !dbDisplay.displayInfo || !dbDisplay.displayInfo.avatar) {
            return Promise.reject("display info error");
        }

        return new Promise<any>((resolve, reject) => {
            const avatarSets = AvatarSuitType.toIAvatarSets(dbDisplay.displayInfo.avatar);
            // this.render.uiManager.showPanel(ModuleName.MASK_LOADING_NAME);
            dbDisplay.save()
                .then((saveData) => {
                    this.render.mainPeer.uploadDBTexture(saveData.key, saveData.url, saveData.json)
                        .catch((reason) => {
                            Logger.getInstance().error("uploadDBTexture error: " + reason);
                        });
                    return this.createHeadIcon(avatarSets);
                })
                .then((str) => {
                    this.render.mainPeer.uploadHeadImage(str);
                    // this.render.uiManager.hidePanel(ModuleName.MASK_LOADING_NAME);
                    resolve(null);
                })
                .catch((reason) => {
                    Logger.getInstance().error("save avatar error: " + reason);
                    reject(reason);
                });
        });
    }

    public createHeadIcon(sets: any[]): Promise<string> {// IAvatarSet
        return new Promise<string>((resolve, reject) => {
            if (!this.render.game.scene.getScene(this.SCENEKEY_SNAPSHOT)) this.render.game.scene.add(this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
            this.render.sceneManager.currentScene.scene.launch(this.SCENEKEY_SNAPSHOT, {
                onCreated: (s: Scene) => {
                    this.render.game.scene.sendToBack(this.SCENEKEY_SNAPSHOT);
                    const a = new AvatarEditorDragonbone(s, this.render.url.RES_PATH, this.render.url.OSD_PATH, this.render.emitter, false, sets,
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
