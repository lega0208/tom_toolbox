import React from 'react';
import { connect } from 'react-redux';

import AcroList from './AcroList';
import DupsList from './DupsList';
import AddDefs from './AddDefs';

const Display = (props) => {
	const {
		display,
		acros,
		submit,
		acroMap,
		dups,
		dupsMap,
		noDefs,
		dispatch,
	} = props;
	switch (display) {
		case 'acroList':
			return <AcroList acros={acros} submit={submit} dispatch={dispatch} />;
		case 'promptDefs':
			return <AddDefs noDefs={noDefs} submit={submit} dispatch={dispatch} />;
		case 'chooseAcros':
			return <DupsList acros={acros}
											 acroMap={acroMap}
											 dups={dups || []}
											 dupsMap={dupsMap}
											 dispatch={dispatch} />;
	}
};
const mapStateToProps = ({autoAcro}) => ({
	acroMap: autoAcro.acroMap,
	dups: autoAcro.dups,
	dupsMap: autoAcro.dupsMap,
	noDefs: autoAcro.noDefs,
});
export default connect(mapStateToProps)(Display);