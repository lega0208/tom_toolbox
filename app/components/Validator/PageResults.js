import React from 'react';
import { Card } from 'components/bsComponents';
import ValidationResults from './ValidationResults';

export default ({ filename, pageResults, validationFilters }) => {
	const filteredResults =
		pageResults.filter(({ title }) => !validationFilters.includes(title));

	return filteredResults.length > 0 ? (
		<Card header={filename} xClass={`mt-2`}>
			{
				filteredResults
					.map(({ title, errors }, i) => (
						<ValidationResults key={`err-cat-${i}`}
						                   title={title}
						                   errors={errors} />
					))
			}
		</Card>
	) : null;
}
