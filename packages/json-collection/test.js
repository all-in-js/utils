const JsonCollection = require('./lib');

const col = new JsonCollection('i18n/message', {
  rootFolder: '.data/jsons'
});

(async () => {

  await col.insert([{lang: 'en-US', key: '阿萨1', value: 'hehe', translated: true}]);
  const list = await col.find();
  console.log(list);
  col.dropCollection();
  const list1 = await col.find();
  console.log(list1);
})();

