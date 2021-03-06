import {
    DisplayField,
    ElementStateType,
    IScenery,
    LayerName,
    IPos,
    IPosition45Obj,
    Logger,
    LogicPos,
    IFramesModel,
    IDragonbonesModel,
    RunningAnimation,
    ITilesetProperty,
    IGround,
    IRenderSprite,
    Handler
} from "structure";
import { FramesDisplay } from "../display/frames/frames.display";
import { PlayScene } from "../scenes/play.scene";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
import { Render } from "../render";
import { op_def } from "pixelpai_proto";
import { MatterBodies } from "../display/debugs/matter";
import { ServerPosition } from "../display/debugs/server.pointer";
import { IDisplayObject } from "../display";
import { LayerEnum } from "game-capsule";
import { TerrainGrid } from "../display/terrain.grid";
import { BaseSceneManager, BlockManager, Ground } from "baseRender";
import { FramesModel } from "baseGame";
import { Tool } from "utils";
import { translate } from "../utils";

export class DisplayManager {
    private sceneManager: BaseSceneManager;
    private displays: Map<number, DragonbonesDisplay | FramesDisplay>;
    private scenerys: Map<number, BlockManager>;
    private mUser: IDisplayObject;
    private matterBodies: MatterBodies;
    private serverPosition: ServerPosition;
    private preLoadList: any[];
    private loading: boolean = false;
    private mModelCache: Map<number, any>;
    private mGridLayer: TerrainGrid;
    private mGround: Ground;

    // ====实例id
    private uuid: number = 0;

    constructor(protected render: Render) {
        this.sceneManager = render.sceneManager;
        this.displays = new Map();
        this.scenerys = new Map();
        this.mModelCache = new Map();
        this.preLoadList = [];
    }

    get user(): IDisplayObject {
        return this.mUser;
    }

    public update(time: number, delta: number) {
        if (this.preLoadList && this.preLoadList.length > 0 && !this.loading) {
            this.loading = true;
            this.loadProgress();
        }
        if (this.mGridLayer) this.mGridLayer.update(time, delta);
    }

    public resize(width: number, height: number) {
        this.scenerys.forEach((scenery) => {
            scenery.resize(width, height);
        });
    }

    public updateModel(id: number, data: IDragonbonesModel) {
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        const display: IDisplayObject = this.displays.get(id);
        if (display) {
            display.load(data);
            this.render.mainPeer.elementDisplaySyncReady(id);
        }
    }

    public addDragonbonesDisplay(id: number, data: IDragonbonesModel, layer: number, nodeType: op_def.NodeType) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: DragonbonesDisplay;
        if (!this.displays.has(id)) {
            display = new DragonbonesDisplay(scene, this.render, id, this.uuid++, nodeType);
            this.displays.set(id, display);
            this.preLoadList.push(display);
        } else {
            display = this.displays.get(id) as DragonbonesDisplay;
        }
        display.load(data);
        const sprite = this.mModelCache.get(id);
        if (sprite) {
            this.setModel(sprite);
            this.mModelCache.delete(id);
        }
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
    }

    public addUserDragonbonesDisplay(id: number, data: IDragonbonesModel, isUser: boolean = false, layer: number) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: DragonbonesDisplay;
        if (!this.displays.has(id)) {
            display = new DragonbonesDisplay(scene, this.render, id, this.uuid++, op_def.NodeType.CharacterNodeType);
            this.displays.set(id, display);
        } else {
            display = this.displays.get(data.id) as DragonbonesDisplay;
        }
        // 主角龙骨无视其余资源优先加载
        display.load(data, undefined, false);
        // display.startLoad();
        if (isUser) this.mUser = display;
        const sprite = this.mModelCache.get(id);
        if (sprite) {
            this.setModel(sprite);
            this.mModelCache.delete(id);
        }
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
        return display;
    }

    public addTerrainDisplay(id: number, data: IFramesModel, layer: number, nodeType: op_def.NodeType) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: FramesDisplay;
        if (!this.displays.has(id)) {
            display = new FramesDisplay(scene, this.render, id, nodeType);
            this.displays.set(id, display);
        } else {
            display = this.displays.get(id) as FramesDisplay;
        }
        display.load(data);
        const sprite = this.mModelCache.get(id);
        if (sprite) {
            this.setModel(sprite);
            // display.titleMask = sprite.titleMask;
            // if (sprite.nickname) this.showNickname(id, sprite.nickname);
            this.mModelCache.delete(id);
        }
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
        return display;
    }

    public addFramesDisplay(id: number, data: IFramesModel, layer: number, nodeType: op_def.NodeType, field?: DisplayField) {
        if (!data) {
            Logger.getInstance().debug("no data addFramesDisplay ====>", id);
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: FramesDisplay;
        if (!this.displays.has(id)) {
            display = new FramesDisplay(scene, this.render, id, nodeType);
            this.displays.set(id, display);
        } else {
            display = this.displays.get(id) as FramesDisplay;
        }
        display.load(data, field);
        const sprite = this.mModelCache.get(id);
        if (sprite) {
            this.setModel(sprite);
            // display.titleMask = sprite.titleMask;
            // if (sprite.nickname) this.showNickname(id, sprite.nickname);
            this.mModelCache.delete(id);
        }
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
        return display;
    }

    public addToLayer(layerName: string, display: FramesDisplay | DragonbonesDisplay, index?: number) {
        const scene: PlayScene = <PlayScene>this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        scene.layerManager.addToLayer(layerName, display, index);
    }

    public removeDisplay(displayID: number): void {
        if (!this.displays.has(displayID)) {
            // Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.destroy();
        this.displays.delete(displayID);
    }

    public addFillEffect(x: number, y: number, status: op_def.PathReachableStatus) {
    }

    public load(displayID: number, data: any, field?: DisplayField) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.load(data, field);
    }

    public changeAlpha(displayID: number, val?: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.changeAlpha(val);
    }

    public fadeIn(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.fadeIn();
    }

    public fadeOut(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.fadeOut();
    }

    public play(displayID: number, animation: RunningAnimation, field?: DisplayField, times?: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.play(animation);
    }

    public mount(displayID: number, targetID: number, targetIndex?: number) {
        const display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const target = this.displays.get(targetID);
        if (!target) {
            Logger.getInstance().warn("BaseDisplay not found: ", targetID);
            return;
        }
        const camerasManager = this.render.camerasManager;
        const followed = camerasManager.targetFollow === target;
        if (followed) {
            camerasManager.stopFollow();
        }
        target.setRootMount(display);
        display.mount(target, targetIndex);
        if (followed) {
            let pos = target.getPosition();
            const scaleRatio = this.render.scaleRatio;
            camerasManager.pan(pos.x, pos.y, 500, "Sine.easeInOut", true, (cam, progress) => {
                pos = target.getPosition();
                cam.panEffect.destination.x = pos.x * scaleRatio;
                cam.panEffect.destination.y = pos.y * scaleRatio;
            })
                .then(() => {
                    camerasManager.startFollow(target);
                });
        }
    }

    public unmount(displayID: number, targetID: number, pos?: IPos) {
        const display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }

        const target = this.displays.get(targetID);
        if (!target) {
            Logger.getInstance().warn("BaseDisplay not found: ", targetID);
            return;
        }
        const camerasManager = this.render.camerasManager;
        if (!camerasManager) return;
        const followed = camerasManager.targetFollow === target;
        if (followed) {
            camerasManager.stopFollow();
        }
        target.setRootMount(null);
        display.unmount(target);
        if (pos) target.setPosition(pos.x, pos.y, pos.z);
        if (followed) {
            let targetPos = target.getPosition();
            const scaleRatio = this.render.scaleRatio;
            camerasManager.pan(targetPos.x, targetPos.y, 500, "Sine.easeInOut", true, (cam, progress) => {
                targetPos = target.getPosition();
                cam.panEffect.destination.x = targetPos.x * scaleRatio;
                cam.panEffect.destination.y = targetPos.y * scaleRatio;
            }).then(() => {
                camerasManager.startFollow(target);
            });
        }
    }

    public addEffect(targetID: number, effectID: number, display: IFramesModel) {
        const target = this.getDisplay(targetID);
        let effect = this.getDisplay(effectID);
        if (!effect) effect = this.addFramesDisplay(effectID, display, parseInt(LayerName.SURFACE, 10), op_def.NodeType.ElementNodeType, DisplayField.Effect);
        if (!target || !effect) {
            return;
        }
        if (effect.created) {
            target.addEffect(effect);
        } else {
            effect.createdHandler = new Handler(this, () => {
                target.addEffect(effect);
                effect.createdHandler = undefined;
            });
        }
    }

    public removeEffect(targetID: number, displayID: number) {
        const display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const target = this.displays.get(targetID);
        if (target) target.removeEffect(display);
        display.destroy();
        this.displays.delete(displayID);
    }

    public showEffect(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().warn("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        // display.showEffect();
    }

    public setModel(sprite: IRenderSprite) {
        const display = this.displays.get(sprite.id);
        if (!display) {
            this.mModelCache.set(sprite.id, sprite);
            return;
        }
        this.updateAttrs(display, sprite.attrs);
        if (!sprite.pos) sprite.pos = new LogicPos(0, 0, 0);
        display.titleMask = sprite.titleMask | 0x00020000;
        display.setPosition(sprite.pos.x, sprite.pos.y, sprite.pos.z);
        // display.changeAlpha(sprite.alpha);
        this.setHasInteractive(display, sprite.hasInteractive);
        const nickname = sprite.nickname;
        if (nickname) this.showNickname(sprite.id, nickname);
    }

    public startFireMove(id: number, pos: any) {
        const display = this.displays.get(id);
        if (display) display.startFireMove(pos);
    }

    public addSkybox(scenery: IScenery) {
        const skybox = new BlockManager(scenery, this.render);
        this.scenerys.set(scenery.id, skybox);
    }

    public updateSkyboxState(state) {
        this.scenerys.forEach((scenery) => {
            scenery.setState(state);
        });
    }

    public removeSkybox(id: number) {
        const scenery = this.scenerys.get(id);
        if (!scenery) {
            return;
        }
        scenery.destroy();
        this.scenerys.delete(id);
    }

    public addGround(ground: IGround): Promise<ITilesetProperty[]> {
        return new Promise<ITilesetProperty[]>((resolve, reject) => {
            const scene = this.sceneManager.getMainScene();
            this.mGround = new Ground(scene, this.render.url, this.render.scaleRatio);
            (<PlayScene>scene).layerManager.addToLayer(LayerName.GROUND, this.mGround);
            this.mGround.load(ground)
                .then(() => {
                    const allProperties = this.mGround.getAllTilesetProperties();
                    resolve(allProperties);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    // 修改地块 返回自定义数据
    public changeGround(pos45: IPos, key: number): ITilesetProperty {
        if (this.mGround) {
            this.mGround.changeAt(pos45, key);
            return this.mGround.getTilePropertiesByPos(pos45.x, pos45.y);
        }
        return null;
    }

    public removeGround() {
        if (this.mGround) {
            this.mGround.destroy();
        }
    }

    public getDisplay(id: number): DragonbonesDisplay | FramesDisplay | undefined {
        return this.displays.get(id);
    }

    public displayDoMove(id: number, moveData: any) {
        const display = this.getDisplay(id);
        if (display) display.doMove(moveData);
    }

    public showNickname(id: number, name: string) {
        const display = this.getDisplay(id);
        if (!display) {
            return Logger.getInstance().debug(`can't show nickname ${name}`);
        }
        display.showNickname(name);
        // if (display) display.showNickname(name);
    }

    public setHasInteractive(display: FramesDisplay | DragonbonesDisplay, val: boolean) {
        if (!display) return;
        display.hasInteractive = val;
    }

    public showTopDisplay(id: number, state?: ElementStateType) {
        const display = this.getDisplay(id);
        if (!display) {
            return;
        }
        display.showTopDisplay(state);
    }

    public removeTopDisplay(id: number) {
        const display = this.getDisplay(id);
        if (!display) return;
        display.removeTopDisplay();
    }

    public showMatterDebug(bodies) {
        if (!this.matterBodies) {
            this.matterBodies = new MatterBodies(this.render);
        }
        this.matterBodies.renderWireframes(bodies);
    }

    public hideMatterDebug() {
        if (this.matterBodies) {
            this.matterBodies.destroy();
            this.matterBodies = undefined;
        }
    }

    public drawServerPosition(x: number, y: number) {
        if (!this.serverPosition) {
            this.serverPosition = new ServerPosition(this.render);
        }
        this.serverPosition.draw(x, y);
    }

    public hideServerPosition() {
        if (!this.serverPosition) return;
        this.serverPosition.destroy();
        this.serverPosition = null;
    }

    public liftItem(id: number, display, animation) {
        const player = this.displays.get(id);
        if (!player) {
            return;
        }
        if (!display || !animation) return;
        player.destroyMount();
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }

        const displayFrame = new FramesDisplay(scene, this.render);
        displayFrame.load(FramesModel.createFromDisplay(display, animation));
        player.mount(displayFrame, 0);
    }

    public clearMount(id: number) {
        const player = this.displays.get(id);
        if (player) {
            player.destroyMount();
        }
    }

    public throwElement(userId: number, targetId: number, display, animation) {
        const player = this.getDisplay(userId);
        if (!player) {
            return;
        }
        const target = this.getDisplay(targetId);
        if (!target) {
            return;
        }

        const scene = this.render.sceneManager.getMainScene();
        const displayFrame = new FramesDisplay(scene, this.render);
        displayFrame.load(FramesModel.createFromDisplay(display, animation));
        this.addToLayer(LayerName.SURFACE, displayFrame);
        const playerPos = player.getPosition();
        const targetPos = target.getPosition();
        // 30 大概手的位置
        displayFrame.setPosition(playerPos.x, playerPos.y - 30, playerPos.z);
        const distance = Tool.twoPointDistance(playerPos, targetPos) * 2;
        const tween = scene.tweens.add({
            targets: displayFrame,
            duration: distance,
            props: { x: targetPos.x, y: targetPos.y - 30 },
            onComplete: () => {
                tween.stop();
                displayFrame.destroy();
            }
        });

    }

    public async snapshot() {
        const scene = <PlayScene>this.sceneManager.getMainScene();
        if (!scene) return;
        const layerManager = scene.layerManager;
        if (!layerManager) return;
        const floor = layerManager.getLayer(LayerEnum.Floor.toString());
        const terrain = layerManager.getLayer(LayerEnum.Terrain.toString());
        const surface = layerManager.getLayer(LayerEnum.Surface.toString());

        const size = await this.render.getCurrentRoomSize();
        const sceneryScenes: Phaser.GameObjects.Container[] = [floor, terrain, surface];
        const offsetX = size.rows * (size.tileWidth / 2);

        this.scenerys.forEach((scenery) => {
            if (scenery.getLayer()) {
                scenery.updateScale(1);
                sceneryScenes.unshift(scenery.getLayer());
            }
        });

        const rt = scene.make.renderTexture({ x: 0, y: 0, width: size.sceneWidth, height: size.sceneHeight }, false);
        for (const layer of sceneryScenes) {
            layer.setScale(1);
        }

        rt.draw(sceneryScenes, 0, 0);
        rt.snapshot((img) => {
            Logger.getInstance().log(img);
            rt.destroy();
            for (const layer of sceneryScenes) {
                layer.setScale(this.render.scaleRatio);
            }
            this.scenerys.forEach((scenery) => scenery.updateScale(this.render.scaleRatio));
        });
    }

    public updateAttrs(display: FramesDisplay | DragonbonesDisplay, attrs: any) {
        if (!display) {
            return;
        }
        display.updateAttrs(attrs);
    }

    public destroy() {
        this.loading = false;
        if (this.preLoadList) {
            this.preLoadList.length = 0;
            this.preLoadList = [];
        }
        if (this.displays) {
            this.displays.forEach((display) => {
                if (display) display.destroy();
            });
            this.displays.clear();
        }

        if (this.mModelCache) {
            this.mModelCache.clear();
        }

        if (this.scenerys) {
            this.scenerys.forEach((block) => {
                if (block) block.destroy();
            });
            this.scenerys.clear();
        }
        if (this.matterBodies) {
            this.matterBodies.destroy();
            this.matterBodies = null;
        }
        if (this.serverPosition) {
            this.serverPosition.destroy();
            this.serverPosition = null;
        }

        if (this.mGround) {
            this.mGround.destroy();
            this.mGround = null;
        }
    }

    public showGrids(size: IPosition45Obj, maps: number[][]) {
        // if (this.mGridLayer) {
        //     this.mGridLayer.destroy();
        // }
        // const scene = this.sceneManager.getMainScene();
        // this.mGridLayer = scene.make.container(undefined, false);
        // const graphics = scene.make.graphics(undefined, false);
        // graphics.lineStyle(1, 0xffffff, 0.5);
        // graphics.beginPath();
        // for (let i = 0; i <= size.rows; i++) {
        //     this.drawLine(graphics, 0, i, size.cols, i, size);
        // }
        // for (let i = 0; i <= size.cols; i++) {
        //     this.drawLine(graphics, i, 0, i, size.rows, size);
        // }
        // graphics.closePath();
        // graphics.strokePath();
        // this.mGridLayer.add(graphics);
        // // this.mGridLayer.x += size.tileWidth / 2;
        // // this.mGridLayer.y += size.tileHeight / 2;
        // (<PlayScene>scene).layerManager.addToLayer(LayerName.MIDDLE, this.mGridLayer);
        this.mGridLayer = new TerrainGrid(this.render, size);
        this.mGridLayer.setMap(maps);
    }

    public hideGrids() {
        if (this.mGridLayer) {
            this.mGridLayer.destroy();
        }
    }

    private loadProgress() {
        const display: IDisplayObject = this.preLoadList.shift();
        if (!display) {
            this.loading = false;
            return;
        }
        display.startLoad()
            .then(() => {
                this.loadProgress();
            })
            .catch(() => {
                this.loadProgress();
            });
    }
}
