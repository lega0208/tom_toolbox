import React from 'react';
import { Grid, Row } from 'components/bsComponents';

export default function BottomButtonRow({ initConverter, showPreview }) {
	const Wrapper = (props) => (
		<Grid fluid xClass="px-0">
			<Row xClass="mx-0">
				{props.children}
			</Row>
		</Grid>
	);

	const ConvertButton = () => (
		<button className="btn btn-primary col-7 col-md-8"
		        onClick={initConverter}>
			<span className="h6">Convert list</span>
		</button>
	);

	const PreviewButton = () => (
		<button type="button" className="btn btn-success col-5 col-md-4" onClick={showPreview}>
			<span className="h6">Show HTML preview</span>
		</button>
	);

	return (
		<Wrapper>
			<ConvertButton />
			<PreviewButton />
		</Wrapper>
	);
}