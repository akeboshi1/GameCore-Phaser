import { isZh } from "./i18n";

export function getWarpMode() {
    const zh = isZh();
    return zh ? "char" : "word";
}
