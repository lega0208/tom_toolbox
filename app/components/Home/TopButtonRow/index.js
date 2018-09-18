import React from 'react';
import { toggleLang, toggleWET, } from 'actions/home';
import { triggerShowAutoAcro } from 'actions/home/modal';
import { startAutoAcro } from 'actions/home/autoAcro';

export default function TopButtonRow(props) {
	const { lang, wetVersion, dispatch } = props; // todo: implement mapDispatchToProps in parent and replace dispatch
	const setProp = (prop, version) => ({ type: `SET_${prop.toUpperCase()}`, payload: version });

	const wetVersionClass = (version) => 'btn btn-outline-primary mb-0' + (wetVersion === version ? ' active' : '');
	const langClass = (type) => 'btn btn-outline-primary' + (lang === type ? ' active' : '');

	return (
		<React.Fragment>
			<div className="btn-group mb-1 mr-2" data-toggle="buttons">
				<button className={wetVersionClass(2)} onClick={() => dispatch(setProp('wetVersion', 2))}>WET2</button>
				<button className={wetVersionClass(4)} onClick={() => dispatch(setProp('wetVersion', 4))}>WET4</button>
			</div>
			<div className="btn-group mb-1">
				<button className={langClass('en')} onClick={() => dispatch(setProp('lang', 'en'))}>EN</button>
				<button className={langClass('fr')} onClick={() => dispatch(setProp('lang', 'fr'))}>FR</button>
			</div>
			<button className="btn btn-primary mb-1 float-right shadow"
			        onClick={() => dispatch(triggerShowAutoAcro())/* todo: change to run scripts */}
			>Run scripts</button>
		</React.Fragment>
	);
}