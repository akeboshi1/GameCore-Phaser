import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";
import {PromptView} from "./view/PromptView";
import {PromptContext} from "./PromptContext";

export class PromptModule extends Module {
    public onStartUp(): void {
        this.m_View = new PromptView(Globals.game);
        Globals.LayerManager.tipLayer.add( this.m_View );
        this.m_Context = new PromptContext(this.m_View);
    }
}