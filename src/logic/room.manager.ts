interface IRoomManager {
    readonly currentRoom: IRoomService | undefined;
    readonly connection: Connection | undefined;
    addPackListener();
    removePackListener();
}

class RoomManager extends PacketHandler implements IRoomManager {
    private mRooms: IRoomService[] = [];
    private mCurRoom: IRoomService;
    constructor() {
        super();
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterSceneHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
    }

    public addPackListener() {
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    }

    public removePackListener() {
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    }

    public getRoom(id: number): IRoomService | undefined {
        return this.mRooms.find((room: Room) => {
            return room.id === id;
        });
    }

    public onFocus() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.resume(room.scene.scene.key);
        });
    }

    public onBlur() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.pause();
        });
    }

    public pasuseRoom(id: number) {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            const room: IRoomService = this.mRooms[idx];
            room.pause();
        }
    }

    public resumeRoom(id: number) {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        if (idx >= 0) {
            const room: IRoomService = this.mRooms[idx];
            if (room && room.scene) room.resume(room.scene.scene.key);
        }
    }

    public stop() {
        this.mRooms.forEach((room: Room) => {
            if (room && room.scene) room.destroy();
        });
    }

    public resize(width: number, height: number) {
        this.mRooms.forEach((room: Room) => {
            if (room) room.resize(width, height);
        });
    }

    public destroy() {
        this.removePackListener();
        this.mCurRoom = null;
        for (let room of this.mRooms) {
            room.destroy();
            room = null;
        }
        this.mRooms.length = 0;
    }

    private hasRoom(id: number): boolean {
        const idx = this.mRooms.findIndex((room: Room, index: number) => id === room.id);
        return idx >= 0;
    }

    private async onEnterScene(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        const vw = scene;
        if (this.hasRoom(vw.scene.id)) {
            this.onEnterRoom(scene);
        } else {
            // load this scene config in gameConfig
            this.world.loadSceneConfig(vw.scene.id.toString()).then(async (config: Lite) => {
                this.world.elementStorage.setSceneConfig(config);
                this.onEnterRoom(scene);
            });
        }
    }

    private async onEnterRoom(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        if (this.mCurRoom) {
            await this.leaveScene(this.mCurRoom);
        }
        const room = new Room(this);
        this.mRooms.push(room);
        room.addActor(scene.actor);
        room.enter(scene.scene);
        this.mCurRoom = room;
    }

    private async onEnterDecorate(scene: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE) {
        if (this.mCurRoom) {
            await this.leaveScene(this.mCurRoom);
        }
        const room: DecorateRoom = new DecorateRoom(this);
        room.enter(scene.scene);
        const actor = scene.actor;
        if (actor) room.setEnterPos(actor.x, actor.y);
        this.mRooms.push(room);
        this.mCurRoom = room;
    }

    private onEnterEditor(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        const room = new EditorRoom(this);
        room.enter(content.scene);
        this.mCurRoom = room;
        this.mRooms.push(room);
    }

    private async leaveScene(room: IRoomService) {
        if (!room) return;
        return new Promise((resolve, reject) => {
            const loading: LoadingScene = <LoadingScene>this.mWorld.game.scene.getScene(LoadingScene.name);
            if (loading) {
                loading.show().then(() => {
                    this.mRooms = this.mRooms.filter((r: IRoomService) => r.id !== room.id);
                    room.destroy();
                    resolve();
                });
            }
        });
    }

    private onEnterSceneHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
        const scene = content.scene;
        switch (scene.sceneType) {
            case op_def.SceneTypeEnum.NORMAL_SCENE_TYPE:
                this.onEnterScene(content);
                break;
            case op_def.SceneTypeEnum.EDIT_SCENE_TYPE:
                this.onEnterDecorate(content);
                break;
        }
    }

    get currentRoom(): Room {
        return <Room>this.mCurRoom;
    }

    get connection(): Connection {
        return connect;
    }
}

interface SpriteAddCompletedListener {
    onFullPacketReceived(sprite_t: op_def.NodeType): void;
}

interface IRoomService {
    readonly id: number;
    readonly terrainManager: TerrainManager;
    readonly elementManager: ElementManager;
    readonly playerManager: PlayerManager;
    readonly layerManager: LayerManager;
    readonly cameraService: ICameraService;
    readonly effectManager: EffectManager;
    readonly roomSize: IPosition45Obj;
    readonly miniSize: IPosition45Obj;
    readonly blocks: ViewblockService;
    readonly enableEdit: boolean;
    readonly sceneType: op_def.SceneTypeEnum;
    readonly connection: Connection | undefined;
    now(): number;

    startLoad();

    completeLoad();

    startPlay();

    enter(room: op_client.IScene): void;

    pause(): void;

    resume(name: string | string[]): void;

    transformTo45(p: Pos): Pos;

    transformTo90(p: Pos): Pos;

    transformToMini45(p: Pos): Pos;

    transformToMini90(p: Pos): Pos;

    addBlockObject(object: IBlockObject);

    removeBlockObject(object: IBlockObject);

    updateBlockObject(object: IBlockObject);

    addToGround(element: ElementDisplay | ElementDisplay[], index?: number);

    addToSurface(element: ElementDisplay | ElementDisplay[]);

    addToSceneUI(element: render.GameObjects.GameObject | render.GameObjects.GameObject[]);

    addToUI(element: render.GameObjects.Container | render.GameObjects.Container[]);

    addMouseListen();

    getElement(id: number): IElement;

    update(time: number, delta: number): void;

    initUI(): void;

    destroy();
}