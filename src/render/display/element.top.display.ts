import { Font, Url } from "utils";
import { PlayScene } from "../scenes/play.scene";
import { BubbleContainer } from "./bubble/bubble.container";
import { ElementStateType, StateConfig } from "structure";
import { FollowEnum, FollowObject, TopDisplay } from "baseRender";

/**
 * 人物头顶显示对象
 */
export class ElementTopDisplay extends TopDisplay {
    private mBubble: BubbleContainer;
    private isDispose: boolean = false;
    constructor(scene: Phaser.Scene, owner: any, dpr: number) {
        super(scene, owner, dpr);
    }

    public showNickname(name: string) {
        if (!this.mOwner) {
            return;
        }
        let follow = this.mFollows.get(FollowEnum.Nickname);
        let nickname: Phaser.GameObjects.Text = null;
        if (follow) {
            nickname = follow.object;
        } else {
            nickname = this.scene.make.text({
                style: {
                    fontSize: 12 * this.mDpr,
                    fontFamily: Font.DEFULT_FONT
                }
            }).setOrigin(0.5).setStroke("#000000", 2 * this.mDpr);
            follow = new FollowObject(nickname, this.mOwner, this.mDpr);
            this.mFollows.set(FollowEnum.Nickname, follow);
        }
        nickname.text = name;
        if (!this.mOwner.topPoint) return;
        this.addToSceneUI(nickname);
        follow.setOffset(0, this.mOwner.topPoint.y);
        follow.update();
    }
    public hideNickname() {
        this.removeFollowObject(FollowEnum.Nickname);
    }
    public showBubble(text: string, setting: any) {// op_client.IChat_Setting
        const scene = this.scene;
        if (!scene) {
            return;
        }
        if (!this.mBubble) {
            this.mBubble = new BubbleContainer(scene, this.mDpr);
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
            this.scene.load.json(key, Url.getRes(`config/base/state/${state}.json`));
            this.scene.load.start();
        }
    }
    public showUIState(state: StateConfig) {
        if (state.type !== "text") {
            const pngurl = state.image.display.texturepath;
            const jsonurl = state.image.display.datapath;
            this.loadAtals(pngurl, jsonurl, this, () => {
                let follow;
                let sprite;
                const frame = state.image.img;
                if (state.type === "sprite") {
                    const animation = state.image.animation;
                    const frames = animation.frame;
                    this.scene.anims.create({ key: animation.anikey, frames: this.scene.anims.generateFrameNames(pngurl, { prefix: frame + "_", frames }), duration: animation.duration, repeat: animation.repeat });
                    if (this.mFollows.has(FollowEnum.Sprite)) {
                        follow = this.mFollows.get(FollowEnum.Sprite);
                        sprite = follow.object;
                    } else {
                        sprite = this.scene.make.sprite({ key: pngurl, frame: frame + "_1" });
                        follow = new FollowObject(sprite, this.mOwner, this.mDpr);
                        this.mFollows.set(FollowEnum.Sprite, follow);
                    }
                    sprite.play(animation.anikey);
                } else {
                    if (this.mFollows.has(FollowEnum.Sprite)) {
                        follow = this.mFollows.get(FollowEnum.Sprite);
                        sprite = follow.object;
                        sprite.setTexture(pngurl, frame);
                    } else {
                        sprite = this.scene.make.image({ key: pngurl, frame });
                        follow = new FollowObject(sprite, this.mOwner, this.mDpr);
                        this.mFollows.set(FollowEnum.Sprite, follow);
                    }
                }
                const point = this.getYOffset();
                follow.setOffset(0, point.y);
                this.addToSceneUI(sprite);
                follow.update();
            });
        }
    }

    public getYOffset() {
        const pos = new Phaser.Geom.Point();
        pos.x = 0, pos.y = this.mOwner.topPoint.y;
        // if (this.mFollows.has(FollowEnum.Nickname)) {
        //     const follow = this.mFollows.get(FollowEnum.Nickname);
        //     if (follow && follow.object) {
        //         pos.y += (<any>(follow.object)).height * 0.5;
        //     }
        // }
        return pos;
    }
    public addDisplay() {

        if (this.mFollows) {
            this.mFollows.forEach((follow) => {
                if (follow.object) this.addToSceneUI(<any>follow.object);
            });
        }
    }

    public removeDisplay() {
        if (this.mFollows) {
            this.mFollows.forEach((follow) => follow.remove());
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
    private loadAtals(pngurl: string, jsonurl: string, context: any, callback: any) {
        if (this.scene.textures.exists(pngurl)) {
            if (!this.isDispose && callback) callback.call(context);
        } else {
            this.scene.load.atlas(pngurl, Url.getUIRes(this.mDpr, pngurl), Url.getUIRes(this.mDpr, jsonurl));
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
                if (!this.isDispose && callback) callback.call(context);
            }, this);
            this.scene.load.start();
        }
    }
    private showStateHandler(json) {
        this.showUIState(json);
    }
}
