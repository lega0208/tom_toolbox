import { call, cancel, fork, put, take } from 'redux-saga/effects';
import cheerio from 'cheerio';
import { copy } from 'fs-extra';
import { IMAGES, setSrcMap, clearImages } from 'actions/home/images';
import { errorAlert, triggerAlert } from 'actions/home/alert';
import { withAbort } from '../util';

function* watchSaveImage() {
	while (true) {
		const { payload } = yield take('IMAGES.SAVE');
		for (const [srcPath, destPath] of Object.entries(payload)) {
			if (destPath) {
				try {
					yield fork(copy, srcPath, destPath);
					yield put(triggerAlert('success', 'Images successfully saved!'))
				} catch (e) {
					console.error(e);
					yield put(errorAlert(e.message));
				}
			}
		}
	}
}

function* startImages(text) {
	const saveImageTask = yield fork(watchSaveImage);
	yield put(clearImages());
	const $ = cheerio.load(text, { decodeEntities: false });
	const imgRef = $('img');
	console.log('imgRef.length: ' + imgRef.length);

	if (imgRef.length > 0) {
		const imgs = {};
		imgRef.each((i, img) => {
			const imgRef = $(img);
			const imgSrc = imgRef.attr('src').replace(/file:\/+/, '');
			imgRef.attr('src', imgSrc);
			imgs[imgSrc] = '';
		});

		yield put(setSrcMap(imgs)); // image reducer to be made
		yield put({ type: 'MODAL_TRIGGER_SHOW', payload: { display: 'images', screen: 'images' } });

		const { payload } = yield take(IMAGES.SUBMIT);
		yield cancel(saveImageTask);
		Object.keys(imgs)
			.forEach((img, i) => $(imgRef.get(i)).attr('src', payload[img]));

		// extra processing (e.g. making the path relative)

		return $('body').html();
	} else {
		return text;
	}
}

export default function* images(text) {
	const onError = function* (e) {
		yield put(errorAlert(e.message));
		console.error(e);
	};

	const startImagesWithAbort = withAbort([startImages, text], onError, {
		cancelActionType: [IMAGES.CANCEL, 'MODAL_HIDE'],
		onCancel: function*() {
			const $ = cheerio.load(text, { decodeEntities: false });
			$('img').each((i, img) => $(img).attr('src', ''));
			return $('body').html();
		},
		cleanup: function*() {
			yield put({ type: IMAGES.END });
			yield put({ type: 'MODAL_TRIGGER_HIDE' });
		}
	});
	return yield call(startImagesWithAbort);
}