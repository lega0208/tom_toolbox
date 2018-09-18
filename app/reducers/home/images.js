import { IMAGES } from 'actions/home/images';

const initialState = {
	images: [],
	srcMap: {},
};

export default function images(state = initialState, action) {
	switch (action.type) {
		case IMAGES.CLEAR: return initialState;
		case IMAGES.SET:
			return { ...state, images: action.payload };
		case IMAGES.MAP.SET: return { ...state, srcMap: { ...state.srcMap, ...action.payload } };
		case IMAGES.REMOVE:
			const img = state.images[action.payload];
			const _srcMap = { ...state.srcMap };
			if (_srcMap.hasOwnProperty(img)) {
				delete _srcMap[img];
			}
			return {
				images: state.images.filter((val, i) => i !== action.payload),
				srcMap: _srcMap,
			};

		default: return state;
	}
}