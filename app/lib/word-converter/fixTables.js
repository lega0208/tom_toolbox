export default function fixTableHTML($) {
	const tablesRef = $('table');

	tablesRef.each((i, table) => {
		const theadRef = $('thead', table);
		const tbodyRef = $('tbody', table);
		
		if (!theadRef.length) {
			// check that first row contains headers
			const headerRow = tbodyRef.children().first();
			// if first two <td>s are bold, it's most likely a header row
			const first = headerRow.children().first().children().first(); // is <p>
			const second = first.parent().next().children().first(); // is <p>

			if (first.find('strong').length && second.find('strong').length) {
				// prepend thead to table
				$('<thead />').insertBefore(tbodyRef);
				// move header row to thead
				$('thead', table).append(headerRow);
			}
		}
		
		// change <td>s to <th>s
		$('thead > tr', table).find('td').each((i, item) => {
			const strong = $('strong', item).first();
			strong.replaceWith(strong.contents());
			item.tagName = 'th';
		});
		
		// if first cell of the row is bolded, it's probably a header
		tbodyRef.children().each((i, tr) => {
			const trRef = $(tr);
			const firstTd = trRef.children().first();

			if (!!firstTd.find('strong').length) {
				const strong = $('strong', firstTd);
				strong.each((i, str) => $(str).replaceWith($(str).contents()));
				firstTd.get(0).tagName = 'th';
			}
		});

		// remove <p>s in <td>s and <th>s if there's only 1 line
		$('td, th', table).each((i, cell) => {
			const cellRef = $(cell);
			const children = cellRef.children();
			const parent = children.parent();
			// remove empty children
			children.each(
				(i, child) => (!$(child).text().trim() && $(child).find('img').length === 0)
				? $(child).remove()
				: null
			);

			// need to recalculate children or something apparently
			const newChildren = parent.children();

			if (newChildren.length === 1 && newChildren.get(0).tagName === 'p') {
				const p = children.first();
				p.replaceWith(p.contents());
			}
		});

		// trim any extra whitespace
		$('td, th').each(
			(i, el) => $(el).html($(el).html().trim())
		);
		const $table = $(table);
		const $parent = $table.parent();
		if ($table.siblings().length === 0 && !$parent.attr('class')) {
			$parent.replaceWith($table);
		}
	});
}