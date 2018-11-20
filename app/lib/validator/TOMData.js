// @flow
import type { FileData, TOMDataType } from 'types';

export default class TOMData {
	constructor(tomData: TOMDataType) {
		this.tomData = tomData;
	}
	getTOMData() {
		return this.tomData;
	}
	get files(): Array<FileData> {
		return this.tomData.files;
	}
	getFile(path): FileData {
		return this.tomData.files[path];
	}
	getFileProp(path, propName) {
		return this.tomData.files[path][propName];
	}
	setTOMData(data, propName) {
		this.tomData[propName] = data;
	}
}
