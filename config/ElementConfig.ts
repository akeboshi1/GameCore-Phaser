import BaseSingleton from "../base/BaseSingleton";
import {Globals} from "../Globals";

export class ElementConfig extends BaseSingleton {
	private terrain_config: Object = {};
	private element_config: Object = {};
	public constructor() {
		super();
	}

	public init(configResName: string): void {
		let res = Globals.game.cache.getJSON(configResName);
		var config: Object;
		let i:number = 0;
		let len:number = res.terrain.length;
		for (; i < len; i++) {
			config = res.terrain[i];
			this.terrain_config[config["type"]] = config;
		}
		i = 0;
		len = res.elements.length;
		for (; i < len; i++) {
			config = res.elements[i];
			this.element_config[config["type"]] = config;
		}
	}

	public getTerrainBy(type:number):any
	{
		var config: Object = this.terrain_config[type];
		return config;
	}

	public getElementBy(type:number):any
	{
		var config: Object = this.element_config[type];
		return config;
	}
}