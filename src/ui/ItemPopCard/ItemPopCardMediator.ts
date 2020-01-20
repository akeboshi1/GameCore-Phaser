import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";

export class ItemPopCardMediator extends BaseMediator {
  constructor(worldService: WorldService) {
    super(worldService);
  }
}
