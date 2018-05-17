
export const waitForEach = (processFunc, [head, ...tail]) =>
	!head
		? Promise.resolve()
		: processFunc(head).then(() => waitForEach(processFunc, tail));
