
import React from 'react';
import { setNoDefs } from 'actions/home/autoAcro';

export default class AddDefs extends React.Component {
	constructor(props) {
		super(props);
		if (Array.isArray(this.props.noDefs) && this.props.noDefs.length > 0) {
			const noDefsMap = {};
			this.props.noDefs.forEach(noDef => noDefsMap[noDef] = '');
			this.state = noDefsMap;
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
			this.props.dispatch(setNoDefs(noDefsProxy));
		} else {
			await this.props.dispatch(setNoDefs(noDefsProxy.filter(item => item !== name)));
		}
	}
	async textChange(e) {
		const acro = e.target.name;
		const value = e.target.value;

		await this.setState({ [acro]: value });
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps !== this.props) {
			this.props = nextProps;
			if (Array.isArray(this.props.noDefs) && this.props.noDefs.length > 0) {
				const noDefsMap = {};
				this.props.noDefs.forEach(noDef => noDefsMap[noDef] = '');
				this.setState({noDefsMap})
			}
		}
	}
	render() {
		const noDefs = this.props.noDefs || [];
		const noDefsMap = this.state;

		if (noDefs.length > 0) {
			const renderedAcros = noDefs.map((acro, i) => (
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
							{acro}
						</label>
					</div>
					<input key={'text-' + i} type="text" className="form-control w-75" value={noDefsMap[acro]} name={acro} onChange={this.textChange} />
				</div>)
			);
			return (
				<form onSubmit={(e) => this.props.submit(e, wrapWithAbbr(noDefsMap))} id="promptDefs">
					{renderedAcros}
				</form>
			);
		} else {
			return (<form className="text-center" onSubmit={this.props.submit} id="promptDefs">No acronyms, press "Submit" to continue.</form>);
		}
	}
}
// todo: add parallelInsert?

function wrapWithAbbr(noDefsMap){
	return Object.entries(noDefsMap).reduce((wrappedMap, [k, v]) => {
		wrappedMap[k] = `<abbr title="${v}">${k}</abbr>`;
		return wrappedMap;
	}, {});
}
