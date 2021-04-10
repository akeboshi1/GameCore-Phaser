import { PicaElementStorage } from "./PicaElementStorage";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { BasicMediator, Game } from "gamecore";
import { MessageType, ModuleName, RENDER_PEER } from "structure";

export class PicaElementStorageMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICAELEMENTSTORAGE_NAME, game);
        this.mModel = new PicaElementStorage(game);
        this.game.emitter.on(MessageType.EDIT_MODE_QUERY_PACKAGE, this.onEditModeQueryPackageHandler, this);
        this.register();
    }
    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_close", this.hide, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryElement", this.onQueryElementHandler, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_selectedElement", this.onSelectedElement, this);
    }

    hide() {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_close", this.hide, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryElement", this.onQueryElementHandler, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_selectedElement", this.onSelectedElement, this);
        super.hide();
    }

    isSceneUI(): boolean {
        return true;
    }

    /**
     * 展开
     */
    expand() {
        this.mView.expand();
    }

    /**
     * 收起
     */
    collapse() {
        this.mView.collapse();
    }

    destroy() {
        this.game.emitter.off(MessageType.EDIT_MODE_QUERY_PACKAGE, this.onEditModeQueryPackageHandler, this);
        this.unregister();
        super.destroy();
    }

    private onQueryElementHandler(data: { page: number, perPage: number }) {
        if (this.mParam) {
            this.model.queryMarketPackage(data.page, data.perPage);
            return;
        }
        this.model.queryPackage(data.page, data.perPage);
    }

    private register() {
        this.game.emitter.on(MessageType.EDIT_PACKAGE_EXPANED, this.onExpanedHandler, this);
        this.game.emitter.on(MessageType.EDIT_PACKAGE_COLLAPSE, this.onCollapseHandler, this);
    }

    private unregister() {
        this.game.emitter.off(MessageType.EDIT_PACKAGE_EXPANED, this.onExpanedHandler, this);
        this.game.emitter.off(MessageType.EDIT_PACKAGE_COLLAPSE, this.onCollapseHandler, this);
    }

    private onEditModeQueryPackageHandler(items: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        if (!items) {
            return;
        }
        this.mView.setProps(items);
    }

    private onSelectedElement(prop: op_client.ICountablePackageItem) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SELECTED_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SELECTED_SPRITE = packet.content;
        content.id = prop.id;
        this.game.connection.send(packet);

    }

    private onExpanedHandler() {
        this.expand();
    }

    private onCollapseHandler() {
        this.collapse();
    }
    private get model(): PicaElementStorage {
        return (<PicaElementStorage>this.mModel);
    }
}
