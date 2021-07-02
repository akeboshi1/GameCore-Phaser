import { ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, Render } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { AvatarSuitType, EventType } from "structure";
import { i18n, UIHelper, Url } from "utils";
import { BackTextButton } from "../Components";

export class UITools {
    /**
     * 显示道具或家具详情
     * @param display  渲染面板
     * @param dpr 设备倍数
     * @param data 显示数据
     */
    public static showDetailDisplay(temp: { display: any, dpr: number, data?: any, render?: Render, sn?: string, itemid?: string, serialize?: string, ownerType?: number }) {
        const showFun = (data) => {
            const display = temp.display;
            const dpr = temp.dpr;
            if (data && display && display.scene) {
                display.displayLoading("loading_ui", Url.getUIRes(dpr, "loading_ui/loading_ui.png"), Url.getUIRes(dpr, "loading_ui/loading_ui.json"));
                const content: any = {};
                if (data.suitType) {
                    content.suit = [{ suit_type: data.suitType, sn: data.sn, tag: data.tag, version: data.version }];
                    content.avatar = AvatarSuitType.createAvatarBySn(data.suitType, data.sn, data.slot, data.tag, data.version);
                } else {
                    content.display = data.animationDisplay || data.display;
                    content.animations = data.animations;
                }
                display.loadDisplay(content);
            }
            const render = temp.render;
            const evetType = EventType.RETURN_ELEMENT_PI_DATA + "_" + temp.sn;
            render.emitter.off(evetType, showFun, context);
        };
        const context = { showFun };
        if (temp.data) {
            showFun(temp.data);
        } else {
            const render = temp.render;
            const partam = { sn: temp.sn, itemid: temp.itemid, serialize: temp.serialize, ownerType: temp.ownerType };
            render.renderEmitter(EventType.QUEST_ELEMENT_PI_DATA, partam);
            const evetType = EventType.RETURN_ELEMENT_PI_DATA + "_" + temp.sn;
            render.emitter.on(evetType, showFun, context);
        }

    }
    public static creatRedImge(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, offset?: { x: number, y: number }, key?: string, frame?: string) {
        key = key || UIAtlasName.uicommon;
        frame = frame || "home_hint_b";
        const red = scene.make.image({ key, frame });
        if (!offset) {
            offset = { x: 0, y: 0 };
        } else {
            offset.x = offset.x || 0;
            offset.y = offset.y || 0;
        }
        red.x = parent.width * 0.5 - red.width * 0.5 + offset.x;
        red.y = -parent.height * 0.5 + red.height * 0.5 + offset.y;
        parent.add(red);
        red.visible = false;
        return red;
    }

    public static createBackButton(scene: Phaser.Scene, dpr: number, fun: Function, caller: any, title: string = "") {
        const backButton = new BackTextButton(scene, 80 * dpr, 22 * dpr, dpr);
        backButton.setText(title);
        backButton.on(ClickEvent.Tap, fun, caller);
        backButton.enable = true;
        return backButton;
    }

    public static getGenderFrame(gender: string) {
        const nameFrame = gender === "Female" ? "people_woman" : "people_man";
        return nameFrame;
    }

    public static setImgGray(scene: Phaser.Scene, img: Phaser.GameObjects.Image) {
        const originKey = img.texture.key;
        const key = originKey + "_grady";
        const frame = img.frame.name;
        const width = img.width, height = img.height;
        if (!scene.textures.exists(key)) {
            this.createCanvasTexture(scene, img.texture, width, height, key, frame);
            const canvastexture = <Phaser.Textures.CanvasTexture>scene.textures.get(key);
            const context = canvastexture.context;
            const pixels = context.getImageData(0, 0, width, height);
            const data = pixels.data;
            for (let i = 0; i < data.length / 4; i++) {
                const index = i * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const gr = r * 0.3 + g * 0.59 + b * 0.11;// (color.red + color.green + color.blue) / 3;
                data[index] = gr;
                data[index + 1] = gr;
                data[index + 2] = gr;
            }
            context.putImageData(pixels, 0, 0);
            canvastexture.refresh();
        }
        setTimeout(() => {
            img.setTexture(key);
        }, 20);
        img.setTexture(key);
    }

    public static createCanvasTexture(scene: Phaser.Scene, texture: Phaser.Textures.Texture, width: number, height: number, key: string, frame?: string) {
        const sourceImage: any = texture.getSourceImage(frame);
        const canvasTexture = scene.textures.createCanvas(key, width, height);
        canvasTexture.context.drawImage(sourceImage, 0, 0);
        return canvasTexture;
    }
}
