import { join } from 'path';
import { parseAllTOMs } from './app/lib/validator/parse-all-toms';

parseAllTOMs(join(process.env.USERPROFILE, 'Desktop/TOM_Data'))
	.then(() => console.log('TOMs successfully parsed and cached!'))
	.then(() => console.log(`Output dir: ${join(process.env.USERPROFILE, 'Desktop')}`))
	.catch(e => console.error(e));