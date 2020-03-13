import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaNavigateMediator } from "../PicaNavigate/PicaNavigateMediator";
import { FurniBagPanel } from "./FurniBagPanel";
import { FurniBag } from "./FurniBag";
import { op_virtual_world, op_client, op_def } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";

export class FurniBagMediator extends BaseMediator {
    protected mView: FurniBagPanel;
    private scene: Phaser.Scene;
    private mFurniBag: FurniBag;
    constructor(
        private layerManager: ILayerManager,
        scene: Phaser.Scene,
        worldService: WorldService
    ) {
        super(worldService);
        this.scene = this.layerManager.scene;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.isShowing) {
            this.layerManager.addToUILayer(this.mView);
            return;
        }

        if (!this.mFurniBag) {
            this.mFurniBag = new FurniBag(this.world);
            this.mFurniBag.register();
            this.mFurniBag.on("packageCategory", this.onPackageCategoryHandler, this);
            this.mFurniBag.on("queryPackage", this.onQueryPackageHandler, this);
        }
        if (!this.mView) {
            this.mView = new FurniBagPanel(this.scene, this.world);
            this.mView.on("getCategories", this.onGetCategoriesHandler, this);
            this.mView.on("queryPackage", this.onQueryPackage, this);
            this.mView.on("close", this.onCloseHandler, this);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    destroy() {
        if (this.mFurniBag) {
            this.mFurniBag.destroy();
            this.mFurniBag = undefined;
        }
        if (this.mView) {
            this.mView.destroy();
            this.mView = undefined;
        }
        super.destroy();
    }

    private onCloseHandler() {
        // if (this.mView) {
        //     this.layerManager.removeToUILayer(this.mView);
        // }
        this.destroy();
    }

    private onPackageCategoryHandler(subcategory: op_def.IStrMap[]) {
        if (!this.mView) {
            return;
        }
        this.mView.setCategories(subcategory);
    }

    private onGetCategoriesHandler() {
        if (this.mFurniBag) {
            this.mFurniBag.getCategories();
        }
    }

    private onQueryPackageHandler(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        this.mView.setProp(content.items);
    }

    private onQueryPackage(key: string) {
        this.mFurniBag.queryPackage(key);
    }
}
