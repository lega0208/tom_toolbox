import React from 'react';
import { connect } from 'react-redux';
import { Col, Collapse, Grid, Row, Card, ListGroup, ListGroupItem } from 'components/bsComponents';

const StringData = ({ label, value }) => (
	<div className="input-group">
		<label className="w-100">
			{ label }
			<input className="form-control" value={value || ''} onChange={() => 0} />
		</label>
	</div>
);

const StringDataList = ({ dataMap, title = {} }) => (
	<React.Fragment>
		{Object.entries(dataMap).map(([ title, value ], i) =>
			<StringData label={title} value={value} key={`StringDataList-${i}`} />
		)}
	</React.Fragment>
);


function ObjectDataList({ dataMap }) {
	const ObjectData = ({ title, object = {} }) => (
		<Collapse header={title} xClass="mt-2">
			{Object.entries(object)
				.map(([ key, value ], i) =>
					<StringData label={key} value={value} key={i} />
				)}
		</Collapse>
	);

	return (
		<React.Fragment>
			{Object.entries(dataMap).map(([ title, object ], i) =>
				<ObjectData title={title} object={object} key={`objectdata-${i}`} />
			)}
		</React.Fragment>
	);
}

function LinkDataList({ dataMap }) {
	const LinkList = ({ links }) => (
		<ListGroup>
			{links.map(({ text, href }, i) => (
				<ListGroupItem key={`linkList-group-${i}`} xClass="bg-light">
					<StringData label="Text:" value={text} key={`linkList-text-${i}`} />
					<StringData label="Href:" value={href} key={`linkList-href-${i}`} />
				</ListGroupItem>
			))}
		</ListGroup>
	);

	return (
		<React.Fragment>
			{Object.entries(dataMap).map(([ title, links ], i) => (
				<Collapse key={`linkList-card-${i}`} header={title} xClass="mt-2">
					<LinkList links={links} key={`linkList-${i}`} />
				</Collapse>
			))}
		</React.Fragment>
	);
}

function TocData({ toc }) {
	const TocLevel = ({ nodeList }) => (
		<React.Fragment>
			{nodeList.map((tocNode, i) => (
				<ul key={`tocData-ul-${i}`}>
					<TocNode tocNode={tocNode} key={`tocData-node-${i}`} i={i} />
				</ul>
			))}
		</React.Fragment>
	);

	const TocNode = ({ tocNode, i }) => (
		<li key={`tocNode-li-${i}`}>
			<a href={`#/${tocNode.href}`} key={`tocNode-anchor-${i}`} onClick={e => e.preventDefault()}>{tocNode.text}</a>
			{tocNode.children && tocNode.children.length
				? <TocLevel nodeList={tocNode.children} key={`tocLevel-${i}`} />
				: null}
		</li>
	);

	return (
		<Card header="Table of Contents" xClass="mt-2">
			<ul>
				{toc.map((tocNode, i) => <TocNode key={`tocNode-${i}`} tocNode={tocNode} />)}
			</ul>
		</Card>
	);
}

const DataView = ({ data, error, selectedPage }) => {
	const {
		title,
		filename,
		langLink,
		lang,
		wetVersion,
		metadata,
		breadcrumbs,
		nav,
		toc,
		secMenu,
	} = data;

	const simpleData = {
		'Title': title,
		'Filename': filename,
		'Other language link': langLink,
		'Language': lang,
		'WET Version': wetVersion,
	};

	const objectData = {
		'Metadata': metadata,
		'Navigation': nav,
	};

	const linkListData = {
		'Breadcrumbs': breadcrumbs,
		'Section Menu': secMenu,
	};

	return (
		<Grid fluid>
			<Row>
				<Col col={12}>
					<Card xClass="mt-2 mb-5" header={`Selected page: ${selectedPage ? selectedPage : 'None'}`}>
						{error ? <p className="text-danger">{error}</p> : null}
						{
							data ? (
								<React.Fragment>
									<StringDataList dataMap={simpleData} />
									<ObjectDataList dataMap={objectData} />
									<LinkDataList dataMap={linkListData} />
									<TocData toc={toc} />
								</React.Fragment>
							) : null
						}
					</Card>
				</Col>
			</Row>
		</Grid>
	);
};

const mapState = ({ tomViewer: { data, error, selectedPage } }) => ({ data, error, selectedPage });
export default connect(mapState)(DataView);