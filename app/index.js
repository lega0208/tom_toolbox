import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/alert';
import 'bootstrap/js/dist/button';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/tooltip';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/tab';
import './bootstrap.global.scss';
import './app.global.css';

import Root from './containers/Root';

import('./store/configureStore').then(({ configureStore, history }) => {
	const store = configureStore();

	render(
		<AppContainer>
			<Root store={store} history={history} id="reactroot" />
		</AppContainer>,
		document.getElementById('root')
	);

	if (module.hot) {
		module.hot.accept('./containers/Root', () => {
			const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
			render(
				<AppContainer>
					<NextRoot store={store} history={history} id="reactroot" />
				</AppContainer>,
				document.getElementById('root')
			);
		});
	}
});
