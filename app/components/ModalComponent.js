import React from 'react';

export const ModalRoot = ({ children }) => <div className="modal" id='modal'>{children}</div>;
const ModalWrapper = (props) => {
	const baseClasses = 'modal-dialog h-100 d-flex flex-column justify-content-center my-0 ';
	const modalClasses = baseClasses + (props.modalClasses ? props.modalClasses : '');
	return (
		<div className={modalClasses} role="document">
			<div className="modal-content">
				{props.children}
			</div>
		</div>
	);
};
const ModalHeader = ({ modalTitle }) => (
	<div className="modal-header">
		<h5 className="modal-title">{modalTitle}</h5>
		<button type="button" className="close" aria-label="Close" data-dismiss="modal">
			<span aria-hidden="true">&times;</span>
		</button>
	</div>
);
const ModalBody = (props) => <div className="modal-body" style={{overflowY: 'scroll'}}>{props.children}</div>;
const ModalFooter = ({ submitButton, cancelButton }) => (
	<div className="modal-footer">
		{submitButton || null}
		{cancelButton}
	</div>
);

export const ModalContent = (props) => (
	<ModalWrapper modalClasses={props.modalClasses}>
		<ModalHeader modalTitle={props.modalTitle} />
		<ModalBody>
			{props.children}
		</ModalBody>
		<ModalFooter submitButton={props.submitButton} cancelButton={props.cancelButton}/>
	</ModalWrapper>
);

export default function ModalComponent(props) {
	return (
		<ModalRoot>
			<ModalWrapper modalClasses={props.modalClasses}>
				<ModalHeader modalTitle={props.modalTitle} />
				<ModalBody>
					{props.children}
				</ModalBody>
				<ModalFooter submitButton={props.submitButton} cancelButton={props.cancelButton}/>
			</ModalWrapper>
		</ModalRoot>
	);
}