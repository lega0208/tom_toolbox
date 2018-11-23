// @flow
import type { FileData, TOMDataType } from 'types';

export default class TOMData {
	constructor(tomData: TOMDataType) {
		this.tomData = tomData;
	}
	getTOMData() {
		return this.tomData;
	}
	setTOMData(data, propName) {
		this.tomData[propName] = data;
	}
	getFiles(): Array<FileData> {
		return this.tomData.files;
	}
	getFile(path): FileData {
		return this.tomData.files[path];
	}
	deleteFile(path) {
		delete this.tomData.files[path];
	}
	getFileProp(path, propName) {
		return this.tomData.files[path][propName];
	}
	getRef() {
		return this;
	}
}
