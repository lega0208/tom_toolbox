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

export async function getTOMDataModel(db) {
	const tomDataSchema = {
		'id': {
			type: 'increments',
			primary: true,
		},
		path: {
			type: String,
			unique: true,
		},
		$: String, // stringified function
		tomName: String,
		updated_at: Date,
	};

	return db.model('tomData', tomDataSchema, {
		index: {
			path: 'path',
			tomName: 'tomName',
			updated_at: 'updated_at',
		},
	});
}