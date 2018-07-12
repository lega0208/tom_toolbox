export default function fixTableHTML($, opts) {
	const tablesRef = $('table');
	tablesRef.each((i, table) => {
		const tbodyRef = $('tbody', table);
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
			// change <td>s to <th>s
			$('thead > tr', table).find('td').each((i, item) => {
				item.tagName = 'th';
			});
			// remove <p>s from <th>s
			$('th', table).find('p').each((i, item) => {
				const itemRef = $(item);
				if (!!itemRef.children('strong').length) {
					const text = itemRef.children().first().text();
					itemRef.parent().empty().text(text);

				}
			});
		}
		tbodyRef.children().each((i, tr) => {
			const trRef = $(tr);
			const firstChildP = trRef.children().first().find('p');
			if (/^<strong>[\s\S]+?<\/strong>$/.test(firstChildP.html())) {
				const strong = $('strong', firstChildP);
				strong.replaceWith(strong.contents());
				firstChildP.parent().get(0).tagName = 'th';
			}
		});

		// remove <p>s in <td>s (todo: maybe they should be kept?)
		$('td > p, th > p', table).each((i, p) => {
			const pRef = $(p);
			pRef.replaceWith(pRef.text());
		});
		$('td, th').each((i, el) => $(el).html($(el).html().trim()))
	});
}