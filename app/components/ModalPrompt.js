import React, { Component } from 'react';

export default class ModalPrompt extends Component {
  render() {
    return (
      <div className="modal" id={this.props.modalId} ref={this.props.modalRef}>
        <div className="modal-dialog h-100 d-flex flex-column justify-content-center my-0" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.props.modalTitle || 'Are you sure?'}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
						<div className="modal-body">{this.props.children}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-success" data-dismiss="modal" onClick={this.props.submit}>{this.props.submitText}</button>
              <button type="button" className="btn btn-danger" data-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
