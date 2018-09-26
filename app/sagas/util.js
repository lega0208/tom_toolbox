// @flow
import { call, race, take } from 'redux-saga/effects';

type withAbortOptionsType = {
	cancelActionType?: string | Array<string>, // watches for this action to be dispatched
	onCancel?: Function | Generator,
	cleanup?: Function | Generator | Array<any>, // Runs at the end, no matter what happens. Can pass array for args.
	onComplete?: Function | Generator | Array<any>, // Can pass an array with callback as first elem and args as the rest
};
type withAbortType = (
	saga: Function | Array<any>, // If you need args, pass an array w/ saga as first elem and args as the rest
	onError: Function | Function,
	options?: withAbortOptionsType,
) => any;

/**
 * Adds error and cancellation handling to the passed saga
 */
export const withAbort: withAbortType =
	(saga, onError, options: withAbortOptionsType = {}) => {
		const sagaForkDescriptor =
			!Array.isArray(saga) ? call(saga) : call(...saga); // spread args if saga is an array

		return function* () {
			try {
				if (options.cancelActionType) {
					const { task, cancel } = yield race({ task: sagaForkDescriptor, cancel: take(options.cancelActionType) });

					if (task) {
						if (options.onComplete) {
							if (!Array.isArray(options.onComplete)) { // not sure if this should be left here or returned from finally
								yield call(options.onComplete, task);
							} else {
								yield call(...options.onComplete, task);
							}
						} else {
							return yield task;
						}
					} else if (cancel && options.onCancel) {
						return yield call(options.onCancel);
					}
				} else {
					return yield sagaForkDescriptor;
				}
			} catch (e) {
				yield call(onError, e);
			} finally {
				if (options.cleanup) {
					if (!Array.isArray(options.cleanup)) {
						yield call(options.cleanup);
					} else {
						yield call(...options.cleanup);
					}
				}
			}
		}
	};