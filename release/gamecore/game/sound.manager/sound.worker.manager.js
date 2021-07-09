import { PacketHandler } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
export class SoundWorkerManager extends PacketHandler {
  constructor(game) {
    super();
    this.game = game;
  }
  addPackListener() {
    const connection = this.game.connection;
    if (connection) {
      connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SOUND_CTL, this.onPlaySoundHandler);
    }
  }
  removePacketListener() {
    const connection = this.game.connection;
    if (connection) {
      connection.removePacketListener(this);
    }
  }
  stopAll() {
    this.game.renderPeer.stopAllSound();
  }
  pauseAll() {
    this.game.renderPeer.pauseAllSound();
  }
  resume() {
    this.game.renderPeer.resumeSound();
  }
  destroy() {
    this.removePacketListener();
  }
  onPlaySoundHandler(packet) {
    const content = packet.content;
    if (content.loop === void 0) {
      content.loop = true;
    }
    this.game.peer.render.playOsdSound(content);
  }
  get connection() {
    return this.game.connection;
  }
}
