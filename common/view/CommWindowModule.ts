import {Module} from "../../base/module/core/Module";
import Globals from "../../Globals";

export class CommWindowModule extends Module {

    protected onInit(): void {
        if ( this.view ) {
            this.m_View.once( "close" , this.closeHandle, this );
        }
    }

    protected closeHandle(): void {
        Globals.ModuleManager.destroyModule( this.name );
    }

    public onDispose() {
        super.onDispose();
        if ( this.view ) {
            this.view.onDispose();
        }
    }
}