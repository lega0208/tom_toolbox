import React from 'react';
import { Card } from 'components/bsComponents';
import { basename } from "path";
import ValidationResults from './ValidationResults';

export default ({ filename, pageResults, validationFilters = [] }) => pageResults.length > 0 ? (
	<Card header={basename(filename)} xClass="mt-2">
		{
			pageResults
				.filter(({ title }) => !validationFilters.includes(title))
				.map(({ title, errors }, i) => (
					<ValidationResults key={`err-cat-${i}`} title={title} errors={errors} />
				))
		}
	</Card>
) : null;
