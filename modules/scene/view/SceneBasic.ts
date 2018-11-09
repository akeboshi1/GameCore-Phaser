///<reference path="../../../../globals.d.ts"/>
import {BasicAnimatedViewElement} from "../../../base/BasicAnimatedViewElement";
import {Log} from "../../../Log";
import {MapInfo} from "../../../struct/MapInfo";

export class SceneBasic extends BasicAnimatedViewElement {
    protected mActived: boolean = false;
    protected mSceneScrollWidth: number = 0;
    protected mSceneScrollHeight: number = 0;
    private mSceneInited: boolean = false;

    protected onInitialize(): void {
        super.onInitialize();
        this.watchStageResize = true;
        this.visible = this.registerForUpdates = false;
    }

    public get actived(): boolean {
        return this.mActived;
    }

    public get sceneScrollWidth(): number {
        return this.mSceneScrollWidth;
    }

    public get sceneScrollHeight(): number {
        return this.mSceneScrollHeight;
    }

    public activeScene(): void {
        if (!this.mSceneInited) {
            Log.trace("SceneBasic::activeScene SceneInited must befor the active!");
            return;
        }

        if (!this.mActived) {
            this.mActived = true;

            this.onActivedScene();
        }
    }

    public deactiveScene(): void {
        if (this.mActived) {
            this.mActived = false;

            this.onDeActivedScene();
        }
    }

    public initializeScene(value: MapInfo): void {
        if (!this.mSceneInited) {
            this.onInitializeScene(value);
            this.mSceneInited = true;
            this.onInitializeSceneComplete();
        }
    }

    public clearScene(): void {
        if (this.mSceneInited) {
            this.onClearScene();
            this.mSceneInited = false;
        }
    }

    public onTick(deltaTime: number): void {
        // this.camera.onTick(deltaTime);
    }

    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);
    }

    protected onActivedScene(): void {
        //
        this.visible = this.registerForUpdates = true;

        // stage size may be changed in last scene;
        this.requestStageResize();
    }

    protected onDeActivedScene(): void {
        this.visible = this.registerForUpdates = false;
    }

    protected onInitializeScene(value: MapInfo): void {
    }

    protected onInitializeSceneComplete(): void {
    }

    protected onClearScene(): void {
        this.visible = this.registerForUpdates = false;
    }

    protected requestStageResize(): void {
        if (!this.mActived) return;

        super.requestStageResize();
    }

    protected onStageResize(): void {
        if (this.mActived) {
            // this.camera.setSize(DEFAULT_GAME_WIDTH, DEFAULT_GAME_HEIGHT);
            // this.camera.resetPosition();
        }
    }
}
