export class PicaRoamEffectOnePanel extends Phaser.GameObjects.Container {
    private video: Phaser.GameObjects.Video;
    constructor(scene: Phaser.Scene) {
        super(scene);
    }

}

class RaomEffectBackground extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
}
class RoamEffectBallPanel extends Phaser.GameObjects.Container {
    private pos = [[194, 71, 1], [1175, 78, -1], [1893, 174, 1], [484, 356, -1], [1590, 500, -1], [974, 625, -1],
    [70, 898, -1], [1762, 1001, -1], [372, 1366, -1], [1388, 1327, -1], [830, 1566, -1], [1765, 1723, -1],
    [1312, 1798, -1], [513, 2047, -1], [68, 2430, -1], [594, 2432, 1], [1384, 2316, -1], [1464, 2702, 1],
    [664, 2949, 1], [215, 3019, 1], [1151, 3176, 1], [590, 3419, 1], [1603, 3379, 1], [217, 3751, 1], [1009, 4126, 1],
    [387, 4245, 1], [1495, 4383, 1], [74, 4600, 1], [801, 4674, 1]];
    constructor(scene: Phaser.Scene) {
        super(scene);
        this.setSize(1980, 4740);
        this.createBalls();
    }

    protected createBalls() {
        for (const pos of this.pos) {
            // const ball = this.scene
        }
    }
}
