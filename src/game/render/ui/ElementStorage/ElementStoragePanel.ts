import { BasePanel } from "../Components/BasePanel";
import { NinePatch } from "../Components/Nine.patch";
import { Background, Border, Url } from "../../game/core/utils/resUtil";
import { Size } from "../../game/core/utils/size";
import { WorldService } from "../../game/world.service";
import { Item } from "./Item/Item";
import { op_client } from "pixelpai_proto";
import { ElementStorageMediator } from "./ElementStorageMediator";
import { InputText, NineSliceButton } from "apowophaserui";

export class ElementStoragePanel extends BasePanel {
    private mBackground: NinePatch;
    private mBorder: NinePatch;
    private mSearchInput: InputText;
    private mDragBtn: NineSliceButton;
    // private mTabs: NineSliceButton[];
    private mProps: Item[];
    private mExpaned: boolean = true;
    private mPacgeNum: number;
    private mPrePageBtn: Phaser.GameObjects.Sprite;
    private mNextPageBtn: Phaser.GameObjects.Sprite;
    private mItemNum: number = 32;
    private mDragImage: Phaser.GameObjects.Image;
    private mDragData: op_client.ICountablePackageItem;
    private mCloseBtn: Phaser.GameObjects.Image;
    private mDragging: boolean;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.setTween(false);
        this.dpr /= 2;
    }

    show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.setPackageNum(1);
        }
    }

    resize(oriention?: number) {
        const size: Size = this.mWorld.getSize();
        this.scale = this.dpr;
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            this.setSize(683 >> 1, 901 >> 1);
            this.x = size.width - (this.width * this.dpr) - 10;
            this.y = size.height - this.height * this.dpr >> 1;

            this.mBackground.resize(this.width, this.height);
            this.mBackground.x = this.mBackground.width >> 1;
            this.mBackground.y = this.mBackground.height >> 1;

            this.mBorder.resize(655 >> 1, 847 >> 1);
            this.mBorder.x = 7 + (this.mBorder.width >> 1);
            this.mBorder.y = 19 + (this.mBorder.height >> 1);

            this.mSearchInput.x = 40 + 105;
            this.mSearchInput.y = 40;

            this.mDragBtn.x = -this.mDragBtn.height;
            this.mDragBtn.y = this.height >> 1;

            // for (let i = 0; i < this.mTabs.length; i++) {
            //     this.mTabs[i].x = 280;
            //     this.mTabs[i].y = 60 + i * this.mTabs[i].height + 10;
            // }

            const len = this.mProps.length;
            for (let i = 0; i < len; i++) {
                // this.mProps[i].setPosition((i % 8) * 60 + 20, Math.ceil(i / 8) * 60 + 80);
                this.mProps[i].x = (i % 4) * 60 + 20;
                this.mProps[i].y = Math.floor(i / 4) * 60 + 80;
            }
        } else {
            this.setSize(510, 329);
            // this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height));
            // this.scale = this.mWorld.uiScale;
            this.mBackground.resize(this.width, this.height);
            this.mBackground.x = this.mBackground.width >> 1;
            this.mBackground.y = this.mBackground.height >> 1;

            this.mBorder.resize(496, 303);
            this.mBorder.x = 7 + (this.mBorder.width >> 1);
            this.mBorder.y = 19 + (this.mBorder.height >> 1);

            this.mSearchInput.x = 270;
            this.mSearchInput.y = 33;

            this.x = (size.width - this.width * this.dpr >> 1);
            this.y = size.height - this.height * this.dpr - 10;

            this.mDragBtn.x = this.width >> 1;
            this.mDragBtn.y = -this.mDragBtn.height >> 1;

            // for (let i = 0; i < this.mTabs.length; i++) {
            //     this.mTabs[i].x = 24 + i * this.mTabs[i].width + 10;
            //     this.mTabs[i].y = 33;
            // }

            const len = this.mProps.length;
            for (let i = 0; i < len; i++) {
                // this.mProps[i].setPosition((i % 8) * 60 + 20, Math.ceil(i / 8) * 60 + 80);
                this.mProps[i].x = (i % 8) * 60 + 20;
                this.mProps[i].y = Math.floor(i / 8) * 60 + 80;
            }

        }
        this.mPrePageBtn.y = this.height >> 1;
        this.mNextPageBtn.x = this.width;
        this.mNextPageBtn.y = this.height >> 1;
        this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
        // this.setScale(this.mWorld.uiScale, this.mWorld.uiScale);
        // this.scaleX = this.scaleY = 5;
    }

    public addListen() {
        super.addListen();
        if (this.mBackground) this.mBackground.on("pointerout", this.onPointerOutHandler, this);
        if (this.mDragBtn) this.mDragBtn.on("pointerup", this.switchExpand, this);
        if (this.mPrePageBtn) this.mPrePageBtn.on("pointerup", this.onPrePageHandler, this);
        if (this.mNextPageBtn) this.mNextPageBtn.on("pointerup", this.onNextPageHandler, this);
        if (this.mCloseBtn) this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
        if (this.scene) {
            this.scene.input.on("dragstart", this.onDragStartHandler, this);
            this.scene.input.on("dragend", this.onDragEndHandler, this);
            this.scene.input.on("drag", this.onDragHandler, this);
        }
    }

    public removeListen() {
        super.removeListen();
        if (this.mBackground) this.mBackground.off("pointerout", this.onPointerOutHandler, this);
        if (this.mDragBtn) this.mDragBtn.off("pointerup", this.switchExpand, this);
        if (this.mPrePageBtn) this.mPrePageBtn.off("pointerup", this.onPrePageHandler, this);
        if (this.mNextPageBtn) this.mNextPageBtn.off("pointerup", this.onNextPageHandler, this);
        if (this.mCloseBtn) this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
        if (this.scene) {
            this.scene.input.off("dragstart", this.onDragStartHandler, this);
            this.scene.input.off("dragend", this.onDragEndHandler, this);
            this.scene.input.off("drag", this.onDragHandler, this);
        }
    }
    public setProps(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        const items = data.items;
        this.clearItem();
        for (let i = 0; i < items.length; i++) {
            if (i >= this.mProps.length) {
                return;
            }
            this.mProps[i].setProp(items[i]);
        }
    }

    expand() {
        if (this.mExpaned) {
            return;
        }
        const size: Size = this.mWorld.getSize();
        let props = null;
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            props = { x: size.width - (this.width * this.dpr) - 10 };
        } else {
            props = { y: size.height - this.height * this.dpr - 10 };
        }
        this.scene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Linear",
            props
        });
        this.remove(this.mDragBtn);
        this.add([this.mPrePageBtn, this.mNextPageBtn]);
        this.mExpaned = true;
    }

    collapse() {
        if (!this.mExpaned) {
            return;
        }
        const size: Size = this.mWorld.getSize();
        let props = null;
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            props = { x: size.width };
        } else {
            props = { y: size.height };
        }
        this.scene.tweens.add({
            targets: this,
            duration: 200,
            ease: "Linear",
            props
        });
        this.addAt(this.mDragBtn, 0);
        this.remove([this.mPrePageBtn, this.mNextPageBtn]);
        this.mExpaned = false;
    }

    destroy() {
        if (this.scene) {
            this.scene.input.off("dragstart", this.onDragStartHandler, this);
            this.scene.input.off("dragend", this.onDragEndHandler, this);
            this.scene.input.off("drag", this.onDragHandler, this);
        }
        super.destroy();
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image("button", Url.getRes("ui/common/button.png"));
        this.scene.load.image("prop_background", Url.getRes("ui/common/prop_background.png"));
        this.scene.load.atlas("slip", Url.getRes("ui/bag/slip.png"), Url.getRes("ui/bag/slip.json"));
        this.mScene.load.atlas("clsBtn", Url.getRes("ui/common/common_clsBtn.png"), Url.getRes("ui/common/common_clsBtn.json"));
        this.scene.load.image(Background.getName(), Background.getPNG());
        super.preload();
    }

    protected init() {
        this.mBackground = new NinePatch(this.scene, 0, 0, this.width, this.height, Background.getName(), null, Background.getConfig());
        this.mBorder = new NinePatch(this.scene, 7, 19, 655 >> 1, 847 >> 1, Border.getName(), null, Border.getConfig());
        // this.mBackground.setInteractive();

        // TODO 多语言配置
        this.mSearchInput = new InputText(this.scene, 40 + 105, 40, 210, 26, {
            type: "input",
            fontSize: "14px",
            color: "#808080",
            placeholder: "输入关键词进行搜索"
        });

        const config = {
            left: 4,
            top: 4,
            right: 4,
            bottom: 4
        };

        this.mDragBtn = new NineSliceButton(this.scene, 0, -20, 80, 40, "button", "", "物件容器", this.dpr, this.scale, config);

        this.mPrePageBtn = this.scene.make.sprite({
            key: "slip"
        }, false);
        this.mPrePageBtn.setInteractive();
        this.mNextPageBtn = this.scene.make.sprite({
            key: "slip"
        }, false).setFlipX(true);
        this.mNextPageBtn.setInteractive();

        this.mProps = [];

        this.add([this.mBackground, this.mBorder, this.mSearchInput]);
        for (let i = 0; i < this.mItemNum; i++) {
            const item = new Item(this.scene);
            // this.add(item);
            // this.scene.input.setDraggable(item);
            // item.on("click", this.onClick, this);
            this.mProps[i] = item;
        }
        this.add(this.mProps);
        this.add([this.mPrePageBtn, this.mNextPageBtn]);

        // this.mCloseBtn = new IconBtn(this.mScene, this.mWorld, {
        //     key: UIMediatorType.Close_Btn, bgResKey: "clsBtn", bgTextures: ["btn_normal", "btn_over", "btn_click"],
        //     iconResKey: "", iconTexture: "", scale: 1, pngUrl: this.mResPng, jsonUrl: this.mResJson
        // });
        this.mCloseBtn = this.scene.make.image({
            key: "clsBtn",
            frame: "btn_normal"
        }, false).setInteractive().setScale(2);
        this.add(this.mCloseBtn);
        super.init();
        this.resize();
        this.expand();
    }

    private onPrePageHandler() {
        this.setPackageNum(this.mPacgeNum - 1);
    }

    private onNextPageHandler() {
        this.setPackageNum(this.mPacgeNum + 1);
    }

    private setPackageNum(val: number) {
        this.mPacgeNum = val < 1 ? 1 : val;
        this.emit("queryElement", this.mPacgeNum, 32);
    }

    private switchExpand() {
        this.mExpaned ? this.collapse() : this.expand();
    }

    private onSelectedHandler() {
    }

    private onClick(data: op_client.ICountablePackageItem) {
        // this.emit("selectedElement", data);
    }

    private onDragStartHandler(pointer, gameobject, dragX, dragY) {
        const item: Item = gameobject.parentContainer;
        if (item instanceof Item) {
            // this.emit("selectedElement", item.prop);
            // gameobject.x = dragX;
            // gameobject.y = dragX;
            this.mDragData = item.prop;
        }
        if (!this.mDragImage) {
            this.mDragImage = this.scene.make.image(undefined, false);
            this.add(this.mDragImage);
        }
        this.mDragImage.x = item.x;
        this.mDragImage.y = item.y;
        this.mDragImage.setTexture(gameobject.texture.key);
        this.mDragging = true;
        // this.mDragImage.texture = gameobject.texture;
        // Logger.getInstance().log("======", pointer, gameobject);
    }

    private onDragEndHandler() {
        if (!this.mDragImage) {
            return;
        }
        this.mDragImage.setTexture(undefined);
        this.mDragging = false;
    }

    private onDragHandler(pointer, gameobject, dragX, dragY) {
        if (!this.mDragImage) {
            return;
        }
        this.mDragImage.x += pointer.x - pointer.prevPosition.x;
        this.mDragImage.y += pointer.y - pointer.prevPosition.y;
    }

    private onPointerOutHandler() {
        if (this.mDragImage && this.mDragging) {
            this.emit("selectedElement", this.mDragData);
            this.mDragImage.setTexture(undefined);
            this.mDragging = false;
        }
    }

    private clearItem() {
        if (!this.mProps) return;
        this.mProps.map((item) => item.clear());
    }

    private onCloseHandler() {
        const med = this.mWorld.uiManager.getMediator(ElementStorageMediator.name);
        if (med) med.hide();
    }
}
