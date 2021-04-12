import "tooqinggamephaser";
import "gamecoreRender";
import "dragonBones";
import "apowophaserui";
import { LocalStorageManager, Render as BaseRender, SceneManager, CamerasManager, InputManager, SoundManager, PlayScene } from "gamecoreRender";
import { EditorCanvasManager } from "../../render/managers/editor.canvas.manager";
import { ILauncherConfig, SceneName } from "structure";
import { PicaGuideManager } from "./guide";
import { PicaRenderUiManager } from "./ui";
import { PicaDisplayManager } from "./manager/pica.display.manager";
import { MouseManagerDecorate } from "./input";
import { Export } from "webworker-rpc";

export class Render extends BaseRender {
    constructor(config: ILauncherConfig, callBack?: Function) {
        super(config, callBack);
    }

    createManager() {
        if (!this.mUiManager) this.mUiManager = new PicaRenderUiManager(this);
        if (!this.mGuideManager) this.mGuideManager = new PicaGuideManager(this);
        if (!this.mCameraManager) this.mCameraManager = new CamerasManager(this);
        if (!this.mLocalStorageManager) this.mLocalStorageManager = new LocalStorageManager();
        if (!this.mSceneManager) this.mSceneManager = new SceneManager(this);
        if (!this.mSoundManager) this.mSoundManager = new SoundManager(this);
        if (!this.mInputManager) this.mInputManager = new InputManager(this);
        if (!this.mDisplayManager) this.mDisplayManager = new PicaDisplayManager(this);
        if (!this.mEditorCanvasManager) this.mEditorCanvasManager = new EditorCanvasManager(this);
    }

    @Export()
    public switchDecorateMouseManager() {
        if (!this.mInputManager) return;
        this.mInputManager.changeMouseManager(new MouseManagerDecorate(this));

        const playScene: PlayScene = this.game.scene.getScene(SceneName.PLAY_SCENE) as PlayScene;
        if (playScene) {
            (<any>playScene).pauseMotion();
            (<any>playScene).disableCameraMove();
        }
    }
}
