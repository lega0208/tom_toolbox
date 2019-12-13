import { parseFromHomepage } from 'lib/validator/parse-all-toms';

export default async (homepagePaths, tomName) => {
  const errors = [];
  const tomData = await parseFromHomepage(homepagePaths, tomName, errors);

  if (errors.length > 0) {
    const errorMessages = errors.map((err) => JSON.stringify(err, null, 2)).join('\n\n');
    throw new Error(`Error(s) parsing ${tomName}:\n\n${errorMessages}`);
  }

  return tomData;
};
