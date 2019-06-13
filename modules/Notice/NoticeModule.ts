import { Module } from "../../base/module/core/Module";
import { NoticeView } from "./NoticeView";
import Globals from "../../Globals";
import { NoticeContext } from "./NoticeContext";

export class NoticeModule extends Module {
  onStartUp() {
    this.m_View = new NoticeView(Globals.game, Globals.LayerManager.tipLayer);
    // this.m_ParentContainer = Globals.LayerManager.tipLayer;
    // this.m_ParentContainer.add( this.m_View );
    this.m_Context = new NoticeContext(this.m_View);
  }
}