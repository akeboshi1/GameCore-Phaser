import { PacketHandler } from "net-socket-packet";
import { WorldService } from "../../game/world.service";

export class ElementStorage extends PacketHandler {
  private readonly world: WorldService;
  private emit: Phaser.Events.EventEmitter;
  constructor($world: WorldService) {
    super();
    this.world = $world;
    this.emit = new Phaser.Events.EventEmitter();
  }

  register() {
    if (!this.world) {
      return;
    }
    this.world.connection.addPacketListener(this);
  }

  unregister() {
    if (!this.world) {
      return;
    }
    this.world.connection.removePacketListener(this);
    this.emit.removeAllListeners();
  }

  on(event: string | symbol, fn: Function, context?: any) {
    this.emit.on(event, fn, context);
  }

  off(event: string | symbol, fn: Function, context?: any) {
    this.emit.off(event, fn, context);
  }

  destroy() {
    this.unregister();
  }
}
