// @flow
import React            from 'react';
import { connect }      from 'react-redux';
import { Button }       from 'components/bsComponents';
import { ModalContent } from 'components/ModalComponent';
import AcroList         from './AcroList';
import AddDefs          from './AddDefs';
import ChooseDups       from './ChooseDups';
import {
	cancelAutoAcro,
	submitAcroList,
	submitAddDefs,
	submitChooseDups,
} from 'actions/home';

const SubmitButton = (props) => (
	<Button text="Submit" bsClass="success" click={() => props.submit(props.submitAction)} />
);
const CancelButton = (props) => (
	<Button text="Cancel" bsClass="danger" click={props.cancel} />
);

const AutoAcroSubmitButton = connect(undefined, (dispatch) => ({
	submit: (submitAction) => dispatch(submitAction),
}))(SubmitButton);
const AutoAcroCancelButton = connect(undefined, { cancel: cancelAutoAcro })(CancelButton);

const AutoAcroScreen = ({ modalTitle, submitAction, children }) => (
	<ModalContent modalTitle={modalTitle}
	              submitButton={<AutoAcroSubmitButton submitAction={submitAction} />}
	              cancelButton={<AutoAcroCancelButton />}
	>
		{children}
	</ModalContent>
);

const AcroListScreen = () => (
	<AutoAcroScreen modalTitle="Select acronyms to replace:"
	                submitAction={submitAcroList()}
	>
		<AcroList />
	</AutoAcroScreen>
);
const AddDefsScreen = () => (
	<AutoAcroScreen modalTitle="No definitions found for the following acronyms, add definition or uncheck :"
	                submitAction={submitAddDefs()}
	>
		<AddDefs />
	</AutoAcroScreen>
);
const ChooseDupsScreen = () => (
	<AutoAcroScreen modalTitle="Multiple definitions found, please choose which to use:"
	                submitAction={submitChooseDups()}
	>
		<ChooseDups />
	</AutoAcroScreen>
);

function AutoAcroModal({ screen }) {
	let renderedScreen;

	switch (screen) {
		case 'acroList':
			renderedScreen = <AcroListScreen />;
			break;
		case 'addDefs':
			renderedScreen = <AddDefsScreen />;
			break;
		case 'chooseDups':
			renderedScreen = <ChooseDupsScreen />;
			break;
		default:
			renderedScreen = <div className="text-danger">Error</div>;
	}

	return (
		<React.Fragment>
			{renderedScreen}
		</React.Fragment>
	);
}
const mapState = ({ home: { modal: { screen } } }) => ({ screen });

export default connect(mapState)(AutoAcroModal);