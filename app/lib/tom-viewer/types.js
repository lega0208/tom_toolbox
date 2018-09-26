
type linkType = {
	text: string,
	href: string,
};

type tocNodeType = {
	text: string,
	href: string,
	children?: ?Array<tocNodeType>,
};

type metadataType = {
	isHomepage: ?string,
	manualdId: string,
	manualName: string,
	description: string,
	keywords: string,
	creator: string,
	publisher: string,
	issueDate: string,
	modifiedDate: string,
};

type navType = {
	prevPage?: string,
	homePage: string,
	nextPage?: string,
};

export type tomDataType = {
	title: string,
	filename: string,
	lang: string,
	wetVersion: number,
	metadata: metadataType,
	langLink: string,
	breadcrumbs: Array<linkType>,
	nav?: ?navType,
	toc?: ?Array<tocNodeType>,
	secMenu: Array<linkType>,
};