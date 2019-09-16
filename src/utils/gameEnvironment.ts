import { WorldService } from "../game/world.service";

export class GameEnvironment {
    constructor(private world: WorldService) {
    }

    isWindow(): boolean {
        return this.world.game.device.os.windows && (this.world.game.device.browser.edge ||
            this.world.game.device.browser.firefox || this.world.game.device.browser.ie || this.world.game.device.browser.chrome);
    }

    isMac(): boolean {
        return this.world.game.device.os.iOS && this.world.game.device.browser.safari;
    }

    isIOSPhone(): boolean {
        return (this.world.game.device.os.iPhone || this.world.game.device.os.iPad) && this.world.game.device.browser.mobileSafari;
    }

    isAndroid(): boolean {
        return this.world.game.device.os.android;
    }
}
