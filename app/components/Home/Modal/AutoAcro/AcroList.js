import React from 'react';
import { connect } from 'react-redux';
import { setAcros } from 'actions/home';

const AcroList = ({ acros, setAcros }) => {
	const checkChange = async ({ target: { name, checked, value } }) => {
		const index = value;
		const acrosProxy = [ ...acros ];

		if (checked) { // todo: change to remove button
			acrosProxy[index] = name;
			setAcros(acrosProxy);
		} else {
			await setAcros(acrosProxy.filter(item => item !== name));
		}
	};
	const textChange = async ({ target: { name, value } }) => {
		const index = name;
		const acrosProxy = [ ...acros ];

		acrosProxy[index] = value;
		await setAcros(acrosProxy);
	};

	if (acros.length > 0) {
		const renderedAcros = acros.map((acro, i) => (
			<div className="form-group form-inline mb-1" key={'wrapper-' + i}>
				<div className="form-check form-check-inline" key={'formcheck-' + i}>
					<label className="form-check-label">
						<input key={'checkbox-' + i}
						       className="form-check-input position-static"
						       name={acro}
						       type="checkbox"
						       value={i}
						       onChange={checkChange}
						       checked />
					</label>
				</div>
				<input key={'text-' + i} type="text" className="form-control w-25" value={acro} name={i} onChange={textChange} />
			</div>)
		);
		return (
			<form id="acroList">
				{renderedAcros}
			</form>
		);
	} else {
		return <form className="text-center" id="acroList">No Acronyms found</form>;
	}
};

const mapState = ({ home: { autoAcro: { acros } } }) => ({ acros });
const mapDispatch = { setAcros };

export default connect(mapState, mapDispatch)(AcroList);