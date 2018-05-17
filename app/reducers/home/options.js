

const initialState = localStorage.getItem('home.options')
											? JSON.parse(localStorage.getItem('home.options'))
											: {
													listType: 'ol',
													lang: 'en',
													wetVersion: 2,
													autoAcro: false,
													specChars: true,
													supNbsp: true,
												};

export default function options(state = initialState, action) {
	switch (action.type) {
		case 'CHANGE_LISTTYPE': return mergeState('listType');
		case 'CHANGE_LANG': return mergeState('lang');
		case 'CHANGE_WETVERSION': return mergeState('wetVersion');
		case 'CHANGE_AUTOACRO': return mergeState('autoAcro');
		case 'CHANGE_SPECCHARS': return mergeState('specChars');
		case 'CHANGE_SUPNBSP': return mergeState('supNbsp');
		default: return state;
	}

	function mergeState(propName) {
		return {
			...state,
			[propName]: action.payload,
		}
	}
}

