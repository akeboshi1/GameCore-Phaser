import { PlayScene } from "../scenes/play.scene";
import { BubbleContainer } from "./bubble/bubble.container";
import { ElementStateType, StateConfig, Font } from "structure";
import { FollowEnum, FollowObject, TopDisplay } from "baseRender";
import { Render } from "../render";

/**
 * 人物头顶显示对象
 */
export class ElementTopDisplay extends TopDisplay {
    protected mBubble: BubbleContainer;
    protected isDispose: boolean = false;
    protected uiScale: number;
    constructor(scene: Phaser.Scene, owner: any, protected render: Render) {
        super(scene, owner, render.scaleRatio, render.uiRatio);
        this.uiScale = render.uiScale || 1;
    }

    public showNickname(name: string) {
        if (!this.mOwner || !this.mFollows || !name) {
            return;
        }
        let follow = this.mFollows.get(FollowEnum.Nickname);
        let nickname: Phaser.GameObjects.Text = null;
        if (follow) {
            nickname = follow.object;
        } else {
            nickname = this.createNickname();
            follow = new FollowObject(nickname, this.mOwner, this.mSceneScale);
            this.mFollows.set(FollowEnum.Nickname, follow);
        }
        nickname.text = name;
        this.addToSceneUI(nickname);
        this.updateOffset();
        follow.update();
    }
    public hideNickname() {
        this.removeFollowObject(FollowEnum.Nickname);
    }

    public showBubble(text: string, setting: any) {// op_client.IChat_Setting
        const scene = this.scene;
        if (!scene || !setting) {
            return;
        }
        if (!this.mBubble) {
            this.mBubble = new BubbleContainer(scene, this.mSceneScale, this.render);
        }
        this.mBubble.addBubble(text, setting);
        this.mBubble.follow(this.mOwner);
        this.addToSceneUI(this.mBubble);
    }
    public clearBubble() {
        if (!this.mBubble) {
            return;
        }
        this.mBubble.destroy();
        this.mBubble = null;
    }
    public loadState(state: ElementStateType) {
        const key = `state_${state}`;
        if (this.scene.cache.json.exists(key)) {
            this.showStateHandler(this.scene.cache.json.get(key));
        } else {
            const fn = (_key: string) => {
                if (key === _key) {
                    this.showStateHandler(this.scene.cache.json.get(key));
                }
            };
            this.scene.load.once(`filecomplete-json-${key}`, fn, this);
            const path = this.render.url.getRes(`config/base/state/${state}.json`);
            this.scene.load.json(key, path);
            this.scene.load.start();
        }
    }
    public showUIState(state: StateConfig) {
        if (!this.mFollows) return;
        if (state.type !== "text") {
            this.loadAtals(state, this, (key: string, frame?: string) => {
                let follow;
                let sprite;
                if (state.type === "sprite") {
                    const animation = state.image.animation;
                    const frames = animation.frame;
                    this.scene.anims.create({ key: animation.anikey, frames: this.scene.anims.generateFrameNames(key, { prefix: frame + "_", frames }), duration: animation.duration, repeat: animation.repeat });
                    if (this.mFollows.has(FollowEnum.Sprite)) {
                        follow = this.mFollows.get(FollowEnum.Sprite);
                        sprite = follow.object;
                    } else {
                        sprite = this.scene.make.sprite({ key, frame: frame + "_1" });
                        follow = new FollowObject(sprite, this.mOwner, this.mSceneScale);
                        this.mFollows.set(FollowEnum.Sprite, follow);
                    }
                    sprite.play(animation.anikey);
                } else {
                    if (this.mFollows.has(FollowEnum.Image)) {
                        follow = this.mFollows.get(FollowEnum.Image);
                        sprite = follow.object;
                        sprite.setTexture(key, frame);
                    } else {
                        sprite = this.scene.make.image({ key, frame });
                        follow = new FollowObject(sprite, this.mOwner, this.mSceneScale);
                        this.mFollows.set(FollowEnum.Image, follow);
                    }
                }
                if (state.foldType === "normal") {
                    sprite.setScale(this.uiScale * this.mSceneScale);
                } else sprite.setScale(this.uiScale);
                this.addToSceneUI(sprite);
                this.updateOffset();
                follow.update();
            });
        }
    }

    updateOffset() {
        if (!this.mFollows || !this.hasTopPoint()) return;
        const offset = new Phaser.Geom.Point();
        offset.y = this.mOwner.topPoint.y;
        if (this.mFollows.has(FollowEnum.Nickname)) {
            const follow = this.mFollows.get(FollowEnum.Nickname);
            if (follow && follow.object) {
                const height = follow.object.height;
                follow.setOffset(0, offset.y);
                offset.y -= height * 0.5 + 2;
            }
        }
        this.mFollows.forEach((follow, key) => {
            if (key !== FollowEnum.Nickname && follow && follow.object) {
                const displayHeight = follow.object.height / this.mSceneScale;
                offset.y -= displayHeight * 0.5;
                follow.setOffset(0, offset.y);
                offset.y -= displayHeight * 0.5 + 2;
            }
        });
    }

    public addDisplay() {
        if (this.mFollows) {
            this.mFollows.forEach((follow) => {
                if (follow.object) this.addToSceneUI(<any>follow.object);
            });
        }
    }

    public removeUIState() {
        if (this.mFollows) {
            // this.mFollows.forEach((follow) => follow.remove());
            this.mFollows.forEach((follow, key) => {
                if (key !== FollowEnum.Nickname) {
                    follow.destroy();
                    this.mFollows.delete(key);
                }
            });
        }
    }

    public hasTopPoint(): boolean {
        // return this.mOwner && this.mOwner.hasOwnProperty("topPoint");
        return this.mOwner && this.mOwner.topPoint;
    }

    public hasNickName() {
        if (this.mFollows.has(FollowEnum.Nickname)) return true;
        return false;
    }
    public setTopDisplay(visible: boolean) {
        this.mFollows.forEach((follow) => {
            if (follow.object) follow.object.visible = visible;
        });
    }
    public destroy() {
        if (this.mFollows) {
            this.mFollows.forEach((follow) => follow.destroy());
            this.mFollows.clear();
            this.mFollows = undefined;
        }
        if (this.mBubble) {
            this.mBubble.destroy();
            this.mBubble = undefined;
        }
        super.destroy();
    }

    public update() {
        if (this.mFollows) {
            this.mFollows.forEach((follow) => follow.update());
        }
        if (this.mBubble) {
            this.mBubble.follow(this.mOwner);
        }
    }

    protected addToSceneUI(obj: any) {
        if (!this.mOwner || !obj) {
            return;
        }
        (<PlayScene>this.scene).layerManager.addToLayer("sceneUILayer", obj);
    }

    protected createNickname() {
        const nickname = this.scene.make.text({
            style: {
                fontSize: 12 * this.mSceneScale + "px",
                fontFamily: Font.DEFULT_FONT
            }
        }).setOrigin(0.5, 1).setStroke("#000000", 2 * this.mSceneScale);
        return nickname;
    }
    // private removeFollowObject(key: FollowEnum) {
    //     if (!this.mFollows) return;
    //     if (this.mFollows.has(key)) {
    //         const follow = this.mFollows.get(key);
    //         if (follow) {
    //             follow.destroy();
    //             this.mFollows.delete(key);
    //         }
    //     }

    // }
    protected loadAtals(state: StateConfig, context: any, callback: Function) {
        const pngurl = state.display.texturepath;
        const jsonurl = state.display.datapath;
        const frame = state.image.img;
        if (this.scene.textures.exists(pngurl)) {
            if (!this.isDispose && callback) callback.call(context, pngurl, frame);
        } else {
            let pngPath, jsonPath;
            state.foldType = state.foldType || "dpr";
            if (state.foldType === "dpr") {
                pngPath = this.render.url.getUIRes(this.mUIRatio, pngurl);
                if (jsonurl) jsonPath = this.render.url.getUIRes(this.mUIRatio, jsonurl);
            } else {
                pngPath = this.render.url.getNormalUIRes(pngurl);
                if (jsonurl) jsonPath = this.render.url.getNormalUIRes(jsonurl);
            }
            if (pngurl && jsonurl) {
                this.scene.load.atlas(pngurl, pngPath, jsonPath);
            } else {
                this.scene.load.image(pngurl, pngPath);
            }

            this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
                if (!this.isDispose && callback) callback.call(context, pngurl, frame);
            }, this);
            this.scene.load.start();
        }
    }
    protected showStateHandler(json) {
        this.showUIState(json);
    }
}
