// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import home from './home';
import autoAcro from './home/autoAcro';

const rootReducer = combineReducers({
	home,
  router,
	autoAcro,
});

export default rootReducer;
