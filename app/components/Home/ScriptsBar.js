import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheckSquare from '@fortawesome/fontawesome-free-solid/faCheckSquare';
import faSquare from '@fortawesome/fontawesome-free-regular/faSquare';
import {
	toggleWET,
	toggleAutoAcro,
	toggleSpecChars,
	toggleSupNbsp,
} from '../../actions/home';

export default function ScriptsBar(props) {
	const { dispatch } = props;
	const {
		autoAcro,
		specChars,
		supNbsp,
	} = props.state;
	const btnClasses = (optionName) => 'btn btn-sm btn-outline-primary' + (props.state[optionName] ? ' active' : '');
	return (
		<div className="col-2 px-0">
			<div className="card">
				<h6 className="card-header p-2">Scripts</h6>
				<div className="card-body p-2">
					<div className="btn-group btn-group-sm btn-group-vertical">
						<button className={btnClasses('autoAcro')} onClick={() => dispatch(toggleAutoAcro())}>
							<span className="nowrap">Acronyms <Checkbox option={autoAcro} /></span>
						</button>
						<button className={btnClasses('specChars')} onClick={() => dispatch(toggleSpecChars())}>
							Special <span className="nowrap">characters <Checkbox option={specChars} /></span>
						</button>
						<button className={btnClasses('supNbsp')} onClick={() => dispatch(toggleSupNbsp())}>
							Superscript and <span className="nowrap">nbsp <Checkbox option={supNbsp} /></span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

const Checkbox = (props) => <FontAwesomeIcon icon={props.option ? faCheckSquare : faSquare} />;