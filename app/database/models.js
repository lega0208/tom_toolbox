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

export async function getLandingPagesModel(db) {
	const landingPagesSchema = {
		ID: { type: 'increments', nullable: false, primary: true },
		filepath: { type: String, nullable: false, unique: true },
		tomName: { type: String, nullable: false },
		isHomepage: { type: Boolean }
	};
	return db.model('landingPages', landingPagesSchema, {
		index: { isHomepage: 'isHomepage', tomName: 'tomName' }
	});
}
