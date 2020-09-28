import { WorldService } from "../../game/world.service";
import { ElementStoragePanel } from "./ElementStoragePanel";
import { ILayerManager } from "../Layer.manager";
import { ElementStorage } from "./ElementStorate";
import { MessageType } from "../../../const/MessageType";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { BaseMediator } from "apowophaserui";

export class ElementStorageMediator extends BaseMediator {
    public static NAME: string = "ElementStorageMediator";
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    private mStorage: ElementStorage;
    private world: WorldService;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super();
        this.world = world;
        this.mStorage = new ElementStorage(world);
        this.mLayerManager = layerManager;
        this.mScene = scene;

        this.register();
    }

    show(param?: any): void {
        this.mParam = param;
        if (this.mView && this.mView.isShow() || this.mShow) {
            return;
        }
        this.mView = new ElementStoragePanel(this.mScene, this.world);
        this.mStorage.register();
        this.mStorage.on(MessageType.EDIT_MODE_QUERY_PACKAGE, this.onEditModeQueryPackageHandler, this);
        this.mLayerManager.addToUILayer(this.mView);
        this.mView.on("queryElement", this.onQueryElementHandler, this);
        this.mView.on("selectedElement", this.onSelectedElement, this);
        this.mView.show(param);
    }

    hide() {
        this.mParam = undefined;
        super.hide();
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

    destroy() {
        this.unregister();
        if (this.mStorage) {
            this.mStorage.unregister();
            this.mStorage = undefined;
        }
        super.destroy();
    }

    getView(): ElementStoragePanel {
        return <ElementStoragePanel>this.mView;
    }

    private onQueryElementHandler(page: number, perPage: number) {
        if (this.mParam) {
            this.mStorage.queryMarketPackage(page, perPage);
            return;
        }
        this.mStorage.queryPackage(page, perPage);
    }

    private register() {
        this.world.emitter.on(MessageType.EDIT_PACKAGE_EXPANED, this.onExpanedHandler, this);
        this.world.emitter.on(MessageType.EDIT_PACKAGE_COLLAPSE, this.onCollapseHandler, this);
    }

    private unregister() {
        this.world.emitter.off(MessageType.EDIT_PACKAGE_EXPANED, this.onExpanedHandler, this);
        this.world.emitter.off(MessageType.EDIT_PACKAGE_COLLAPSE, this.onCollapseHandler, this);
    }

    private onEditModeQueryPackageHandler(items: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        if (!items) {
            return;
        }
        this.getView().setProps(items);
    }

    private onSelectedElement(prop: op_client.ICountablePackageItem) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SELECTED_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SELECTED_SPRITE = packet.content;
        content.id = prop.id;
        this.world.connection.send(packet);

    }

    private onExpanedHandler() {
        this.expand();
    }

    private onCollapseHandler() {
        this.collapse();
    }
}
