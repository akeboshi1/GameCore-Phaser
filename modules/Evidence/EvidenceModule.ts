import "phaser-ce";
import Globals from "../../Globals";
import {EvidenceContext} from "./EvidenceContext";
import {EvidenceView} from "./view/EvidenceView";
import {CommWindowModule} from "../../common/view/CommWindowModule";

export class EvidenceModule extends CommWindowModule {
    public onStartUp(): void {
        this.m_View = new EvidenceView( Globals.game );
        Globals.LayerManager.uiLayer.add( this.m_View );
        this.m_Context = new EvidenceContext(this.m_View);
    }

    public onDispose() {
        super.onDispose();
        Globals.LayerManager.uiLayer.remove( this.m_View );
    }
}
