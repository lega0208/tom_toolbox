import React from 'react';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheckSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare';
import faSquare from '@fortawesome/fontawesome-free-regular/faSquare';
import { toggleAutoAcro, toggleSpecChars, toggleSupNbsp, toggleImages } from 'actions/home';

// todo: remove dispatch, connect component & implement mapDispatchToProps +++ action creators
function ScriptsBar(props) {
	const {
		autoAcro,
		toggleAutoAcro,
		specChars,
		toggleSpecChars,
		supNbsp,
		toggleSupNbsp,
		images,
		toggleImages,
	} = props;

	const ScriptButton = ({ toggleFunc, text, optionProp }) => {
		const isActive = optionProp ? ' active' : '';
		const btnClasses = 'btn btn-sm btn-outline-primary px-0 ml-0 border-dark' + isActive;

		const Checkbox =
			() => <FontAwesomeIcon className="align-middle" icon={optionProp ? faCheckSquare : faSquare} />;

		return (
			<button className={btnClasses} onClick={toggleFunc}>
				<div className="row mx-0">
					<div className="col-2 align-self-start pr-0 pl-1">
						<Checkbox option={optionProp} />
					</div>
					<div className="col-10 align-self-end text-left pl-1">
						{` ${text}`}
					</div>
				</div>
			</button>
		);
	};

	return (
		<div className="card border-secondary">
			<h6 className="card-header text-center border-secondary">Scripts</h6>
			<div className="card-body p-2">
				<div className="btn-group btn-group-sm btn-group-vertical d-flex">
					<ScriptButton text="Acronyms" toggleFunc={toggleAutoAcro} optionProp={autoAcro} />
					<ScriptButton text="Special characters" toggleFunc={toggleSpecChars} optionProp={specChars} />
					<ScriptButton text="Superscript and nbsp" toggleFunc={toggleSupNbsp} optionProp={supNbsp} />
					<ScriptButton text="Images" toggleFunc={toggleImages} optionProp={images} />
				</div>
			</div>
		</div>
	);
}

const mapState = ({
	home: {
		options: {
			scripts: {
				autoAcro,
				specChars,
				supNbsp,
				images,
			}
		}
	}
}) => ({
	autoAcro,
	specChars,
	supNbsp,
	images,
});
const mapDispatch = {
	toggleAutoAcro,
	toggleSpecChars,
	toggleSupNbsp,
	toggleImages
};

export default connect(mapState, mapDispatch)(ScriptsBar);