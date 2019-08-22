import { IRoomManager } from "./room.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.mamager";
import { LayerManager } from "./layer/layer.manager";
import { TerrainManager } from "./terrain/terrain.manager";
import { SceneType } from "../const/scene.type";


export interface RoomService {
    enter(): void;
}

// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
export class Room implements RoomService {
    private mTerainManager: TerrainManager;
    private mElementManager: ElementManager;
    private mPlayerManager: PlayerManager;
    private mLayManager: LayerManager;
    constructor(private manager: IRoomManager, private mScene: Phaser.Scene) {
        this.mTerainManager = new TerrainManager(manager, this);
        this.mElementManager = new ElementManager(manager);
        this.mPlayerManager = new PlayerManager(manager);
        this.mLayManager = new LayerManager(manager, mScene);
    }

    enter(): void {
        // TODO
    }

    public getScene(): Phaser.Scene {
        return this.mScene;
    }

    public getTerrainMgr(): TerrainManager {
        return this.mTerainManager || undefined;
    }

    public getElementMgr(): ElementManager {
        return this.mElementManager || undefined;
    }

    public getPlayerMgr(): PlayerManager {
        return this.mPlayerManager || undefined;
    }

    public getLayerMgr(): LayerManager {
        return this.mLayManager || undefined;
    }






}
