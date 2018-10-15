export class TiledProperties {
	public properties:Object = {};
	public constructor() {
	}

	/**
		 * Returns the property for the given key.
		 * 
		 * @param key The name of the property.
		 * @return The property value.
		 */
		public get(key:string):string {
			return this.properties[key];
		}

		/**
		 * Sets the property for the given key to the given value.
		 * 
		 * @param key The name of the property.
		 * @param value The property value.
		 */
		public set(key:string, value:string):void {
			this.properties[key] = value;
		}
}