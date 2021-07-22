/// <reference types="tooqingphaser" />
import { Render } from "../../render";
import { BaseBatchPanel } from "./base.batch.panel";
export declare class BasePanel extends BaseBatchPanel {
    constructor(scene: Phaser.Scene, render: Render);
    hide(boo?: boolean): void;
    protected onHide(): void;
}
