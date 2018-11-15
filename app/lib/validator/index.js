// @flow
import { readFile, readJSON, pathExists } from 'fs-extra';
import { getNav, wrapContent } from './util';
import {
	checkTitle,
	checkDate,
	checkLangLink,
	checkBreadcrumbs,
	checkSecMenu,
	checkChildren,
	checkHeaders,
	checkNavs,
} from './validation-checks';

// should probably be part of Validator
export const performValidations = async (pageData, validator) => {
	const { $, path, secMenu, isLanding, breadcrumbs } = pageData;
	const validationChecks = { // basic validations
		'Title': () => checkTitle($),
		'Date': () => checkDate($, path),
		'Language link': () => checkLangLink($, path),
		'Section menu': () => checkSecMenu($, secMenu, path),
		'Breadcrumbs': () => checkBreadcrumbs($, breadcrumbs, path),
		'Headers': () => checkHeaders($, path),
		// 'Navs': () => checkNav($), // check navs (top/bottom are the same)
	};

	const validationResults: ValidationResults = {};

	for (const [ type, checkFunc ] of Object.entries(validationChecks)) {
		if (pageData.isHomepage && (type === 'Section menu' || type === 'Breadcrumbs' || type === 'Headers'))
			continue;

		const validationErrors: ValidationErrors|null = await checkFunc();

		if (validationErrors) {
			validationResults[type] = validationErrors;
		}
	}

	if (isLanding) {
		const childErrors = validator.getChildErrors(path);

		if (childErrors && childErrors.length > 0) {
			validationResults['Links'] = childErrors.map((error) => ({ message: error }));
		}
	}

	// complex validations (next/prev)

	// commit results to validation instance
	validator.addValidationResults(path, validationResults);
	validator.incrementProgress();
};

export default async function validateTOM(validator) {

}

//// should probably be part of Validator
//async function recurseChildren(path, validator, breadcrumbs) {
//	// get page data from cache or parsing
//	const pageData = await validator.getOrParse(path);
//
//	// get other data needed for validation & add to data object -- add this to cache later?
//	// isLanding, nav, breadcrumbs, something else? (children? would be useful to cache for
//	//  further optimization, but is it necessary?)
//	const isLanding = validator.landingPages.includes(pageData.path);
//
//	const nav = await getNav(pageData.$);
//
//	const validationData = {
//		...pageData,
//		isLanding,
//		nav,
//		breadcrumbs,
//		secMenu: validator.tomDeps.secMenu,
//		// homepage?
//	};
//
//	validator.addData(pageData.path, validationData);
//	validator.incrementProgress();
//
//	if (isLanding) {
//		const children = await validator.getChildren(pageData.$, pageData.path);
//		const childErrors = [];
//
//		for (const child of children) {
//			if (await pathExists(child)) {
//				try {
//					await recurseChildren(child, validator, breadcrumbs);
//				} catch (e) {
//					const errMsg =
//						`"${child.replace(`${validator.dirPath}\\`, '')}" is a valid path but another error occurred:`;
//					console.error(errMsg);
//					console.error(e);
//					childErrors.push(errMsg);
//				}
//			} else {
//				childErrors.push(`Link "${child.replace(`${validator.dirPath}\\`, '')}" is invalid.`)
//			}
//			await recurseChildren(child, validator, [ ...breadcrumbs, pageData.path ]); // maybe convert to Promise.all()
//		}
//		validator.addChildErrors(pageData.path, childErrors)
//	}
//}

//export default async function validateTOM(validator) {
//	console.log('about to get cached data:');
//	await validator.getCachedData();
//	console.log('Got cached data');
//
//	// populate data object for both languages
//	for (const homepage of validator.homepages) {
//		try {
//			console.log(`getOrParse:`);
//			const homeData = await validator.getOrParse(homepage);
//			const breadcrumbs = [ homepage ];
//
//			const childLinks = await validator.getChildren(homeData.$, homeData.path);
//
//			validator.setTOMDeps({
//				homepage,
//				secMenu: childLinks,
//			});
//
//			// add homepage data to object
//			const homeValidationData = {
//				...homeData,
//				isHomepage: true,
//			};
//			validator.addData(homepage, homeValidationData);
//			validator.incrementProgress();
//
//			const childErrors = [];
//
//			for (const child of childLinks) {
//				if (await pathExists(child)) {
//					try {
//						console.log(`recursing children`);
//						await recurseChildren(child, validator, breadcrumbs);
//					} catch (e) {
//						const errMsg =
//							`"${child.replace(`${validator.dirPath}\\`, '')}" is a valid path but another error occurred:`;
//						console.error(errMsg);
//						console.error(e);
//						childErrors.push(errMsg);
//					}
//				} else {
//					childErrors.push(`Link "${child.replace(`${validator.dirPath}\\`, '')}" is invalid.`)
//				}
//			}
//			validator.addChildErrors(homepage, childErrors);
//		} catch (e) {
//			console.error('errrrror?');
//			throw e;
//		}
//	}
//
//	// all pages have been parsed, so commit updates to cache
//	validator.commitCacheUpdates()
//		.then((linesAffected) => console.log(`Committed cache updates, ${linesAffected} lines affected.`))
//		.catch(e => console.error(e));
//
//
//	// iterate through data array & perform validations
//	for (const fileData of Object.values(validator.getData())) {
//		await performValidations(fileData, validator)
//	}
//
//	return {
//		tomResults: validator.getValidationResults(),
//		tomErrors: validator.getErrors(),
//	};
//}

//async function getPageDeps(filePath, landingPages, isHomepage = false) {
//	try {
//		const fileData = await readFile(filePath, 'utf8');
//		const pageContents = (await wrapContent(fileData, basename(filePath)) || fileData);
//		const $ = cheerio.load(pageContents, { decodeEntities: false });
//		const contentRef = $('div#__main-content');
//
//		const isLanding = isHomepage
//			? true
//			: landingPages.includes(filePath);
//			//: await checkIfLanding($, contentRef, filePath);
//
//		return {
//			$,
//			contentRef,
//			isLanding,
//			filePath,
//		}
//	} catch (e) {
//		console.error(`An error occurred while getting ${basename(filePath)} pageDeps`);
//		throw e;
//	}
//}

//async function getChildren($, contentRef, tomName, filePath) {
//	const fileName = basename(filePath);
//	const getNormalChildren = () => contentRef
//		.find('li > a')
//		.toArray()
//		.map(a => join(`${filePath}/..`, a.attribs.href));
//
//	if (!/TOM(?:56|4095)/.test(tomName)) {
//		return getNormalChildren();
//	} else { // They have landing pages that don't conform
//		const regex = /asl_5600-[ef]\.html/;
//		if (tomName === 'TOM56') {
//			if (regex.test(fileName)) {
//				return contentRef
//					.find('li > a')
//					.filter((i, el) => $(el).find('strong').length > 0) // only links with strong are direct children
//					.toArray()
//					.map(a => join(`${filePath}/..`, a.attribs.href));
//			} else {
//				return getNormalChildren();
//			}
//		} else if (tomName === 'TOM4095') {
//			const regex = /4095\.\(11\)_dectax-[ef]\.html|4095\.\(12\)_landing-[ef]\.html/;
//
//			if (regex.test(fileName)) {
//				return contentRef
//					.children()
//					.first()    // ul
//					.children() // lis
//					.map((i, li) => $(li).children('a').get(0))
//					.toArray()
//					.map(a => join(`${filePath}/..`, a.attribs.href));
//			} else {
//				return getNormalChildren();
//			}
//		}
//	}
//}

//async function recurseChildren(filePath, tomDeps, breadcrumbs) {
//	const pageDeps = await getPageDeps(filePath, tomDeps.landingPages);
//	const validationDeps = { ...tomDeps, ...pageDeps, breadcrumbs };
//	const pageResults: PageResult = await performBasicValidations(validationDeps);
//	//const pageData = await getPageData(...);
//
//	tomDeps.tomResults[filePath] = pageResults;
//	//tomDeps.tomData.push(pageData);
//
//	if (pageDeps.isLanding) {
//		const childLinks = await getChildren(pageDeps.$, pageDeps.contentRef, tomDeps.tomName, filePath);
//
//		const [ children, childResults ] = await checkChildren(childLinks, dirname(filePath));
//
//		if (childResults) {
//			tomDeps.tomResults[filePath].push(childResults);
//		}
//
//		try {
//			if (children.length > 0) {
//				const childTasks = children.map((childPath) => recurseChildren(childPath, tomDeps, [...breadcrumbs, filePath]));
//
//				return await Promise.all(childTasks);
//			}
//		} catch (e) {
//			console.error(`Error in ${basename(filePath)}:`);
//			console.error(e);
//		}
//	}
//
//	// todo: perform basic nav validations
//
//	tomDeps.progress.addPagesDone(1);
//}

//const performBasicValidations = async (deps, isHomepage = false): Promise<PageResult> => {
//	const validationCheckResults: PageResult = [];
//	const validationChecks = {
//		'Title': checkTitle,
//		'Date': checkDate,
//		'Language link': checkLangLink,
//		'Section menu': checkSecMenu,
//		'Breadcrumbs': checkBreadcrumbs,
//		'Headers': checkHeaders,
//	};
//
//	for (const [ type, checkFunc ] of Object.entries(validationChecks)) {
//		if (isHomepage && (type === 'Section menu' || type === 'Breadcrumbs' || type === 'Headers'))
//			continue;
//
//		const validationCheckResult = checkFunc(deps);
//
//		if (validationCheckResult) {
//			validationCheckResults.push(validationCheckResult);
//		}
//	}
//
//	return (await Promise.all(validationCheckResults)).filter((item) => !!item);
//};

//export const parsePagesWithDeps =
//	(progressObj, validationResultsArray, tomDataArray, parsingErrors) =>
//		async function parsePages(pagePath, breadcrumbStack = [], secMenu = []) {
//			const pageResults = [];
//			const folderName = dirname(pagePath);
//			const filename = basename(pagePath);
//
//			try {
//				const pageContents = await readFile(pagePath, 'utf8');
//				const $ = cheerio.load(pageContents, { decodeEntities: false });
//				const content = getContentString(pageContents);
//				const deps = {
//					filename,
//					$,
//				};
//
//				const titleCheck = await checkTitle($); // returns error object or null
//				if (titleCheck) pageResults.push(titleCheck);
//
//				const dateCheck = await checkDate($); // returns error object or null
//				if (dateCheck) pageResults.push(dateCheck);
//
//				const langLinkCheck = await checkLangLink($, filename);
//				if (langLinkCheck) pageResults.push(langLinkCheck);
//
//				const navs = await getNavs($); // returns [ topNavObj, bottomNavObj ] (both optional)
//
//				const contentRef = $(await content);
//				const isLanding = await checkIfLanding(contentRef, filename);
//				const isHomepage = secMenu.length === 0;
//
//				if (!isHomepage) {
//					const homePage = navs.length > 0 ? navs[0].homePage : null;
//					if (!homePage) console.error(`Error with homePage link in ${filename}`);
//
//					const actualSecMenu =
//						$('div.module-menu-section')
//							.first()
//							.find('ul > li > a')
//							.toArray()
//							.map((a) => [ resolve(folderName, a.attribs.href), a.textContent ]);
//
//					const secMenuCheck = await checkSecMenu(actualSecMenu, secMenu);
//					if (secMenuCheck) pageResults.push(secMenuCheck);
//
//					// check breadcrumbs
//					const breadcrumbs =
//						$('#cn-bcrumb > ol > li > a')
//							.filter((i) => i !== 0)
//							.toArray()
//							.map((bcrumb) => bcrumb.attribs.href);
//					const breadcrumbCheck = await checkBreadcrumbs(breadcrumbs, breadcrumbStack);
//					if (breadcrumbCheck) pageResults.push(breadcrumbCheck);
//
//				} else {
//					// populate secMenuLinks?
//				}
//
//				if (isLanding) {
//					const children =
//						contentRef
//							.find('li > a')
//							.toArray()
//							.map(a => resolve(folderName, a.attribs.href));
//					secMenu = isHomepage ? children : secMenu;
//
//					for (const childLink of children) {
//						await parsePages(childLink, [ ...breadcrumbStack, pagePath ], secMenu)
//					}
//				}
//
//				// title +
//				// date +
//				// langLink +
//				//                             --breadcrumbs
//				// secMenu +
//				// navLinks *last
//				// isLanding +
//				//                             --child links
//				// ToC/headers *skip for now
//
//				tomDataArray.push({
//					pagePath,
//					isHomepage,
//					isLanding,
//					nextPage: navs.length > 0 ? navs[0].nextPage : null,
//					prevPage: navs.length > 0 ? navs[0].prevPage : null,
//				});
//
//				progressObj.addPagesDone(1);
//				validationResultsArray.push([ filename, pageResults ])
//			} catch (e) {
//				console.error(`A problem occurred reading file ${filename}`);
//				parsingErrors.push([ pagePath, e ]);
//				return null;
//			}
//		};

//export default async function validateTOM(homePage, tomName, progress) {
//	const tomResults: TOMResults = {};
//	const tomData: TOMData = [];
//
//	//const landingPages = (await readJSON('app/lib/validator/landing-pages.json'))[tomName]
//	const landingPages = landings[tomName]
//		.map((filePath) => resolve(`${homePage}/..`, filePath)); // abs path of all landing pages
//
//	const pageDeps = await getPageDeps(homePage, landingPages, true);
//
//	const breadcrumbs = [ homePage ];
//
//	const childLinks = await getChildren(pageDeps.$, pageDeps.contentRef, tomName, homePage);
//
//	const tomDeps = {
//		homePage,
//		secMenu: childLinks, // should maybe append after validating?
//		progress,
//		tomName,
//		landingPages,
//		tomResults,
//		tomData,
//	};
//
//	const homepageValidationResults: PageResult =
//		await performBasicValidations({ ...tomDeps, ...pageDeps,  }, true);
//
//	const [ children, childResults ] = await checkChildren(childLinks, dirname(homePage));
//	if (childResults) {
//		homepageValidationResults.push(childResults);
//	}
//
//	if (homepageValidationResults.length > 0) {
//		tomResults[homePage] = homepageValidationResults;
//	}
//
//	progress.addPagesDone(1);
//
//	const childTasks = children.map((child) => recurseChildren(child, tomDeps, breadcrumbs));
//
//	// Once all is done you'll be left with an array of file objects to perform any cross-file validations
//	// Append results to results array and return results
//
//	await Promise.all(childTasks);
//
//	return tomResults;
//}