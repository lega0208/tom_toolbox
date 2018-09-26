// @flow
import React from 'react';
import { connect } from 'react-redux';
import { ModalRoot, ModalContent } from 'components/ModalComponent';
import AutoAcro from './AutoAcro';
import Images from './Images'
import Preview from './Preview';

function HomeModal({ display }) {
	// All modals are added to the displays object
	const defaultDisplay = (
		<ModalContent modalTitle="Default title"
		              submitButton={<button>submit</button>}
		              cancelButton={<button>submit</button>}
		>
			<div>Default modal</div>
		</ModalContent>
	);
	const displays = {
		autoAcro: <AutoAcro />,
		images: <Images />,
		preview: <Preview />,
	};

	return (
		<ModalRoot>
			{
				displays[display] ? displays[display] : defaultDisplay
			}
		</ModalRoot>
	);
}

const mapStateToProps =
	({ home: { modal: { display } } }) => ({ display });

export default connect(mapStateToProps)(HomeModal);
