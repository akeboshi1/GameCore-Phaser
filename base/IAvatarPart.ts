import BasicSprite from '../display/BasicSprite';
import {BasicAvatar} from './BasicAvatar';
import {IAnimatedObject} from './IAnimatedObject';

export interface IAvatarPart extends IAnimatedObject {
    owner: BasicAvatar;
    type: String;
    partName: string;
    readonly view: BasicSprite;
    readonly key: string;

    dispose();
}
