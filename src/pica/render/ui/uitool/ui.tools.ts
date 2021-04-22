import { Render } from "gamecoreRender";
import { UIAtlasName } from "picaRes";
import { AvatarSuitType, EventType } from "structure";
import { Url } from "utils";

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
    public static creatRedImge(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, offset?: { x: number, y: number }) {
        const red = scene.make.image({ key: UIAtlasName.uicommon, frame: "home_hint_b" });
        if (!offset) {
            offset = { x: 0, y: 0 };
        } else {
            offset.x = offset.x || 0;
            offset.y = offset.y || 0;
        }
        red.x = parent.width * 0.5 - red.width * 0.5 + offset.x;
        red.y = -parent.height * 0.5 + red.height * 0.5 + offset.y;
        parent.add(red);
        red.visible = true;
        return red;
    }
}
