import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";
import {MessageType} from "../const/MessageType";

export class CommWindowModule extends Module {
    protected onInit(): void {
        if ( this.view ) {
            this.m_View.once( "close" , this.closeHandle, this );
        }
    }

    protected onStop(): void {
        if (this.m_View && this.m_ParentContainer) {
            this.m_ParentContainer.remove(this.m_View);
            Globals.MessageCenter.emit(MessageType.MODULE_VIEW_REM, this.m_Name);
        }
    }

    protected onRecover(): void {
        if (this.m_View && this.m_ParentContainer) {
            this.m_ParentContainer.add(this.m_View);
            Globals.MessageCenter.emit(MessageType.MODULE_VIEW_ADD, this.m_Name);
        }
    }

    protected closeHandle(): void {
        Globals.ModuleManager.destroyModule( this.name );
    }
}