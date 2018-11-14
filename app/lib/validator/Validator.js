
export default class Validator {
	validationResults = {}; // final results object to be returned after validation
	progress = 0; // files completed, for progress bar

	constructor(tomData) {
		this.data = tomData;
	}

	incrementProgress() {
		this.progress += 1;
	}
	getProgress() {
		return this.progress;
	}
	resetProgress() {
		this.progress = 0;
	}

	getValidationResults() {
		return this.validationResults;
	}
	addValidationResults(path, results) {
		this.validationResults[path] = results;
	}
}