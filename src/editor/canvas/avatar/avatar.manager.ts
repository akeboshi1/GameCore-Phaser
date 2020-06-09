import { WEB_AVATAR_PATH } from "./avatar.editor.dragonbone";

export interface IAvatarComponent {
  id: string;
  parts: string[];
  name?: string;
}

export class AvatarManager {
  protected _sets: IAvatarComponent[] = [];
  protected _parts: { [key: string]: IAvatarComponent } = {};

  public get parts(): { [key: string]: IAvatarComponent } {
    return this._parts;
  }

  public merge(newSets: IAvatarComponent[]) {
    this._sets = this._sets.concat(newSets);
    for (const set of this._sets) {
      for (const part of set.parts) {
        this._parts[part] = set;
      }
    }
  }

  public clear() {
    this._sets = [];
    this._parts = {};
  }

  public resources(dir: number): any[] {
    const res: any[] = [];
    const parts = this._parts;

    for (const key in parts) {
      if (parts.hasOwnProperty(key)) {
        const set: IAvatarComponent = parts[key];
        if (!set.hasOwnProperty("localImages")) {
          // eyes mous 没有背面素材
          if (dir === 1 && key === "head_eyes") {
          } else if (dir === 1 && key === "head_mous") {
          } else {
            res.push({ key: `${key}_${set.id}_${dir}`, res: `${WEB_AVATAR_PATH}/${key}_${set.id}_${dir}.png` });
          }
        }
      }
    }
    return res;
  }
}
