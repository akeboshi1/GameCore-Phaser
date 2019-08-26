import { PacketHandler } from "net-socket-packet";
import { Cameras } from "./cameras";

export class CamerasManager extends PacketHandler {
  private mCameras: Cameras;
  constructor() {
    super();
  }
}