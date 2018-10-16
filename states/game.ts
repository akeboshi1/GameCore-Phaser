import {SceneProc} from "../process/SceneProc";
import Globals from "../Globals";

export default class Game extends Phaser.State {
    public init(): void {
        let data2 = {"width":50,"height":50,"tileWidth":64,"tileHeight":32,"player":"(x=8, y=8)","layers":{"name":"TerrainLayer","compression":"zlib","encoding":"base64","map":"eJztV9GOwzAI+6FN6u5p//9lUw5xwYDp1JCXU4WUReu6GGxTejzez5/n8bhjLV6/VdT19bffddphTpP9ONPjmGh2YJAs9VxEMa/pOq7vQyGn26pI9bFGc93Fi801q4KtWbf2JgP4jdVkzssOpSAeX/8Mrf1lzKJfS1lloou9prKrVvu9/mcsnfEcUasm9dNn1KlBxjxj2/9+Zo67nm7F9R+Vxqpfa2BdoWcnMyz8KYQ66OpFGddRk4z96CrmNlQt+q3D/REh83rNS/4/eMeaJvgzzbs5IvM4Yn4dSGuv8Y5bsVF5NVP3ddSRL65T5rlaUx3qjTl/15/qrGq39nXhTAcMH6qS1TffS7wvq4Jjwwyimyo++D0D69jpes2D+QSMk3nehSsds2p75ON+2a95sH6ynE9mTNfxLsxgHX098fCOG99RzmYU4Uz0jcq5pnjerXJffjfFZ3nN/0D0sl/RkJ1Lsimonvcybc0ris+ugrVn1sf3U965ccqUb7GCVgtdb3X8TTLXd1bniKwPn7KgXNkeGucFW2tktA+PZWSuypdlDbFaLVqdddYJlcLeLKMruxxaVcyf5F29I5CPydbewGdOf0UZ7+iY/pO85u+44447/nF8AF258Ys="},"elements":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,{"type":"6","id":10455,"col":1,"row":27},{"type":"6","id":10454,"col":1,"row":29},{"type":"11","id":10460,"col":2,"row":21},{"type":"4","id":10464,"col":7,"row":13},{"type":"4","id":10465,"col":12,"row":7},{"type":"11","id":10459,"col":12,"row":11},{"type":"6","id":10453,"col":12,"row":14},{"type":"11","id":10457,"col":13,"row":7},{"type":"11","id":10456,"col":13,"row":14},{"type":"4","id":10463,"col":13,"row":18},{"type":"4","id":10466,"col":16,"row":11},{"type":"12","id":10082,"col":16,"row":16},{"type":"11","id":10458,"col":17,"row":13},{"type":"4","id":10461,"col":22,"row":23},{"type":"4","id":10467,"col":22,"row":30},{"type":"6","id":10452,"col":23,"row":13},{"type":"4","id":10462,"col":29,"row":20},{"type":"4","id":10468,"col":35,"row":37}]};
        Globals.Tool.mapDecode(data2['layers']['map']);
    }

    public create(): void {
        SceneProc.getInstance().beginProc();

        
    }
}