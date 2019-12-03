import { END } from 'redux-saga';
import Worker from './Worker';

class WorkerPool {
	workerPool = [];
	results = [];
	progress = [];

	constructor() {
		this.inited = false;
	}

	init(numWorkers = process.env.NUMBER_OF_PROCESSORS - 2) {
		console.log(`Initializing pool of ${numWorkers}`);
		if (numWorkers < 1 || isNaN(numWorkers) || typeof numWorkers !== 'number') {
			numWorkers = 1;
		}

		// spawn workers right away, but with small delays to avoid slowdowns. (though try doing them all at once just to see)
		for (let i = 0; i < numWorkers; i++) {
			setTimeout(() => this.workerPool.push(new Worker()), 100);
		}

		this.inited = true;
	}

	getProgress(total) {
		const numCompleted = this.progress.reduce((total, workerTotal) => total + workerTotal, 0);

		return Math.round((numCompleted / total) * 100)
	}

	async validate(files, tomData, emitter) {
		if (!this.inited) {
			this.init();
		}

		const numFiles = files.length;
		const chunkSize = Math.ceil(numFiles / this.workerPool.length);
		console.log(`starting validation of ${numFiles} files with a chunk size of ${chunkSize}`);

		for (const [i, worker] of this.workerPool.entries()) {
			this.results[i] = new Promise((res, rej) => {
				worker.onmessage = ({ data }) => {
					try {
						if (typeof data === 'number') {
							this.progress[i] = data;
							emitter({ progress: this.getProgress(numFiles) });
						} else {
							res(data);
						}
					} catch (e) {
						rej(e);
					}
				};
				worker.postMessage([files.splice(0, chunkSize), tomData]);
			});
		}

		const allResults = [].concat(
			...await Promise.all(
				this.results.reduce((allResults, workerResults) => [ ...allResults, workerResults ], [])
			)
		);
			//.filter(({ results }) => results.length > 0);

		this.results = [];
		this.progress = [];

		emitter({ results: allResults });
	}
}

const workerPool = new WorkerPool();
workerPool.init();

export default (files, tomData, emitter) => workerPool.validate(files, tomData, emitter);
