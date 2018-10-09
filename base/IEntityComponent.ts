export interface IEntityComponent {
    onTick(deltaTime: number): void;

    owner: any;
}
