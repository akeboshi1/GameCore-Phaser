import {Logger} from "utils";
import version from "../../../../version";
import * as url from "url";

export class AvatarEditorDragonbone extends Phaser.GameObjects.Container {

    private readonly DRAGONBONENAME = "bones_human01";
    private readonly DRAGONBONENAME_HEAD = "bones_model_head";
    private readonly DRAGONBONEARMATURENAME = "Armature";
    private readonly BACKMAP = {
        ["head_hair"]: ["head_hair", "head_hair_back"],
        ["body_cost"]: ["body_cost", "body_cost_dres"]
    };
    private readonly DEFAULTSETS = [
        {id: "0001", parts: ["head_base", "body_base", "farm_base", "barm_base", "fleg_base", "bleg_base"]},
        {id: "5cd28238fb073710972a73c2", parts: ["head_hair", "head_eyes", "head_mous", "body_cost"]},
    ];
    private readonly SPECIALSETS = {
        ["head_spec"]: ["head_eyes", "head_hair", "head_mous", "head_hair_back", "head_hats", "head_mask", "head_face", "head_base"],
        ["body_spec"]: ["body_cost", "body_cost_dres", "body_tail", "body_wing", "body_base"],
        ["farm_spec"]: ["farm_cost", "farm_shld", "farm_weap", "farm_base"],
        ["barm_spec"]: ["barm_cost", "barm_shld", "barm_weap", "barm_base"],
        ["fleg_spec"]: ["fleg_cost", "fleg_base"],
        ["bleg_spec"]: ["bleg_cost", "bleg_base"],
    };
    private readonly MODELSETS = [
        {
            id: "5fbf562e72c7db2dbdcdb4ea",
            parts: ["body_base", "barm_base", "farm_base", "bleg_base", "fleg_base", "head_base"]
        }
    ];
    private readonly ALLPARTS = [
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
    private readonly BOTTOMBODYPARTS = [
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

    private readonly DEFAULT_SCALE_GAME_HEIGHT = 72;// 默认展示龙骨时，游戏尺寸
    private readonly DEFAULT_SCALE_BOTTOM_PIX = 4;// 默认展示龙骨时，龙骨所处位置下方的区域（/像素）
    private readonly ARMATURE_HEIGHT = 61;// 龙骨设计高度
    private readonly ARMATURE_LEG_PERCENT = 0.15;// 龙骨中，腿部占整个身高比重
    private readonly HEAD_ICON_HIDE_PIX = 22;// 头像截图中，下方隐藏的龙骨高度
    private readonly HEAD_ICON_WIDTH = 71;// 头像截图中，图片宽度
    private readonly HEAD_ICON_HEIGHT = 57;// 头像截图中，图片高度
    private readonly HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT = 79;// 头像截图中，含隐藏部分的整个高度
    private readonly HEAD_ICON_DEFAULT_BOTTOM_PIX = 0;// 头像截图中，龙骨所处位置下方的区域（/像素）
    // private readonly ARMATUREBOTTOMAREA = 0.36;

    private mArmatureDisplay: dragonBones.phaser.display.ArmatureDisplay;
    private mArmatureDisplay_head: dragonBones.phaser.display.ArmatureDisplay;

    private mEmitter: Phaser.Events.EventEmitter;
    private mAutoScale: boolean = true;// 截图时不能临时改变龙骨scale（除y*-1以外），只能在创建时就设置好scale
    private mWebHomePath: string;
    private mCurAnimationName: string = "idle";
    private mCurDir = 3;
    private mBaseSets: any[] = [];
    private mSets: any[] = [];
    private mParts: { [key: string]: any } = {};
    private mReplaceDisplayTimeOutID = null;
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
        this.setBaseSets(this.DEFAULTSETS);
        this.loadDragonbone();
    }

    public destroy() {
        this.removeAll(true);
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.dbClear();
            this.mArmatureDisplay.destroy();
            this.remove(this.mArmatureDisplay);
            this.mArmatureDisplay = null;
        }
        if (this.mArmatureDisplay_head) {
            this.mArmatureDisplay_head.dbClear();
            this.mArmatureDisplay_head.destroy();
            this.remove(this.mArmatureDisplay_head);
            this.mArmatureDisplay_head = null;
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
        // const re = this.mCurDir === AvatarDirEnum.Front ? /3/gi : /1/gi;
        // this.mCurAnimationName = this.mCurAnimationName.replace(re, `${dir}`);
        const re = this.mCurAnimationName.split("_");
        this.mCurAnimationName = dir === 3 ? re[0] : re[0] + "_back";
        // Logger.getInstance().log("ZW-- new animation name: ", this.mCurAnimationName);
        this.mCurDir = dir;

        this.reloadParts();
    }

    public play(animationName: string) {
        this.mCurAnimationName = animationName;

        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.animation.play(this.mCurAnimationName);
        }
        // if (this.mArmatureDisplay_head) {
        //     this.mArmatureDisplay_head.animation.play(this.mCurAnimationName);
        // }
    }

    public clearParts() {
        if (this.mSets) this.mSets = [];
        this.setBaseSets(this.DEFAULTSETS);
        this.reloadParts();
    }

    public mergeParts(sets: any[]) {
        this.addSets(sets);
        this.reloadParts();
    }

    public cancelParts(sets: any[]) {
        this.removeSets(sets);
        this.reloadParts();
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
            if (!this.mArmatureDisplay) {
                reject("no armature");
                return;
            }
            if (this.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT > this.scene.scale.height) {
                reject("game size is not enough, must larger than " + this.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT);
                return;
            }

            const modelData = {
                armature: this.mArmatureDisplay,
                x: this.HEAD_ICON_WIDTH / 2,
                y: this.HEAD_ICON_DEFAULT_BOTTOM_PIX,
                baseSets: this.DEFAULTSETS
            };
            this.snapshot({
                x: 0,
                y: this.HEAD_ICON_DEFAULT_SNAPSHOT_TOTAL_HEIGHT - this.HEAD_ICON_HEIGHT,
                width: this.HEAD_ICON_WIDTH,
                height: this.HEAD_ICON_HEIGHT
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
        this.replaceDisplay();
    }

    public get curSets() {
        return this.mSets;
    }

    private loadDragonbone() {
        const root = `./resources_v${version}/dragonbones`;
        const dbName = this.DRAGONBONENAME;
        this.scene.load.dragonbone(
            dbName,
            `${root}/${dbName}_tex.png`,
            `${root}/${dbName}_tex.json`,
            `${root}/${dbName}_ske.dbbin`,
            null,
            null,
            {responseType: "arraybuffer"}
        );
        const dbName_head = this.DRAGONBONENAME_HEAD;
        this.scene.load.dragonbone(
            dbName_head,
            `${root}/${dbName_head}_tex.png`,
            `${root}/${dbName_head}_tex.json`,
            `${root}/${dbName_head}_ske.dbbin`,
            null,
            null,
            {responseType: "arraybuffer"}
        );

        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.buildBones, this);
        this.scene.load.start();
    }

    private buildBones(): void {
        if (this.mArmatureDisplay) {
            this.mArmatureDisplay.destroy();
        }
        if (this.mArmatureDisplay_head) {
            this.mArmatureDisplay_head.destroy();
        }
        const sceneHeight = this.scene.scale.height;
        this.mArmatureBottomArea = this.DEFAULT_SCALE_BOTTOM_PIX * sceneHeight / this.DEFAULT_SCALE_GAME_HEIGHT;
        this.mArmatureDisplay = this.scene.add.armature(this.DRAGONBONEARMATURENAME, this.DRAGONBONENAME);
        // for (const slot of this.mArmatureDisplay.armature.getSlots()) {
        // Logger.getInstance().log("ZW-- slot: ", slot.name);
        // }
        this.mArmatureDisplay.animation.play(this.mCurAnimationName);
        if (this.mAutoScale) this.mArmatureDisplay.scale = sceneHeight / this.DEFAULT_SCALE_GAME_HEIGHT;
        this.mArmatureDisplay.x = this.scene.scale.width >> 1;
        this.mArmatureDisplay.y = this.scene.scale.height - this.mArmatureBottomArea;
        this.add(this.mArmatureDisplay);
        this.mArmatureBottomArea_head = this.mArmatureBottomArea - this.ARMATURE_LEG_PERCENT * this.ARMATURE_HEIGHT * sceneHeight / this.DEFAULT_SCALE_GAME_HEIGHT;
        this.mArmatureDisplay_head = this.scene.add.armature(this.DRAGONBONEARMATURENAME, this.DRAGONBONENAME_HEAD);
        // for (const slot of this.mArmatureDisplay.armature.getSlots()) {
        // Logger.getInstance().log("ZW-- half-length slot: ", slot.name);
        // }
        // this.mArmatureDisplay_head.animation.play("idle_3");
        if (this.mAutoScale) this.mArmatureDisplay_head.scale = sceneHeight / this.DEFAULT_SCALE_GAME_HEIGHT;
        this.mArmatureDisplay_head.x = this.scene.scale.width >> 1;
        this.mArmatureDisplay_head.y = this.scene.scale.height - this.mArmatureBottomArea_head + 1000;
        this.add(this.mArmatureDisplay_head);

        this.reloadParts();
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
            for (const key in this.BACKMAP) {
                if (this.BACKMAP.hasOwnProperty(key)) {
                    const parts = newSet.parts;
                    for (const part of parts) {
                        if (part === key) {
                            // 删除mSets和mParts中相应数据
                            this.removePartsInSets(this.BACKMAP[part], this.mSets);
                            this.removePartsInCurParts(this.BACKMAP[part]);
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

            for (const part of this.ALLPARTS) {
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
            if (this.SPECIALSETS.hasOwnProperty(key)) {
                const specParts = this.SPECIALSETS[key];
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

    private reloadParts() {
        if (!this.scene.load) {
            return;
        }
        if (!this.mArmatureDisplay || !this.mArmatureDisplay_head) {
            return;
        }
        this.cleanUp();
        const resources = this.getWebResourcesByDir(this.mCurDir);
        for (const resource of resources) {
            const path = url.resolve(this.mWebHomePath, resource);
            this.loadPart(resource, path);
            // Logger.getInstance().log("ZW-- loadPart: ", path);
        }
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.replaceDisplay, this);
        this.scene.load.start();
    }

    private replaceSlotDisplay(soltName: string, key: string) {
        if (!this.mArmatureDisplay || !this.mArmatureDisplay_head) return;
        // Logger.getInstance().log("ZW-- replaceSlotDisplay: ", soltName, " ; ", key);
        const slot: dragonBones.Slot = this.mArmatureDisplay.armature.getSlot(`${soltName}`);
        if (slot) {
            if (!this.scene.textures.exists(key)) {
                const display = slot.display;
                if (display) {
                    display.setTexture(undefined);
                }
            } else {
                slot.display = new dragonBones.phaser.display.SlotImage(
                    this.scene,
                    slot.display.x,
                    slot.display.y,
                    key
                );
            }
        } else {
            if (this.scene.textures.exists(key)) {
                Logger.getInstance().warn(`ZW-- slot <${soltName}> not found in base dragonBone`);
            }
        }
        const slot_head: dragonBones.Slot = this.mArmatureDisplay_head.armature.getSlot(`${soltName}`);
        if (slot_head) {
            if (!this.scene.textures.exists(key)) {
                const display = slot_head.display;
                if (display) display.setTexture(undefined);
            } else {
                slot_head.display = new dragonBones.phaser.display.SlotImage(
                    this.scene,
                    slot_head.display.x,
                    slot_head.display.y,
                    key
                );
            }
        } else {
            if (soltName.includes("_3") && this.scene.textures.exists(key)) {
                Logger.getInstance().warn(`ZW-- slot <${soltName}> not found in half-length dragonBone`);
            }
        }
    }

    private replaceDisplay(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const parts = this.mParts;
            Logger.getInstance().log("ZW-- replaceDisplay mParts: ", this.mParts);
            let slotName = "";
            let uri = "";
            for (const partName in parts) {
                if (!parts.hasOwnProperty(partName)) {
                    continue;
                }
                slotName = this.slotName(partName, this.mCurDir + "");
                const avatarSet = parts[partName];
                if (avatarSet) {
                    uri = this.relativeUri(partName, avatarSet.id, this.mCurDir + "", avatarSet.version);
                } else {
                    uri = "";
                }
                this.replaceSlotDisplay(`${slotName}`, uri);
            }

            this.mArmatureDisplay.animation.play(this.mCurAnimationName);
            // this.mArmatureDisplay_head.animation.play(this.mCurAnimationName);

            if (this.mReplaceDisplayTimeOutID) {
                clearTimeout(this.mReplaceDisplayTimeOutID);
                this.mReplaceDisplayTimeOutID = null;
            }
            this.mReplaceDisplayTimeOutID = setTimeout(() => {
                if (this.mOnReadyForSnapshot) {
                    this.mOnReadyForSnapshot(this);
                    this.mOnReadyForSnapshot = null;
                }
                resolve(true);
            }, 100);
        });
    }

    private cleanUp() {
        for (const p of this.ALLPARTS) {
            this.replaceSlotDisplay(this.slotName(p, "1"), "");
            this.replaceSlotDisplay(this.slotName(p, "3"), "");
        }
    }

    private loadPart(key: string, path: string) {
        if (!this.scene.cache.obj.has(key)) {// TODO: 检测是否在load队列中
            this.scene.load.image(key, path);
        }
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
        for (const set of this.MODELSETS) {
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

    private resizedataURL(datas: string, wantedWidth: number, wantedHeight: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            // We create an image to receive the Data URI
            const img = document.createElement("img");

            // When the event "onload" is triggered we can resize the image.
            img.onload = () => {
                // We create a canvas and get its context.
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                // We set the dimensions at the wanted size.
                canvas.width = wantedWidth;
                canvas.height = wantedHeight;

                // We resize the image with the canvas method drawImage();
                ctx.drawImage(img, 0, 0, wantedWidth, wantedHeight);

                const dataURI = canvas.toDataURL("image/png", 1);

                resolve(dataURI);
            };

            // We put the Data URI in the image's src attribute
            img.src = datas;
        });
    }

    private getSnapshotModelData(): { armature: dragonBones.phaser.display.ArmatureDisplay, x: number, y: number, baseSets: any[] } {
        for (const set of this.mSets) {
            for (const part of set.parts) {
                if (this.BOTTOMBODYPARTS.indexOf(part) >= 0) {
                    // Logger.getInstance().log("ZW-- snapshotArmature: body");
                    return {
                        armature: this.mArmatureDisplay,
                        x: this.mArmatureDisplay.x,
                        y: this.mArmatureBottomArea,
                        baseSets: this.MODELSETS
                    };
                }
            }
        }

        // Logger.getInstance().log("ZW-- snapshotArmature: head");
        return {
            armature: this.mArmatureDisplay_head,
            x: this.mArmatureDisplay.x,
            y: this.mArmatureBottomArea_head,
            baseSets: this.MODELSETS
        };
    }

    private snapshot(area: { x: number, y: number, width: number, height: number },
                     modelData: { armature: dragonBones.phaser.display.ArmatureDisplay, x: number, y: number, baseSets: any[] }): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.setBaseSets(modelData.baseSets);
            this.replaceDisplay()
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
                        this.setBaseSets(this.DEFAULTSETS);
                        this.replaceDisplay()
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
}
