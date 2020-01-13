import {Panel} from "../components/panel";
import {NinePatch} from "../components/nine.patch";
import {Background, Border, Url} from "../../utils/resUtil";
import {Size} from "../../utils/size";
import {WorldService} from "../../game/world.service";
import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { NinePatchButton } from "../components/ninepatch.button";
import { CheckboxGroup } from "../components/checkbox.group";
import { Logger } from "../../utils/log";
import { Item } from "./item/Item";
import { op_client } from "pixelpai_proto";

export class ElementStoragePanel extends Panel {
    private mBackground: NinePatch;
    private mBorder: NinePatch;
    private mSearchInput: InputText;
    private mDragBtn: NinePatchButton;
    private mTabs: NinePatchButton[];
    private mProps: Item[];
    private mExpaned: boolean = true;
    private mPacgeNum: number;
    private mPrePageBtn: Phaser.GameObjects.Sprite;
    private mNextPageBtn: Phaser.GameObjects.Sprite;
    private mItemNum: number = 32;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    show(param?: any) {
        super.show(param);
        if (this.mInitialized) {
            this.setPackageNum(1);
        }
    }

    resize(oriention?: number) {
        const size: Size = this.mWorld.getSize();
        if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
            this.setSize(683 >> 1, 901 >> 1);
            this.x = size.width - (this.width * this.mWorld.uiScale) - 10;
            this.y = size.height - this.height * this.mWorld.uiScale >> 1;

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

            for (let i = 0; i < this.mTabs.length; i++) {
                this.mTabs[i].x = 280;
                this.mTabs[i].y = 60 + i * this.mTabs[i].height + 10;
            }

            const len = this.mProps.length;
            for (let i = 0; i < len; i++) {
                // this.mProps[i].setPosition((i % 8) * 60 + 20, Math.ceil(i / 8) * 60 + 80);
                this.mProps[i].x = (i % 4) * 60 + 20;
                this.mProps[i].y = Math.floor(i / 4) * 60 + 80;
            }
        } else {
            this.setSize(510, 329);
            // this.scale = this.mWorld.uiScale;
            this.mBackground.resize(this.width, this.height);
            this.mBackground.x = this.mBackground.width >> 1;
            this.mBackground.y = this.mBackground.height >> 1;

            this.mBorder.resize(496, 303);
            this.mBorder.x = 7 + (this.mBorder.width >> 1);
            this.mBorder.y = 19 + (this.mBorder.height >> 1);

            this.mSearchInput.x = 270;
            this.mSearchInput.y = 33;

            this.x = (size.width - this.width * this.mWorld.uiScale >> 1);
            this.y = size.height - this.height * this.mWorld.uiScale - 10;

            this.mDragBtn.x = this.width >> 1;
            this.mDragBtn.y = -this.mDragBtn.height >> 1;

            for (let i = 0; i < this.mTabs.length; i++) {
                this.mTabs[i].x = 24 + i * this.mTabs[i].width + 10;
                this.mTabs[i].y = 33;
            }

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
        this.scale = this.mWorld.uiScale;
        // this.setScale(this.mWorld.uiScale, this.mWorld.uiScale);
        // this.scaleX = this.scaleY = 5;
    }

    public setProps(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE) {
        const items = data.items;
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
            props = { x: size.width - (this.width * this.mWorld.uiScale) - 10 };
        } else {
            props = {y: size.height - this.height * this.mWorld.uiScale - 10};
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

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image("button", Url.getRes("ui/common/button.png"));
        this.scene.load.image("prop_background", Url.getRes("ui/common/prop_background.png"));
        this.scene.load.atlas("slip", Url.getRes("ui/bag/slip.png"), Url.getRes("ui/bag/slip.json"));
        this.scene.load.image(Background.getName(), Background.getPNG());
        super.preload();
    }

    protected init() {
        this.mBackground = new NinePatch(this.scene, 0, 0, this.width, this.height, Background.getName(), null, Background.getConfig());
        this.mBorder = new NinePatch(this.scene, 7, 19, 655 >> 1, 847 >> 1, Border.getName(), null, Border.getConfig());

        // TODO 多语言配置
        this.mSearchInput = new InputText(this.scene, 40 + 105, 40,  210, 26,  {
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

        this.mDragBtn = new NinePatchButton(this.scene, 0, -20, 80, 40, "button", "物件容器", config);
        this.mDragBtn.on("pointerup", this.switchExpand, this);

        this.mTabs = [];

        const button = new NinePatchButton(this.scene, 280, 40, 60, 30, "button", "地块",  config);

        const button2 = new NinePatchButton(this.scene, 280, 80, 60, 30, "button", "物件",  config);

        const checkbox = new CheckboxGroup().appendItemAll([button, button2]);
        checkbox.on("selected", this.onSelectedHandler, this);
        this.mTabs.push(button);
        this.mTabs.push(button2);

        this.mPrePageBtn = this.scene.make.sprite({
            key: "slip"
        }, false);
        this.mPrePageBtn.setInteractive();
        this.mPrePageBtn.on("pointerup", this.onPrePageHandler, this);

        this.mNextPageBtn = this.scene.make.sprite({
            key: "slip"
        }, false).setFlipX(true);
        this.mNextPageBtn.setInteractive();
        this.mNextPageBtn.on("pointerup", this.onNextPageHandler, this);

        this.mProps = [];

        this.add([this.mBackground, this.mBorder, this.mSearchInput, button, button2]);
        for (let i = 0; i < this.mItemNum; i++) {
            const item = new Item(this.scene);
            // this.add(item);
            this.mProps[i] = item;
        }
        this.add(this.mProps);
        this.add([this.mPrePageBtn, this.mNextPageBtn]);
        super.init();
        this.resize();

        this.collapse();
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
}
