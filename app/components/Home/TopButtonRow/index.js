import React from 'react';
import {
	toggleLang,
	toggleWET,
} from '../../../actions/home';
import { startAutoAcro } from '../../../actions/home/autoAcro';

export default function TopButtonRow(props) {
	const {
		lang,
		wetVersion,
		dispatch
	} = props;

	const wetVersionClass = (version) => 'btn btn-outline-primary mb-0' + (wetVersion === version ? ' active' : '');
	const langClass = (type) => 'btn btn-outline-primary' + (lang === type ? ' active' : '');

	return (
		<div>
			<div className="btn-group mb-1 mr-2" data-toggle="buttons">
				<button className={wetVersionClass(2)} onClick={() => dispatch(toggleWET())}>WET2</button>
				<button className={wetVersionClass(4)} onClick={() => dispatch(toggleWET())}>WET4</button>
			</div>
			<div className="btn-group mb-1">
				<button className={langClass('en')} onClick={() => dispatch(toggleLang())}>EN</button>
				<button className={langClass('fr')} onClick={() => dispatch(toggleLang())}>FR</button>
			</div>
			<button className="btn btn-primary mb-1 float-right" onClick={() => dispatch(startAutoAcro())}>Run scripts</button>
		</div>
	);
}