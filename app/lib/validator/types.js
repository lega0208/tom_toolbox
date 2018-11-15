// @flow
export type TOMData = {
	tomName: string,
	homePage: string, // without -[ef].html
	secMenu: {
		e: Array<Child>,
		f: Array<Child>,
	},
	files: { [FilePath]: FileData },
}
type FilePath = string;

type Nav = {
	prevPage?: string,
	homePage: string,
	nextPage?: string,
};

type ToCItem = { href: string, text: string };
type ToCLevel = Array<ToCItem>;

type Header = {
	tag: string,
	text: string,
	id?: string,
};

type Child = {
	text: string,
	href: string,
}

export type FileData = {
	path: string,
	depth: number, // basically how many parents they have, will be used to prioritize updates because they can cascade
	lastUpdated: number,
	isLanding: boolean,
	isHomepage?: boolean,
	title: {
		titleTag: string,
		metadata: string,
		h1: string,
	},
	date: {
		top: ?string,
		bottom: ?string,
	},
	langLink: string,
	breadcrumbs: {
		expected: Array<string>,
		actual?: Array<string>,
	},
	secMenu?: Array<Child>,
	nav?: {
		top: ?Nav,
		bottom: ?Nav,
	},
	toc?: Array<ToCLevel>,
	headers?: Array<Header>,
	parent?: ?string,
	children?: ?Array<Child> | ?{ [string]: FileData },
}

export type ValidationError = { message: string, [additionalMessage: string]: string };
export type ValidationResult = { title: string, errors: ?Array<ValidationError> }
export type PageResults = { [path: string]: Array<ValidationResult> };
export type TOMResults = Array<PageResults>;

export type ValidationFunction = (fileData: FileData) => Promise<?ValidationResult>;

export interface ProgressTracking {
	progress: number;

	incrementProgress(): void;
	getProgress(): number;
	resetProgress(): void
}

export interface ValidatorInterface {
	validations: Array<ValidationFunction>;

	validatePage(): Promise<PageResults>;
	validateTOM(): Promise<TOMResults>;
	performValidations(): Promise<Array<ValidationResult>>
}