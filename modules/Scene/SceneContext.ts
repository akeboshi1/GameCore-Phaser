import {SceneMediator} from "./SceneMediator";
import {ModuleContext} from "../../base/module/core/ModuleContext";
import Globals from "../../Globals";
import {SceneEditorMediator} from "./SceneEditorMediator";

export class SceneContext extends ModuleContext {

    constructor(view: Phaser.Sprite) {
        super(view);
    }

    protected registerMediator(): void {
        if (Globals.isEditor) {
            this.m_Mediator = new SceneEditorMediator();
        } else {
            this.m_Mediator = new SceneMediator();
        }
    }
}