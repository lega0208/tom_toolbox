import React from 'react';
import { connect } from 'react-redux';
import { Button } from 'components/bsComponents';
import { ModalContent } from 'components/ModalComponent';
import { triggerHideModal } from 'actions/home';

const Preview = ({ content, triggerHideModal }) => {
	const CloseButton = () => <Button bsClass="danger" click={triggerHideModal} text="Close" />;
	const PreviewScreen = () => <div dangerouslySetInnerHTML={{__html: content || ''}} />;

	return (
		<ModalContent modalTitle="HTML Preview"
		              cancelButton={<CloseButton />}
		              modalClasses="modal-lg"
		>
			<PreviewScreen />
		</ModalContent>
	);
};

const mapState = ({ home: { textBox: { content } } }) => ({ content });
const mapDispatch = { triggerHideModal };

export default connect(mapState, mapDispatch)(Preview);