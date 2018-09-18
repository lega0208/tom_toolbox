import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheckSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare';
import faSquare from '@fortawesome/fontawesome-free-regular/faSquare';

// todo: remove dispatch, connect component & implement mapDispatchToProps +++ action creators
export default function ScriptsBar(props) {
	const { dispatch } = props;
	const { autoAcro, specChars, supNbsp, images } = props.opts;
	const btnClasses = (optionName) =>
		`btn btn-sm btn-outline-primary px-0 border-dark${(props.opts[optionName] ? ' active' : '')}`;

	const Checkbox = (props) => <FontAwesomeIcon className="align-middle" icon={props.option ? faCheckSquare : faSquare} />;

	const ScriptButton = ({ scriptName, text, optionProp }) => (
		<button className={btnClasses(scriptName)}
		        onClick={() => dispatch({ type: `TOGGLE_${scriptName.toUpperCase()}` })}
		>
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

	return (
		<div className="col-3 pl-1">
			<div className="card border-secondary">
				<h6 className="card-header text-center border-secondary">Scripts</h6>
				<div className="card-body p-2">
					<div className="btn-group btn-group-sm btn-group-vertical d-flex">
						<ScriptButton text="Acronyms" scriptName="autoAcro" optionProp={autoAcro} />
						<ScriptButton text="Special characters" scriptName="specChars" optionProp={specChars} />
						<ScriptButton text="Superscript and nbsp" scriptName="supNbsp" optionProp={supNbsp} />
						<ScriptButton text="Images" scriptName="images" optionProp={images} />
					</div>
				</div>
			</div>
		</div>
	);
}
