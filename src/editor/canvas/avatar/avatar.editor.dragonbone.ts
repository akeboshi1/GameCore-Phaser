import {Handler, Logger} from "utils";
import version from "../../../../version";
import {BaseDragonbonesDisplay} from "display";
import {IAvatar, IDragonbonesModel, SlotSkin} from "structure";

export class AvatarEditorDragonbone extends Phaser.GameObjects.Container {

    private static readonly DRAGONBONE_NAME_DEFAULT = "bones_human01";
    private static readonly DRAGONBONE_NAME_HEAD = "bones_model_head";
    private static readonly DRAGONBONE_ARMATURE_NAME = "Armature";

    private static readonly BASE_PARTS = [
        "body_base", "barm_base", "farm_base", "bleg_base", "fleg_base", "head_base"
    ];
    // 除base以外的"着装"插槽
    private static readonly ADD_PARTS = [
        "barm_cost",
        "barm_spec",
        "bleg_cost",
        "bleg_spec",
        "body_cost",
        "body_cost_dres",
        "body_spec",
        "body_tail",
        "body_wing",
        "farm_cost",
        "farm_spec",
        "fleg_cost",
        "fleg_spec",
        "head_eyes",
        "head_hair",
        "head_mous",
        "head_hair_back",
        "head_hats",
        "head_mask",
        "head_spec",
        "head_face",
        "barm_shld",
        "farm_shld",
        "barm_weap",
        "farm_weap",
    ];
    // 下半身插槽名
    private static readonly BOTTOM_BODY_PARTS = [
        "body_cost",
        "body_cost_dres",
        "farm_cost",
        "barm_cost",
        "fleg_cost",
        "bleg_cost",
        "barm_weap",
        "farm_weap",
        "barm_shld",
        "farm_shld",
        "body_tail",
        "body_wing",
        "body_spec",
        "farm_spec",
        "barm_spec",
        "fleg_spec",
        "bleg_spec"
    ];

    private static readonly HAIR_BACK = {
        ["head_hair"]: ["head_hair", "head_hair_back"],
        ["body_cost"]: ["body_cost", "body_cost_dres"]
    };
    private static readonly DEFAULT_SETS = [
        {id: "0001", parts: AvatarEditorDragonbone.BASE_PARTS},
        {id: "5cd28238fb073710972a73c2", parts: ["head_hair", "head_eyes", "head_mous", "body_cost"]},
    ];
    private static readonly SPECIAL_SETS = {
        ["head_spec"]: ["head_eyes", "head_hair", "head_mous", "head_hair_back", "head_hats", "head_mask", "head_face", "head_base"],
        ["body_spec"]: ["body_cost", "body_cost_dres", "body_tail", "body_wing", "body_base"],
        ["farm_spec"]: ["farm_cost", "farm_shld", "farm_weap", "farm_base"],
        ["barm_spec"]: ["barm_cost", "barm_shld", "barm_weap", "barm_base"],
        ["fleg_spec"]: ["fleg_cost", "fleg_base"],
        ["bleg_spec"]: ["bleg_cost", "bleg_base"],
    };
    private static readonly MODEL_SETS = [
        {
            id: "5fbf562e72c7db2dbdcdb4ea",
            parts: AvatarEditorDragonbone.BASE_PARTS
        }
    ];

    private static readonly DEFAULT_SCALE_GAME_HEIGHT = 72;// 默认展示龙骨时，游戏尺寸
    private static readonly DEFAULT_SCALE_BOTTOM_PIX = 4;// 默认展示龙骨时，龙骨所处位置下方的区域（/像素）
    private static readonly ARMATURE_HEIGHT = 61;// 龙骨设计高度
    private static readonly ARMATURE_LEG_PERCENT = 0.15;// 龙骨中，腿部占整个身高比重
    private static readonly HEAD_ICON_HIDE_PIX = 22;// 头像截图中，下方隐藏的龙骨高度
    private static readonly HEAD_ICON_WIDTH = 71;// 头像截图中，图片宽度
    private static readonly HEAD_ICON_HEIGHT = 57;// 头像截图中，图片高度
    private static readonly HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT = 79;// 头像截图中，含隐藏部分的整个高度
    private static readonly HEAD_ICON_DEFAULT_BOTTOM_PIX = 0;// 头像截图中，龙骨所处位置下方的区域（/像素）
    // private readonly ARMATUREBOTTOMAREA = 0.36;

    private mDisplay_default: EditorDragonbonesDisplay;
    private mDisplay_head: EditorDragonbonesDisplay;

    private mEmitter: Phaser.Events.EventEmitter;
    private mAutoScale: boolean = true;// 截图时不能临时改变龙骨scale（除y*-1以外），只能在创建时就设置好scale
    private mWebHomePath: string;
    private mCurAnimationName: string = "idle";
    private mCurDir = 3;
    private mBaseSets: any[] = [];
    private mSets: any[] = [];
    private mParts: { [key: string]: any } = {};
    private mArmatureBottomArea: number = 0;
    private mArmatureBottomArea_head: number = 0;
    private mOnReadyForSnapshot: (a: AvatarEditorDragonbone) => any;

    constructor(scene: Phaser.Scene, webHomePath: string, emitter: Phaser.Events.EventEmitter, autoScale: boolean, startSets?: any[], onReadyForSnapshot?: (a: AvatarEditorDragonbone) => any) {
        super(scene);

        this.mWebHomePath = webHomePath;
        this.mEmitter = emitter;
        this.mAutoScale = autoScale;

        const parentContainer = scene.add.container(0, 0);
        parentContainer.add(this);

        if (startSets) {
            this.mSets = startSets;
        }
        if (onReadyForSnapshot) {
            this.mOnReadyForSnapshot = onReadyForSnapshot;
        }
        this.setBaseSets(AvatarEditorDragonbone.DEFAULT_SETS);
        this.createDisplays();
    }

    public destroy() {
        this.removeAll(true);
        if (this.mDisplay_default) {
            this.remove(this.mDisplay_default);
            this.mDisplay_default.destroy();
            this.mDisplay_default = null;
        }
        if (this.mDisplay_head) {
            this.remove(this.mDisplay_head);
            this.mDisplay_head.destroy();
            this.mDisplay_head = null;
        }
        this.mCurAnimationName = null;
        this.mCurDir = null;
        if (this.mBaseSets) this.mBaseSets = [];
        this.mBaseSets = null;
        if (this.mSets) this.mSets = [];
        this.mSets = null;
        this.mParts = {};
        this.mParts = null;
        super.destroy();
    }

    // 每次调用强制重新加载资源（因为可能出现不同图片，但是key相同的情况）
    public loadLocalResources(img: any, part: string, dir: string) {
        const uri = this.relativeUri(part, img.key, dir);

        if (this.scene.textures.exists(uri)) {
            this.scene.textures.remove(uri);
            this.scene.textures.removeKey(uri);
        }

        this.scene.textures.addBase64(uri, img.url);
        this.scene.textures.on("onload", this.onResourcesLoaded, this);

    }

    public setDir(dir: number) {
        const re = this.mCurAnimationName.split("_");
        this.mCurAnimationName = dir === 3 ? re[0] : re[0] + "_back";
        // Logger.getInstance().log("ZW-- new animation name: ", this.mCurAnimationName);
        this.mCurDir = dir;

        this.reloadDisplay();
    }

    public play(animationName: string) {
        this.mCurAnimationName = animationName;

        if (this.mDisplay_default) {
            this.mDisplay_default.play({name: this.mCurAnimationName, flip: false});
        }
        // if (this.mArmatureDisplay_head) {
        //     this.mArmatureDisplay_head.play({ name: this.mCurAnimationName, flip: false });
        // }
    }

    public clearParts() {
        if (this.mSets) this.mSets = [];
        this.setBaseSets(AvatarEditorDragonbone.DEFAULT_SETS);
        this.reloadDisplay();
    }

    public mergeParts(sets: any[]) {
        this.addSets(sets);
        this.reloadDisplay();
    }

    public cancelParts(sets: any[]) {
        this.removeSets(sets);
        this.reloadDisplay();
    }

    // 截图规则：如果包含下半身装扮，使用正常龙骨；否则使用上半身龙骨
    public generateShopIcon(width: number, height: number): Promise<string> {
        return new Promise((resolve, reject) => {
            if (width === 0 || height === 0) {
                reject("width and height must not be 0");
                return;
            }
            const modelData = this.getSnapshotModelData();
            if (!modelData.armature) {
                reject("no armature");
                return;
            }

            this.snapshot({x: 0, y: 0, width, height}, modelData)
                .then((result) => {
                    resolve(result);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    public generateHeadIcon(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.mDisplay_default) {
                reject("no armature");
                return;
            }
            if (AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT > this.scene.scale.height) {
                reject("game size is not enough, must larger than " + AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT);
                return;
            }

            const modelData = {
                armature: this.mDisplay_default,
                x: AvatarEditorDragonbone.HEAD_ICON_WIDTH / 2,
                y: AvatarEditorDragonbone.HEAD_ICON_DEFAULT_BOTTOM_PIX,
                baseSets: AvatarEditorDragonbone.DEFAULT_SETS
            };
            this.snapshot({
                x: 0,
                y: AvatarEditorDragonbone.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT - AvatarEditorDragonbone.HEAD_ICON_HEIGHT,
                width: AvatarEditorDragonbone.HEAD_ICON_WIDTH,
                height: AvatarEditorDragonbone.HEAD_ICON_HEIGHT
            }, modelData)
                .then((result) => {
                    resolve(result);
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    }

    public onResourcesLoaded() {
        this.scene.textures.off("onload", this.onResourcesLoaded, this, false);
        this.reloadDisplay();
    }

    public get curSets() {
        return this.mSets;
    }

    private createDisplays(): void {
        if (this.mDisplay_default) {
            this.mDisplay_default.destroy();
        }
        if (this.mDisplay_head) {
            this.mDisplay_head.destroy();
        }
        const sceneHeight = this.scene.scale.height;
        this.mArmatureBottomArea = AvatarEditorDragonbone.DEFAULT_SCALE_BOTTOM_PIX * sceneHeight / AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
        this.mDisplay_default = new EditorDragonbonesDisplay(this.scene, AvatarEditorDragonbone.DRAGONBONE_NAME_DEFAULT);
        this.mDisplay_default.play({name: this.mCurAnimationName, flip: false});
        if (this.mAutoScale) this.mDisplay_default.scale = sceneHeight / AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
        this.mDisplay_default.x = this.scene.scale.width >> 1;
        this.mDisplay_default.y = this.scene.scale.height - this.mArmatureBottomArea;
        this.add(this.mDisplay_default);
        this.mArmatureBottomArea_head = this.mArmatureBottomArea -
            AvatarEditorDragonbone.ARMATURE_LEG_PERCENT * AvatarEditorDragonbone.ARMATURE_HEIGHT * sceneHeight / AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
        this.mDisplay_head = new EditorDragonbonesDisplay(this.scene, AvatarEditorDragonbone.DRAGONBONE_NAME_HEAD);
        if (this.mAutoScale) this.mDisplay_head.scale = sceneHeight / AvatarEditorDragonbone.DEFAULT_SCALE_GAME_HEIGHT;
        this.mDisplay_head.x = this.scene.scale.width >> 1;
        this.mDisplay_head.y = this.scene.scale.height - this.mArmatureBottomArea_head + 1000;
        this.add(this.mDisplay_head);

        this.reloadDisplay();
    }

    private setBaseSets(sets: any[]) {
        if (this.mBaseSets) this.mBaseSets = [];
        this.mBaseSets = sets;

        this.applySets(true);
    }

    // 将一组AvatatSet整合到一起形成一个完整的Avatar，并保存到self._parts里
    private addSets(newSets: any[]) {
        // Logger.getInstance().log("ZW-- addSets: ", newSets);
        // 复制值
        const temp: any[] = [];
        for (const newSet of newSets) {
            // fix dumplicate sets
            const existSetIdx = this.mSets.findIndex((x) => (x.id === newSet.id && JSON.stringify(x.parts) === JSON.stringify(newSet.parts)));
            if (existSetIdx >= 0) continue;
            temp.push(Object.assign({}, newSet));
        }
        newSets = temp;

        // 解决替换发型，后发分层存在的问题
        for (const newSet of newSets) {
            for (const key in AvatarEditorDragonbone.HAIR_BACK) {
                if (AvatarEditorDragonbone.HAIR_BACK.hasOwnProperty(key)) {
                    const parts = newSet.parts;
                    for (const part of parts) {
                        if (part === key) {
                            // 删除mSets和mParts中相应数据
                            this.removePartsInSets(AvatarEditorDragonbone.HAIR_BACK[part], this.mSets);
                            this.removePartsInCurParts(AvatarEditorDragonbone.HAIR_BACK[part]);
                        }
                    }
                }
            }
        }

        this.mSets = this.mSets.concat(newSets);

        // Logger.getInstance().log("ZW-- this.mSets: ", this.mSets);

        this.applySets();
    }

    private applySets(reset: boolean = false) {
        if (reset) {
            this.mParts = {};

            for (const part of AvatarEditorDragonbone.ADD_PARTS) {
                this.mParts[part] = null;
            }

            for (const set of this.mBaseSets) {
                for (const part of set.parts) {
                    this.mParts[part] = set;
                }
            }
        }
        for (const set of this.mSets) {
            for (const part of set.parts) {
                this.mParts[part] = set;
            }
        }
        // 特型装扮隐藏对应部位
        for (const key in this.mParts) {
            const set = this.mParts[key];
            if (!set) continue;
            if (AvatarEditorDragonbone.SPECIAL_SETS.hasOwnProperty(key)) {
                const specParts = AvatarEditorDragonbone.SPECIAL_SETS[key];
                for (const specP of specParts) {
                    this.mParts[specP] = null;
                }
            }
        }
    }

    private removeSets(sets: any[]) {
        for (const set of sets) {
            const idx = this.mSets.findIndex((x) => x.id === set.id);
            if (idx >= 0) {
                this.mSets.splice(idx, 1);
            }

            const dirs = ["1", "3"];
            for (const dir of dirs) {
                for (const part of set.parts) {
                    const imgKey = this.relativeUri(part, set.id, dir, set.version);
                    if (this.scene.textures.exists(imgKey)) {
                        this.scene.textures.remove(imgKey);
                        this.scene.textures.removeKey(imgKey);
                    }
                }
            }
        }

        this.applySets(true);
    }

    private reloadDisplay(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let defaultReplaceOver = false;
            let headReplaceOver = false;
            const allDisplayReplaceChecker = () => {
                if (defaultReplaceOver && headReplaceOver) {
                    resolve(null);
                }
            };

            const defaultReplaceListener = Handler.create(this, (tex) => {
                defaultReplaceOver = true;
                allDisplayReplaceChecker();
            });
            const headReplaceListener = Handler.create(this, () => {
                headReplaceOver = true;
                allDisplayReplaceChecker();
            });

            const loadData = this.convertPartsToIDragonbonesModel(this.mParts);
            Logger.getInstance().log("ZW-- reloadDisplay: ", loadData);
            this.mDisplay_default.replaceTexCompleteHandler = defaultReplaceListener;
            this.mDisplay_default.load(loadData);
            this.mDisplay_head.replaceTexCompleteHandler = headReplaceListener;
            this.mDisplay_head.load(loadData);

            this.mDisplay_default.play({name: this.mCurAnimationName, flip: false});
        });
    }

    // 获取整个avatar的部件标签对应的资源相对路径
    private getWebResourcesByDir(dir: number): string[] {
        const res: string[] = [];
        const parts = this.mParts;

        for (const key in parts) {
            if (parts.hasOwnProperty(key)) {
                const set = parts[key];
                if (set) {
                    if (set.id.length === 10) {
                        // 临时资源 id为editor随机生成
                        continue;
                    }
                    // eyes mous 没有背面素材
                    if (dir === 1 && key === "head_eyes") {
                        continue;
                    }
                    if (dir === 1 && key === "head_mous") {
                        continue;
                    }
                    res.push(this.relativeUri(key, set.id, dir + "", set.version));
                }
            }
        }

        // add model resources
        for (const set of AvatarEditorDragonbone.MODEL_SETS) {
            for (const part of set.parts) {
                res.push(this.relativeUri(part, set.id, dir + ""));
            }
        }

        return res;
    }

    // 从部件ID转换为资源相对路径 同时也是TextureManager中的key
    // tslint:disable-next-line:no-shadowed-variable
    private relativeUri(part: string, id: string, dir: string, version?: string) {
        let result = `/avatar/part/${part}_${id}_${dir}`;
        if (version !== undefined && version.length > 0) {
            result = `${result}_${version}`;
        }

        result = `${result}.png`;
        return result;
    }

    // 部件名转换为插槽名
    private slotName(part: string, dir: string) {
        return `${part}_${dir}`;
    }

    private findPartInSets(part: string, sets: any[]): any {
        for (const set of sets) {
            if (set.parts.includes(part)) {
                return set;
            }
        }

        return null;
    }

    private removePartsInSets(parts: string[], sets: any[]): any[] {
        for (const set of sets) {
            for (const part of parts) {
                const idx = set.parts.indexOf(part);
                if (idx >= 0) set.parts.splice(idx, 1);
            }
        }

        return sets;
    }

    private removePartsInCurParts(parts: string[]) {
        for (const part of parts) {
            if (this.mParts.hasOwnProperty(part)) {
                delete this.mParts[part];
            }
        }
    }

    private getSnapshotModelData(): { armature: EditorDragonbonesDisplay, x: number, y: number, baseSets: any[] } {
        for (const set of this.mSets) {
            for (const part of set.parts) {
                if (AvatarEditorDragonbone.BOTTOM_BODY_PARTS.indexOf(part) >= 0) {
                    // Logger.getInstance().log("ZW-- snapshotArmature: body");
                    return {
                        armature: this.mDisplay_default,
                        x: this.mDisplay_default.x,
                        y: this.mArmatureBottomArea,
                        baseSets: AvatarEditorDragonbone.MODEL_SETS
                    };
                }
            }
        }

        // Logger.getInstance().log("ZW-- snapshotArmature: head");
        return {
            armature: this.mDisplay_head,
            x: this.mDisplay_default.x,
            y: this.mArmatureBottomArea_head,
            baseSets: AvatarEditorDragonbone.MODEL_SETS
        };
    }

    private snapshot(area: { x: number, y: number, width: number, height: number },
                     modelData: { armature: EditorDragonbonesDisplay, x: number, y: number, baseSets: any[] }): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.setBaseSets(modelData.baseSets);
            this.reloadDisplay()
                .then(() => {
                    const gameWidth = this.scene.scale.width;
                    const gameHeight = this.scene.scale.height;
                    Logger.getInstance().log(`ZW-- start snapshot, gameSize: ${gameWidth}*${gameHeight}, setSize: ${area.width}*${area.height}`);
                    const rt = this.scene.make.renderTexture({x: 0, y: 0, width: gameWidth, height: gameHeight}, false);
                    modelData.armature.scaleY *= -1;
                    rt.draw(modelData.armature, modelData.x, modelData.y);
                    rt.snapshotArea(area.x, area.y, area.width, area.height, (img: HTMLImageElement) => {
                        modelData.armature.scaleY *= -1;
                        // reverse parts
                        this.setBaseSets(AvatarEditorDragonbone.DEFAULT_SETS);
                        this.reloadDisplay()
                            .then(() => {
                                resolve(img.src);
                                Logger.getInstance().log("ZW-- snapshot result: ", img.src);
                            });
                    });
                })
                .catch(() => {
                    reject("replaceDisplay error");
                });
        });
    }

    private convertPartsToIDragonbonesModel(parts: { [key: string]: any }): IDragonbonesModel {
        const avatarModel: IAvatar = {id: "0"};
        const dragonbonesModel: IDragonbonesModel = {id: 0, avatar: avatarModel};

        const allPartsName = [].concat(AvatarEditorDragonbone.BASE_PARTS, AvatarEditorDragonbone.ADD_PARTS);
        for (const partName in allPartsName) {
            if (!parts.hasOwnProperty(partName)) continue;
            const avatarKey = this.convertPartNameToIAvatarKey(partName);
            const set = parts[partName];
            avatarModel[avatarKey] = {sn: set.id, version: set.version};
        }

        return dragonbonesModel;
    }

    // ex: "head_base" => "headBaseId"
    private convertPartNameToIAvatarKey(partName: string): string {
        const nameArr = partName.split("_");
        let result: string = nameArr[0];
        for (let i = 1; i < nameArr.length; i++) {
            const temp = nameArr[i];
            result += temp.charAt(0).toUpperCase() + temp.slice(1);
        }
        result += "Id";
        return result;
    }
}

class EditorDragonbonesDisplay extends BaseDragonbonesDisplay {

    constructor(scene: Phaser.Scene, resName: string) {
        super(scene);

        this.resourceName = resName;
    }
}
