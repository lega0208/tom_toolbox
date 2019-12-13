import React from 'react';
import { connect } from 'react-redux';
import { setNoDefs, setNoDefsMap } from 'actions/home';

class AddDefs extends React.Component {
	constructor(props) {
		super(props);
		if (this.props.noDefs.length > 0) {
		}
		this.checkChange = this.checkChange.bind(this);
		this.textChange = this.textChange.bind(this);
	}
	async checkChange(e) {
		const checked = e.target.checked;
		const index = e.target.value;
		const name = e.target.name;
		const noDefsProxy = this.props.noDefs;

		if (checked) {
			noDefsProxy[index] = name;
			this.props.setNoDefs(noDefsProxy);
		} else {
			await this.props.setNoDefs(noDefsProxy.filter(item => item !== name));
		}
	}
	async textChange(e) {
		const acro = e.target.name;
		const value = e.target.value;

		this.props.setNoDefsMap({ [acro]: value });
	}
	render() {
		const noDefs = this.props.noDefs;
		const noDefsMap = this.props.noDefsMap;

		if (noDefs.length > 0) {
			const renderedAcros = noDefs.map((acro, i) => (
					<div className="form-row" key={`outerdiv-${i}`}>
						<div className="form-group col-2 form-inline mb-1" key={'checkgroup-' + i}>
							<div className="form-check" key={'formcheck-' + i}>
								<input key={'checkbox-' + i}
								       className="form-check-input"
								       name={acro}
								       type="checkbox"
								       value=""
								       onChange={this.checkChange}
								       checked
								       id={'checkbox-' + i} />
								<label className="form-check-label" htmlFor={i}>{acro}</label>
							</div>
						</div>
						<div className="form-group col-8 mb-1 ml-5" key={'textgroup-' + i}>
							<input key={'text-' + i}
							       type="text" className="form-control"
							       value={noDefsMap[acro] || ''}
							       name={acro}
							       onChange={this.textChange} />
						</div>
						<div className="clearfix" />
					</div>
				)
			);
			return (
				<form id="promptDefs" onSubmit={e => e.preventDefault()}>
					{renderedAcros}
				</form>
			);
		} else {
			return (
				<form className="text-center" id="promptDefs">
					No acronyms, press "Submit" to continue.
				</form>
			);
		}
	}
}
const mapState = ({ home: { autoAcro: { noDefs, noDefsMap } } }) => ({ noDefs, noDefsMap });
const mapDispatch = { setNoDefs, setNoDefsMap };

export default connect(mapState, mapDispatch)(AddDefs);
