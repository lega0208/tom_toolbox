import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import home from './home';
import tomViewer from './tom-viewer';


const rootReducer = combineReducers({
	home,
	tomViewer,
  router,
});

export default rootReducer;
