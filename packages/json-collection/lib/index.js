const { log, join, getArgType, getHomedir, fse } = require('@iuv-tools/utils');
const bfj = require('bfj');
const uuidv4 = require('uuid/v4');
const cloneDeep = require('lodash.clonedeep');

function addDefaultItem(val) {
	const now = Date.now();
	if (!val._id) {
		val._id = uuidv4();
	}
	if (!val.createTime) {
		val.createTime = now
	}
	if (!val.updateTime) {
		val.updateTime = now;
	}
	return val;
}

const cacheData = new Map();

class Collection {
	constructor(pathName, {
		cachable,
		rootFolder = '.json-collection'
	} = {}) {
		if (!pathName) {
			this.destroy('pathName excepted.');
			process.exit();
		}
		pathName = pathName.endsWith('.json') ? name : `${ pathName }.json`;
		const filepath = join(getHomedir(), rootFolder, pathName);

		this.filepath = filepath;
		this.cachable = cachable;
	}
	async readCollection() {
		let data = [];
		if (!fse.existsSync(this.filepath)) {
			fse.ensureFileSync(this.filepath);
		} else if (cacheData.has(this.filepath)) {
			return cacheData.get(this.filepath);
		} else {
			try {
				data = (await bfj.read(this.filepath)) || [];
			} catch(e) {
				log.error(e, 'read');
			}
		}
		if (this.cachable) {
			cacheData.set(this.filepath, data);
		}
		return data;
	}
	async writeCollection(datas) {
		await bfj.write(this.filepath, datas);
		if (this.cachable) {
			cacheData.set(this.filepath, datas);
		}
		return datas;
	}
	async getData() {
		let cache = cacheData.get(this.filepath) || await this.readCollection();
		return cache;
	}
	async insert(item) {
		// col.insert({a:1})
		// col.insert([{a:1},{b:2}])
		const argType = getArgType(item);
		let data = await this.getData();
		if (argType.isArray) {
			data = data.concat(item.map(addDefaultItem));
		} else if (argType.isObject) {
			data.push(addDefaultItem(item));
		} else {
			log.warn('no formated data supplied.', 'insert');
		}
		await this.writeCollection(data);
		return data;
	}
	async remove(condition) {
		const argType = getArgType(condition);
		if (!argType.isObject) {
			return this.destroy('the type of param should be an Object.', 'remove');
		}
		// col.remove({a:1,b:/^a/})
		let data = await this.getData();
		if (data.length) {
			data = data.filter(item => !this.filterOnce(item, condition));
		}
		await this.writeCollection(data);
	}
	async updateMany(updates = []) {
		if (updates.length) {
			let data = await this.getData();
			data.forEach((item, i) => {
				for (const [condition, newItem] of updates) {
					if (this.filterOnce(item, condition)) {
						const updatedItem = extend(item, newItem, {
							updateTime: Date.now()
						});
						data[i] = updatedItem;
					}
				}
			});
			await this.writeCollection(data);
		}
	}
	async update(condition, newItem) {
		if (!getArgType(condition).isObject || !getArgType(newItem).isObject) {
			return this.destroy('the type of param should be an Object.', 'update');
		}
		// col.update({a:3},{b:90});
		let data = await this.getData();
		data.forEach((item, i) => {
			if (this.filterOnce(item, condition)) {
				const updatedItem = extend(item, newItem, {
					updateTime: Date.now()
				});
				data[i] = updatedItem;
			}
		});
		await this.writeCollection(data);
		return data;
	}
	filterOnce(item, condition) {
		const ckeys = Object.keys(condition);
		return ckeys.map(key => item[key] === condition[key] ||
														(getArgType(condition[key]).isRegExp && condition[key].test(item[key]))
									).every(key => key);
	}	
	async find(condition, filter) {
		// col.find({a:1,b:2},{pswd:0})
		const hasFilter = filter && getArgType(filter).isObject;
		const data = cloneDeep(await this.getData());

		if ((condition === undefined || !Object.keys(condition).length) && !hasFilter) return data;
		if (data.length) {
			let _data = data.filter(item => this.filterOnce(item, condition));
			if (hasFilter) {
				_data = _data.map(item=>{
					for(let k in item){
						if (filter[k] !== undefined && !filter[k]) delete item[k];
					}
					return item;
				});
			}
			return _data;
		}
		return [];
	}
	destroy(msg, tag = '') {
		if (msg) {
			log.error(msg, tag);
		}
		cacheData.delete(this.filepath);
	}
	get dropFilename() {
		return this.filepath.replace(/\.\w+$/, '.droped');
	}
	dropCollection() {
		this.destroy();
		fse.renameSync(this.filepath, this.dropFilename);
	}
	recoverCollection() {
		if (fse.existsSync(this.dropFilename)) {
			fse.renameSync(this.dropFilename, this.filepath);
		}
	}
}

Collection.destroy = function() {
	cacheData.clear();
	cacheData = null;
}

function extend(...objs) {
	// extend(target, {}, {},...)
	if (objs.length <= 1) {
		return objs[0] || {};
	}
	
	const _extend = (a, b) => {
		if (getArgType(b).isObject) {
			for(let j in b) {
				if(getArgType(b[j]).isObject) {
					a[j] = _extend(a[j] || {}, b[j]);
				} else {
					a[j] = b[j];
				}
			}
		};
		return a;
	}
	const res = _extend({}, objs[0]);
	for(let i=1; i < objs.length; i++) _extend(res, objs[i]);
	return res;
};

module.exports = Collection;