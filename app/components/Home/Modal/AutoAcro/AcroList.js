import React from 'react';
import { connect } from 'react-redux';
import { setAcros } from 'actions/home/autoAcro';

class AcroList extends React.Component {
	constructor(props) {
		super(props);
		this.checkChange = this.checkChange.bind(this);
		this.textChange = this.textChange.bind(this);
	}
	async checkChange(e) {
		const checked = e.target.checked;
		const index = e.target.value;
		const name = e.target.name;
		const acrosProxy = this.props.acros;

		if (checked) {
			acrosProxy[index] = name;
			this.props.setAcros(acrosProxy);
		} else {
			await this.props.setAcros(acrosProxy.filter(item => item !== name));
		}
	}
	async textChange(e) {
		const index = e.target.name;
		const value = e.target.value;
		const acrosProxy = [...this.props.acros];

		acrosProxy[index] = value;
		await this.props.setAcros(acrosProxy);
	}
	render() {
		if (this.props.acros.length > 0) {
			const renderedAcros = this.props.acros.map((acro, i) => (
				<div className="form-group form-inline mb-1" key={'wrapper-' + i}>
					<div className="form-check form-check-inline" key={'formcheck-' + i}>
						<label className="form-check-label">
							<input key={'checkbox-' + i}
							       className="form-check-input position-static"
							       name={acro}
							       type="checkbox"
							       value={i}
							       onChange={this.checkChange}
							       checked />
						</label>
					</div>
					<input key={'text-' + i} type="text" className="form-control w-25" value={acro} name={i} onChange={this.textChange} />
				</div>)
			);
			return (
				<form id="acroList">
					{renderedAcros}
				</form>
			);
		} else {
			return (<form className="text-center" id="acroList">No Acronyms found</form>);
		}
	}
}

const mapState = ({ home: { autoAcro: { acros } } }) => ({ acros });
const mapDispatch = { setAcros };

export default connect(mapState, mapDispatch)(AcroList);