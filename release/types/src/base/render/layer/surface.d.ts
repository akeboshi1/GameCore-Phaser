import { BaseDragonbonesDisplay } from "../display/base.dragonbones.display";
import { BaseFramesDisplay } from "../display/base.frames.display";
import { BaseLayer } from "./base.layer";
export declare class SurfaceLayer extends BaseLayer {
    add(child: BaseFramesDisplay | BaseDragonbonesDisplay): this;
    sortLayer(): void;
}
