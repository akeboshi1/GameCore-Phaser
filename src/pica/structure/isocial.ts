export interface ISocial {
    id: number;
    name: string;
    tag: { type: string, repeat: string, bulletId?: string, action?: string, propUseId?: string };
    texturePath: string;
}
