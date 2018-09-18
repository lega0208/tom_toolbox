import React from 'react';
import { connect } from 'react-redux';
import { clipboard, eClipboard } from 'electron';
import { setWET, setLang } from 'actions/home';
import { startScripts } from 'actions/home/scripts';

function TopButtonRow({ opts, setWET, setLang, startScripts }) {

	const ToggleButtons = ({ labels, optVals, extraClasses = '', setFunc, currentVal }) => {
		const classes = 'btn btn-outline-primary' + ` ${extraClasses}`;
		const isActive = (i) => optVals[i] === currentVal ? ' active' : '';

		const ToggleButton = ({ index }) => (
			<button className={classes + isActive(index)}
			        onClick={() => setFunc(optVals[index])}>
				{labels[index]}
			</button>
		);

		return (
			<React.Fragment>
				<ToggleButton index={0} />
				<ToggleButton index={1} />
			</React.Fragment>
		);
	};

	return (
		<React.Fragment>
			<div className="btn-group mb-1 mr-2" data-toggle="buttons">
				<ToggleButtons labels={['WET2', 'WET4']}
				               optVals={[2, 4]}
				               currentVal={opts.wetVersion}
				               setFunc={setWET}
				               extraClasses="mb-0"
				/>
			</div>
			<div className="btn-group mb-1">
				<ToggleButtons labels={['EN', 'FR']}
				               optVals={['en', 'fr']}
				               currentVal={opts.lang}
				               setFunc={setLang}
				/>
			</div>
			<button className="btn btn-primary mb-1 float-right"
			        onClick={() => startScripts(clipboard.readHTML('text/html') || clipboard.readText())}
			>
				Run scripts
			</button>
		</React.Fragment>
	);
}

const mapState = ({ home: { options: { converter } } }) => ({ opts: converter });
const mapDispatch = {
	setWET: (wetVersion) => setWET(wetVersion),
	setLang: (lang) => setLang(lang),
	startScripts: (text) => startScripts(text),
};

export default connect(mapState, mapDispatch)(TopButtonRow)