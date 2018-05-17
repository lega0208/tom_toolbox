import React from 'react';

const generalReferences = [
	{
		label: 'WET 2 to 4 CSS crosswalk',
		url: 'http://infozone/english/r1713497/org/sa/sa06/sb/sb01/tlr/tlr06/wet2-wet4-e.html'
	},
	{
		label: 'Canada.ca Content Style Guide',
		url: 'https://www.canada.ca/en/treasury-board-secretariat/services/government-communications/canada-content-style-guide.html'
	},
];
const wet2References = [
	{
		label: 'Intranet style guide',
		url: 'http://infozone/english/r1713497/org/sa/sa06/sb/sb01/tlr/cnt2/index-e.html'
	}
];
const wet4References = [
	{
		label: 'WET 4 components & classes',
		url: 'http://infozone/english/r1713497/org/sa/sa06/sb/sb01/tlr/tlr06/index-e.html#cmpnnts'
	}
];

export default function Sidebar({ navigate }) {
	return (
		<div>
			<ButtonGroup title="General References" buttons={generalReferences} navigate={navigate} />
			<ButtonGroup title="WET2 References" buttons={wet2References} navigate={navigate} />
			<ButtonGroup title="WET4 References" buttons={wet4References} navigate={navigate} />
		</div>
	);
}

function ButtonGroup({ buttons, title, navigate }) {
	return (
		<div className="card mb-1">
			<h6 className="card-header p-2">{title}</h6>
			<div className="list-group">
				{
					buttons.map(({ label, url }, i) => (
						<MenuButton label={label} url={url} navigate={navigate} key={title + i} />
					))
				}
			</div>
		</div>
	);
}

function MenuButton({ label, url, navigate }) {
	return <a href="#" className="list-group-item list-group-item-action p-2" onClick={(e) => navigate(url, e)}>{label}</a>
}