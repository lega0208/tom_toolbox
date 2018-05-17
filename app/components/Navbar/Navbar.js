import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import NavLinks from './NavLinks';

const Navbar = withRouter(props => <MyNavbar {...props}/>);
export default Navbar;

function MyNavbar() {
	const links = [
		{link: '/', text: 'Word to HTML', exact: true},
		{link: '/references', text: 'References'},
	];

	return (
		<nav className="navbar navbar-dark bg-secondary navbar-expand navbar-fixed-top">
			<Link className="navbar-brand" to="/">TOM Toolbox</Link>
			<NavLinks links={links} />
		</nav>
	);
}
