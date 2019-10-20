import fetch from 'node-fetch';

interface JsonBoxConfig {
	sort?: string;
	skip?: number;
	limit?: number;
	query?: string;
}

const ID: string = '_id';

const HOST: string = 'https://jsonbox.io';

function getUrl(
	boxId: string,
	collection?: string,
	config: JsonBoxConfig = {
		sort: '-_createdOn',
		skip: 0,
		limit: 20
	}
): string {
	let url = `${HOST}/${boxId}`;
	const { sort, skip, limit, query } = config;

	if (collection) {
		url = `${url}/${collection}`;
	}

	let parameters = new Map<string, string | number>();
	if (sort) {
		parameters.set('sort', sort);
	}
	if (skip) {
		parameters.set('skip', skip);
	}
	if (limit) {
		parameters.set('limit', limit);
	}
	if (query) {
		parameters.set('q', query);
	}

	if (parameters.size > 0) {
		url = `${url}?${[...parameters.keys()].map((key) => `${key}=${parameters.get(key)}`).join('&')}`;
	}

	return url;
}

function getRecordId(data: any): string | string[] {
	return Array.isArray(data) ? data.map((record) => record[ID]) : data[ID];
}

async function read(boxId: string, collection?: string, config?: JsonBoxConfig) {
	const response = await fetch(getUrl(boxId, collection, config), { method: 'GET' });
	return response.status === 200 ? response.data : false;
}

async function create(data: any, boxId: string, collection?: string) {
	const response = await fetch(getUrl(boxId, collection), { method: 'POST', body: data });
	return response.status === 200 ? response.data : false;
}

async function update(data: any, boxId: string, recordId: string) {
	const response = await fetch(getUrl(boxId, recordId), { method: 'PUT', body: data });
	return response.status === 200 ? response.data : false;
}

async function deleteF(boxId: string, recordId: string) {
	const response = await fetch(getUrl(boxId, recordId), { method: 'DELETE' });
	return response.status === 200 ? response.data : false;
}

async function deleteMany(boxId: string, recordIds: string[]) {
	return recordIds.map((id) => deleteF(boxId, id));
}

export { getUrl, getRecordId, read, create, update, deleteMany, deleteF as delete };
