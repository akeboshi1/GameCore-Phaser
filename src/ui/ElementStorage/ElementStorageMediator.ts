import {BaseMediator} from "../baseMediator";
import {WorldService} from "../../game/world.service";
import {ElementStoragePanel} from "./ElementStoragePanel";
import {ILayerManager} from "../layer.manager";
import {DecoratePanel} from "../decorate/decorate.panel";
import { ElementStorage } from "./ElementStorate";
import { MessageType } from "../../const/MessageType";
import { PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Logger } from "../../utils/log";

export class ElementStorageMediator extends BaseMediator {
    public static NAME: string = "ElementStorageMediator";
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    private mStorage: ElementStorage;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
        this.mStorage = new ElementStorage(world);
        this.mLayerManager = layerManager;
        this.mScene = scene;
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow() || this.isShowing) {
            return;
        }
        this.mView = new ElementStoragePanel(this.mScene, this.world);
        this.mStorage.register();
        this.mStorage.on(MessageType.EDIT_MODE_QUERY_PACKAGE, this.onEditModeQueryPackageHandler, this);
        this.mLayerManager.addToUILayer(this.mView);
        this.mView.show(param);

        this.mStorage.queryPackage(1, 20);
    }

    isSceneUI(): boolean {
        return true;
    }

    /**
     * 展开
     */
    expand() {
        const view = this.getView();
        if (view) {
            view.expand();
        }
    }

    /**
     * 收起
     */
    collapse() {
        const view = this.getView();
        if (view) {
            view.collapse();
        }
    }

    getView(): ElementStoragePanel {
        return <ElementStoragePanel> this.mView;
    }

    private onEditModeQueryPackageHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE = packet.content;
        Logger.getInstance().log("EditorMode: ", content);
    }
}
