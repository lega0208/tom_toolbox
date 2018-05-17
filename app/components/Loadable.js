import L from 'react-loadable';
import Loading, { HiddenLoading } from './Loading.js';

const Loadable = opts => {
	const LoadComponent = opts.hide === true ? HiddenLoading : Loading;
	return L({
		loading: LoadComponent,
		...opts
	})
};

export default Loadable;
