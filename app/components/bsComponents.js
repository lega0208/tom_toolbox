import React from 'react';

export function Button(props) {
	return (
		<button type="button" className={`btn btn-${props.bsClass || 'default'}`} onClick={props.click}>
			{props.text}
		</button>
	);
}