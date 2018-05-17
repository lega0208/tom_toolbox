import React from 'react';
import { NavLink } from 'react-router-dom';

function NavItem(props) {
	const {
		link,
		text,
		exact
	} = props;

	return (
		<li className="nav-item">
			<NavLink to={link} className="nav-link btn btn-secondary" exact={exact}>{text}</NavLink>
		</li>
	);
}

export default function NavLinks({ links }) {
	const renderedLinks =
		links.map(({
			link,
			text,
			exact
		}) => (
			<NavItem
				link={link}
				text={text}
				key={link}
				exact={exact} />));

	return (
		<ul className="navbar-nav mr-auto">
			{renderedLinks}
		</ul>
	)
}