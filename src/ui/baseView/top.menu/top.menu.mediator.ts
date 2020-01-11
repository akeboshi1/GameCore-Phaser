import { BaseMediator } from "../../baseMediator";
import { WorldService } from "../../../game/world.service";
import { MessageType } from "../../../const/MessageType";

export class TopMenuMediator extends BaseMediator {
  private readonly scene: Phaser.Scene;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(world);
    this.scene = scene;
  }

  register() {
    this.world.emitter.on(MessageType.ADD_ICON_TO_TOP, this.onAddIconHandler, this);
    this.world.emitter.on(MessageType.REMOVE_ICON_FROM_TOP, this.onAddIconHandler, this);

  }

  unregister() {
    this.world.emitter.off(MessageType.ADD_ICON_TO_TOP, this.onAddIconHandler, this);
    this.world.emitter.off(MessageType.REMOVE_ICON_FROM_TOP, this.onRemoveIcon, this);
  }
  
  private onAddIconHandler() {
  }

  private onRemoveIcon() {
  }
}
