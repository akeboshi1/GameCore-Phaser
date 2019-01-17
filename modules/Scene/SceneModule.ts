import "phaser-ce";
import {SceneContext} from "./SceneContext";
import {SceneView} from "./view/SceneView";
import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";

export class SceneModule extends Module {
    public onStartUp(): void {
        this.m_View = new SceneView(Globals.game);
        Globals.LayerManager.sceneLayer.add( this.m_View );
        this.m_Context = new SceneContext(this.m_View);
    }
}
