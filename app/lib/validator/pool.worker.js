import { validatePage } from 'lib/validator/Validator';
import workerpool from 'workerpool';

async function validate(file, tomData) {
	return validatePage(file, tomData)
}

workerpool.worker({ validatePage: validate });
