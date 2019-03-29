import {ModuleContext} from "../../base/module/core/ModuleContext";
import {StorageMediator} from "./StorageMediator";

export class StorageContext extends ModuleContext {
    protected registerMediator(): void {
        this.m_Mediator = new StorageMediator();
        super.registerMediator();
    }
}