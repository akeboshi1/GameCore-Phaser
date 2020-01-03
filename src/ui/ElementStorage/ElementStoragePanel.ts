import {Panel} from "../components/panel";
import {NinePatch} from "../components/nine.patch";
import {Background, Border, Url} from "../../utils/resUtil";
import {Size} from "../../utils/size";
import {WorldService} from "../../game/world.service";
import InputText from "../../../lib/rexui/plugins/gameobjects/inputtext/InputText";
import { NinePatchButton } from "../components/ninepatch.button";
import { CheckboxGroup } from "../components/checkbox.group";
import { Logger } from "../../utils/log";

export class ElementStoragePanel extends Panel {
    private mBackground: NinePatch;
    private mBorder: NinePatch;
    private mSearchInput: InputText;
    private mDragBtn: NinePatchButton;
    private mTabs: NinePatchButton[];
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
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
        }
        this.scale = this.mWorld.uiScale;
        // this.setScale(this.mWorld.uiScale, this.mWorld.uiScale);
        // this.scaleX = this.scaleY = 5;
    }

    expand() {
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
    }

    collapse() {
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
    }

    protected preload() {
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.scene.load.image("button", Url.getRes("ui/common/button.png"));
        this.scene.load.image(Background.getName(), Background.getPNG());
        super.preload();
    }

    protected init() {
        this.mBackground = new NinePatch(this.scene, 0, 0, this.width, this.height, Background.getName(), null, Background.getConfig());
        this.mBorder = new NinePatch(this.scene, 7, 19, 655 >> 1, 847 >> 1, Border.getName(), null, Border.getConfig());
        // this.mBackground.x += this.mBackground.width >> 1;
        // this.mBackground.y += this.mBackground.height >> 1;

        // this.mBorder.x += this.mBorder.width >> 1;
        // this.mBorder.y += this.mBorder.height >> 1;

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

        this.mTabs = [];

        const button = new NinePatchButton(this.scene, 280, 40, 60, 30, "button", "地块",  config);

        const button2 = new NinePatchButton(this.scene, 280, 80, 60, 30, "button", "物件",  config);

        const checkbox = new CheckboxGroup().appendItemAll([button, button2]);
        checkbox.on("selected", this.onSelectedHandler, this);
        this.mTabs.push(button);
        this.mTabs.push(button2);

        this.add([this.mDragBtn, this.mBackground, this.mBorder, this.mSearchInput, button, button2]);
        super.init();
        this.resize();

        // setTimeout(() => {
        //     this.collapse();
        // }, 2000);
        // setTimeout(() => {
        //     this.expand();
        // }, 5000);
    }

    private onSelectedHandler() {
    }
}
