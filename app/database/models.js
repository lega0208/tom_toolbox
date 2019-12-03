
export async function getAcrosModel(db) {
	const acroSchema = {
		'ID': {
			type: Number,
			primary: true,
		},
		'Acronym': String,
		'Definition': String,
		'Language': String,
	};
	return db.model('Acronyms', acroSchema, {
		index: [
			'Acronym',
			['Acronym', 'Language'],
		],
	});
}

export async function getLandingPagesModel(db) {
	try {
		const landingPagesSchema = {
			ID: { type: 'increments', nullable: false, primary: true },
			filepath: { type: String, nullable: false, unique: true },
			tomName: { type: String, nullable: false },
			isHomepage: Boolean,
		};

		return db.model('LandingPages', landingPagesSchema, {
			index: [
				'filepath',
				['isHomepage', 'tomName'],
				['tomName', 'isHomepage'],
			],
		});
	} catch (e) {
		console.error('Error getting LandingPages model');
		console.error(e);
	}
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
	};

	return db.model('tomData', tomDataSchema, {
		index: {
			path: 'path',
			tomName: 'tomName',
			updated_at: 'updated_at',
		},
	});
}

