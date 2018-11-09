// @flow
import React from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faChevronRight from '@fortawesome/fontawesome-free-solid/faChevronRight';

/*
 * Grid utilities
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export const Grid = ({ fluid = false, children, xClass }) => (
	<div className={`container${fluid ? '-fluid' : ''}${xClass ? ` ${xClass}` : ''}`}>
		{children}
	</div>
);

export const Row = ({ xClass, children }) => (
	<div className={`row${xClass ? ` ${xClass}` : ''}`}>
		{children}
	</div>
);

type colValsType =
	1|2|3|4|5|6|7|8|9|10|11|12|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'11'|'12';

type colPropsType = {
	col?: colValsType,
	xs?: colValsType,
	sm?: colValsType,
	md?: colValsType,
	lg?: colValsType,
	xl?: colValsType,
	xClass?: string,
	children?: any,
};
export const Col = (props: colPropsType) => {
	const makeClassProp =
		(propName) => props[propName]
			? `${propName !== 'col' ? `col-${propName}-${props[propName]}` : `col-${props[propName]}`}`
			: '';

	const propStrings = [ 'col', 'xs', 'sm', 'md', 'lg', 'xl' ];

	const classString = propStrings.reduce((acc, propName, i) => {
		const isLast = i === propStrings.length - 1;
		const classProp = makeClassProp(propName);
		return acc + classProp + (isLast || !classProp ? '' : ' '); // todo: fix extra space bug
	}, '');

	return (
		<div className={`${classString}${props.xClass ? ` ${props.xClass}` : ''}`}>
			{props.children}
		</div>
	);
};

/*
 * Components
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export const Button = (props) => (
	<button
		type="button"
		className={`btn btn-${props.bsClass || 'default'}${props.xClass ? ` ${props.xClass}` : ''}`}
		onClick={props.click}
	>
		{props.text}
	</button>
);

export const ListGroup = (props) => <ul className="list-group">{props.children}</ul>;
export const ListGroupItem = (props) => (
	<li className={`list-group-item${props.xClass ? ` ${ props.xClass }` : ''}`}>
		{props.children}
	</li>
);

export const Card = ({ header, children, xClass }) => (
	<div className={`card${xClass ? ` ${xClass}` : ''}`}>
		{header ? <h3 className="card-header">{header}</h3> : null}
		<div className="card-body">
			{children}
		</div>
	</div>
);

export class Collapse extends React.Component {
	constructor(props) {
		super(props);
		this.state = { show: false };
	}
	render() {
		return (
			<div className={`card${this.props.xClass ? ` ${this.props.xClass}` : ''}`}>
				{this.props.header
					? (
						<h5 className="card-header"
						    onClick={() => this.setState({ show: !this.state.show })}
						    style={{cursor: 'pointer'}}
						>
							<FontAwesomeIcon className="text-secondary" icon={faChevronRight} { ...{rotation: this.state.show ? 90 : null} } />{` `}&nbsp;
							{this.props.header}
						</h5>
					)
					: null}
				<div className={`collapse${this.state.show ? ' show' : ''}`}>
					<div className="card-body">
						{this.props.children}
					</div>
				</div>
			</div>
		);
	}
}


export const Dropdown = ({ items, click, label, xClass }) => {
	const onClickFunc = (e) => {
		e.preventDefault();
		click(e.target.innerText);
	};

	return (
		<div className={'dropdown' + (xClass ? ` ${xClass}` : '')}>
			<button id="dropdown-toggle"
			        type="button"
			        className="btn btn-default dropdown-toggle w-100"
			        data-toggle="dropdown"
			        data-offset="0"
			>
				{label}
			</button>

			<div className="dropdown-menu dropdown-menu-right" style={{maxHeight: '70vh', overflowY: 'scroll'}}>
				{
					items && items.length > 0
						? items.map((item, i) => (
							<a href="#" className="dropdown-item" onClick={onClickFunc} key={`dropdown-item-${i}`}>{item}</a>
						))
						: null
				}
			</div>
		</div>
	);
};

/*
 * Misc utilities
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
export const Clear = () => <div className="clearfix" />;