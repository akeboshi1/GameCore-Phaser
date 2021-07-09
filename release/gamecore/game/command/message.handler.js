import { PacketHandler } from "net-socket-packet";
export class MessageHandler extends PacketHandler {
  constructor(game) {
    super();
    this.game = game;
    this.addPackListener();
  }
  clear() {
    this.removePackListener();
  }
  destroy() {
    this.clear();
    this.game = void 0;
  }
  emit(event, data) {
    this.emitter.emit(event, data);
  }
  addPackListener() {
    if (this.connection) {
      this.connection.addPacketListener(this);
      this.onAddListener();
    }
  }
  removePackListener() {
    if (this.connection) {
      this.connection.removePacketListener(this);
      this.onRemoveListener();
    }
  }
  onAddListener() {
  }
  onRemoveListener() {
  }
  get connection() {
    if (this.game) {
      return this.game.connection;
    }
  }
  get emitter() {
    return this.game.emitter;
  }
}
