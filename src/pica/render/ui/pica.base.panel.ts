import { UiManager, Render, BasePanel, BasicScene } from "gamecoreRender";
import { AtlasData, FolderType, UILoadType } from "picaRes";
import { Url } from "utils";
import { PicaRenderUiManager } from "./pica.Renderuimanager";
export class PicaBasePanel extends BasePanel {
    protected atlasNames: Array<string | AtlasData>;
    protected textures: Array<string | AtlasData>;
    protected tempDatas: any;
    constructor(private uiManager: UiManager) {
        super(uiManager.scene, uiManager.render);
    }
    protected initResource() {
        let datas;
        if (this.atlasNames) {
            const uimanager: PicaRenderUiManager = <PicaRenderUiManager>(this.uiManager);
            datas = uimanager.getUrlDatas(this.atlasNames);

        }
        if (this.textures) {
            const uimanager: PicaRenderUiManager = <PicaRenderUiManager>(this.uiManager);
            const tempdatas = uimanager.getUrlDatas(this.textures, UILoadType.texture);
            datas = datas ? datas.concat(tempdatas) : tempdatas;
        }
        if (datas) {
            for (const data of datas) {
                if (!this.cacheExists(UILoadType[data.uiType], data.atlasName)) {
                    if (data.uiType === UILoadType.atlas) {
                        this.setResourcesData("atlas", data.atlasName, data.atlasUrl, data.jsonUrl, data.foldType);
                    } else if (data.uiType === UILoadType.texture) {
                        this.setResourcesData("image", data.atlasName, data.atlasUrl, undefined, data.foldType);
                    } else if (data.uiType === UILoadType.video) {
                        this.setResourcesData("video", data.atlasName, data.atlasUrl, undefined, data.foldType);
                    }
                }
            }
        }
    }

    protected preload() {
        this.initResource();
        super.preload();
    }
    protected setLinear(key: string) {
        super.setLinear(key);
        if (this.atlasNames) {
            for (const atlas of this.atlasNames) {
                if (typeof atlas === "string") {
                    super.setLinear(atlas);
                } else {
                    super.setLinear(atlas.atlasName);
                }
            }
        }
    }

    protected setResourcesData(type: string, key: string, texture: string, data: string, foldType: FolderType) {
        if (this.cacheExists(type, key)) return;
        if (!this.mResources) {
            this.mResources = new Map();
        }
        this.mResources.set(key, {
            dpr: this.dpr,
            type,
            texture,
            data,
            foldType
        });
    }

    protected addResources(key: string, resource: any) {
        if (resource.type) {
            if (this.scene.load[resource.type]) {
                resource.foldType = resource.foldType || FolderType.DPR;
                const textureUrl = resource.foldType === FolderType.DPR ? Url.getUIRes(resource.dpr, resource.texture) : Url.getNormalUIRes(resource.texture);
                const jsonUrl = resource.foldType === FolderType.DPR ? Url.getUIRes(resource.dpr, resource.data) : Url.getNormalUIRes(resource.data);
                if (resource.type !== "video") {
                    this.scene.load[resource.type](key, textureUrl, jsonUrl);
                } else {
                    this.scene.load.video(key, textureUrl, undefined, undefined, true);
                }
            }
        }
    }

    protected cacheExists(type: string, key: string) {
        if (type === "image" || type === "atlas" || type === "texture") {
            return this.scene.textures.exists(key);
        } else if (type === "json" || type === "video") {
            return this.scene.cache[type].exists(key);
        }
        return false;
    }
}
