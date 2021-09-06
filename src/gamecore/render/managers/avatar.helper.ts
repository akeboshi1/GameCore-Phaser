import { Scene } from "tooqingphaser";
import { Render } from "../render";
import {AvatarSuitType, IDragonbonesModel, Logger} from "structure";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
import { AvatarEditorDragonbone, AvatarEditorScene } from "editor";

// 在runtime和editor中共用的avatar功能
export class AvatarHelper {
    public readonly AVATAR_CANVAS_TEST_DATA = [{ id: "5facff1a67d3b140e835e1d0", parts: ["head_hair"] }];

    private readonly AVATAR_CANVAS_RESOURCE_PATH = "https://osd-alpha.tooqing.com";
    private readonly AVATAR_CANVAS_PARENT = "avatarCanvas";
    private readonly SCENEKEY_SNAPSHOT: string = "AvatarEditorSnapshotScene";
    private readonly HEAD_ICON_HIDE_PIX = 22;// 头像截图中，下方隐藏的龙骨高度
    private readonly HEAD_ICON_WIDTH = 71;// 头像截图中，图片宽度
    private readonly HEAD_ICON_HEIGHT = 57;// 头像截图中，图片高度
    private readonly HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT = 79;// 头像截图中，含隐藏部分的整个高度
    private readonly HEAD_ICON_DEFAULT_BOTTOM_PIX = 0;// 头像截图中，龙骨所处位置下方的区域（/像素）

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
            const replaceTexKey = dbDisplay.generateReplaceTextureKey();
            const dbUrls = this.render.url.getUsrAvatarTextureUrls(replaceTexKey);
            this.render.httpService.headDBTexture(dbUrls.img, dbUrls.json)
                .then((exists) => {
                    if (exists) {
                        return Promise.resolve(null);
                    } else {
                        return new Promise<any>((_res, _rej) => {
                            dbDisplay.save()
                                .then((saveData) => {
                                    this.render.httpService.uploadDBTexture(saveData.key, saveData.url, saveData.json)
                                        .catch((reason) => {
                                            Logger.getInstance().error("uploadDBTexture error: " + reason);
                                        });
                                    _res(null);
                                })
                                .catch((res) => {
                                    _rej(res);
                                });
                        });

                    }
                })
                .then(() => {
                    return this.createHeadIcon(dbDisplay.displayInfo);
                })
                .then((str) => {
                    this.render.httpService.uploadHeadImage(str);
                    resolve(null);
                })
                .catch((reason) => {
                    Logger.getInstance().error("save avatar error: " + reason);
                    reject(reason);
                });
        });
    }

    public createHeadIcon(data: IDragonbonesModel): Promise<string> {// IAvatarSet
        return new Promise<string>((resolve, reject) => {
            const curScene = this.render.sceneManager.currentScene;
            const dragonbones = new DragonbonesDisplay(curScene, this.render);
            dragonbones.load(data)
                .then(() => {
                    dragonbones.forceUpdateShow();
                    const rt = curScene.make.renderTexture({ x: 0, y: 0, width: this.HEAD_ICON_WIDTH, height: this.HEAD_ICON_HEIGHT }, false);
                    rt.draw(dragonbones, this.HEAD_ICON_WIDTH * 0.5, this.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT);
                    rt.snapshot((img) => {
                        dragonbones.destroy();
                        rt.destroy(true);
                        resolve((<HTMLImageElement>img).src);
                    });
                });
        });
    }
}
