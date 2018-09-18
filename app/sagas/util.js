// @flow
import { call, race, take } from 'redux-saga/effects';

type withAbortOptionsType = {
	cancelActionName?: string | Array<string>, // watches for this action to be dispatched
	onCancel?: Function | Generator,
	cleanup?: Function | Generator | Array<any>, // Runs at the end, no matter what happens. Can pass array for args.
	onComplete?: Function | Generator | Array<any>, // Can pass an array with callback as first elem and args as the rest
};
type withAbortType = (
	saga: Function | Array<any>, // If you need args, pass an array w/ saga as first elem and args as the rest
	onError: Function | Function,
	options: withAbortOptionsType,
) => any;

/**
 * Adds error and cancellation handling to the passed saga
 */
export const withAbort: withAbortType =
	(saga, onError, { cancelActionType, onCancel, onComplete, cleanup }) => {
		const sagaForkDescriptor =
			!Array.isArray(saga) ? call(saga) : call(...saga); // spread args if saga is an array
		const raceDescriptor = race({ task: sagaForkDescriptor, cancel: take(cancelActionType) });

		return function* () {
			try {
				if (cancelActionType) {
					const { task, cancel } = yield raceDescriptor;

					if (task) {
						if (onComplete) {
							if (!Array.isArray(onComplete)) { // not sure if this should be left here or returned from finally
								yield call(onComplete, task);
							} else {
								yield call(...onComplete, task);
							}
						} else {
							return yield task;
						}
					} else if (cancel && onCancel) {
						return yield call(onCancel);
					}
				} else {
					return yield sagaForkDescriptor;
				}
			} catch (e) {
				yield call(onError, e);
			} finally {
				if (cleanup) {
					if (!Array.isArray(cleanup)) {
						yield call(cleanup);
					} else {
						yield call(...cleanup);
					}
				}
			}
		}
	};