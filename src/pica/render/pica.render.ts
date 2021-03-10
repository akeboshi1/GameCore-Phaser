import "tooqinggamephaser";
import "gamecoreRender";
import "dragonBones";
import "apowophaserui";
import { LocalStorageManager, Render as BaseRender, SceneManager, CamerasManager, InputManager } from "gamecoreRender";
import { EditorCanvasManager } from "../../render/managers/editor.canvas.manager";
import { ILauncherConfig } from "structure";
import { PicaGuideManager } from "./guide";
import { PicaRenderUiManager } from "./ui";
import { PicaDisplayManager } from "./manager/pica.display.manager";

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
        if (!this.mInputManager) this.mInputManager = new InputManager(this);
        if (!this.mDisplayManager) this.mDisplayManager = new PicaDisplayManager(this);
        if (!this.mEditorCanvasManager) this.mEditorCanvasManager = new EditorCanvasManager(this);
    }
}
