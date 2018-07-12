import React, { Component } from 'react';
import { connect } from 'react-redux';
import { clipboard } from 'electron';
import {
	submitAcros,
	submitDups,
	hideModal,
	submitNoDefs,
} from '../../../actions/home/autoAcro';
import Display from "./Display"

class FindAcronyms extends Component {
  constructor(props) {
    super(props);
		this.bindAll();
  }
	getSubmit() {
  	switch (this.props.display) {
			case 'acroList': return this.submitAcros;
			case 'chooseAcros': return this.submitDups;
			case 'promptDefs': return this.submitNoDefs;
		}
	}
	submitAcros(e) {
  	this.props.dispatch(submitAcros(this.props.acros));
		e ? e.preventDefault() : null;
	}
	submitDups(e) {
		this.props.dispatch(submitDups());
		e ? e.preventDefault() : null;
	}
	submitNoDefs(e, defsMap) {
  	this.props.dispatch(submitNoDefs(defsMap));
		e ? e.preventDefault() : null;
	}
	hideModal() {
		this.props.dispatch(hideModal());
		clipboard.writeText(this.props.clipboard); // todo: random bug when pasting results back into converter
	}


	// componentDidUpdate(newProps) {
  	// console.log(`newProps.show:\n${newProps.show}`);
  	// if (newProps.show) {
  	// 	newProps.configListeners('remove');
	// 	} else if (!newProps.show) {
	// 		newProps.configListeners('add');
	// 	}
	// }

  render() {
		let findAcrosTitle;
		switch (this.props.display) {
			case 'acroList': findAcrosTitle = 'Select acronyms to replace:'; break;
			case 'promptDefs': findAcrosTitle = 'No definitions found for the following acronyms, add definition or uncheck :'; break;
			case 'chooseAcros': findAcrosTitle = 'Multiple definitions found, please choose which to use:'; break;
			default: findAcrosTitle = 'Select acronyms to replace:';
		}

    return (
      <Modal modalId={this.props.modalId}
						 modalTitle={findAcrosTitle}
						 hideModal={this.hideModal}
						 submitType={this.props.display !== 'chooseAcros' ? 'submit' : null}
						 submitClick={this.props.display === 'chooseAcros' ? this.getSubmit() : null}
						 display={this.props.display}>
				<Display display={this.props.display}
								 acros={this.props.acros}
								 submit={this.getSubmit()} />
			</Modal>
    )
  }

  bindAll() {
		this.getSubmit = this.getSubmit.bind(this);
		this.submitAcros = this.submitAcros.bind(this);
		this.submitNoDefs = this.submitNoDefs.bind(this);
		this.submitDups = this.submitDups.bind(this);
		this.hideModal = this.hideModal.bind(this);
	}
}

const mapStateToProps = ({ autoAcro }) => ({
	acros: autoAcro.acros,
	display: autoAcro.display,
	noDefs: autoAcro.noDefs,
	show: autoAcro.show,
});
export default connect(mapStateToProps)(FindAcronyms);

const Modal = (props) => (
	<div className="modal" id={props.modalId}>
		<div className="modal-dialog h-100 d-flex flex-column justify-content-center my-0" role="document">
			<div className="modal-content">
				<div className="modal-header">
					<h5 className="modal-title">{props.modalTitle || 'Modal title'}</h5>
					<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={props.hideModal}>
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div className="modal-body">
					{props.children}
				</div>
				<div className="modal-footer">
					<button type={props.submitType}
									onClick={props.submitClick}
									form={props.display}
									className="btn btn-primary">Submit</button>
					<button type="button"
									data-dismiss="modal"
									className="btn btn-danger"
									onClick={props.hideModal}>Cancel</button>
				</div>
			</div>
		</div>
	</div>
);