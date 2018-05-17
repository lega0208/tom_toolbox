export async function getCacheInfoModel(db) {
	return db.model('CacheInfo', {
		CacheDate: Date,
		LastCache: Boolean
	});
}
export async function getAcrosModel(db) {
	const acroSchema = {
		'ID': {
			type: Number,
			unique: true,
		},
		'Acronym': String,
		'Definition': String,
		'Language': String,
	};
	return db.model('Acronyms', acroSchema, {
		index: [
			'Acronym',
			['Acronym', 'Language']
		],
		primary: ['ID'],
	});
}
