const fs = require('fs');
const path = require('path');
const seed = require('./seedData');
const file = path.join(__dirname, 'db.json');
let db;
function clone(x){ return JSON.parse(JSON.stringify(x)); }
function init(){
  if (fs.existsSync(file)) { try { db = JSON.parse(fs.readFileSync(file,'utf8')); } catch { db = clone(seed); save(); } }
  else { db = clone(seed); save(); }
}
function save(){ fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, JSON.stringify(db,null,2)); }
function all(collection){ return db[collection] || []; }
function find(collection,id){ return all(collection).find(x => x.id === id); }
function insert(collection,item){ db[collection].unshift(item); save(); return item; }
function update(collection,id,patch){ const item=find(collection,id); if(!item) return null; Object.assign(item,patch,{updatedAt:new Date().toISOString()}); save(); return item; }
function remove(collection,id){ const before=all(collection).length; db[collection]=all(collection).filter(x=>x.id!==id); save(); return before!==db[collection].length; }
function reset(){ db=clone(seed); save(); }
module.exports={init,save,all,find,insert,update,remove,reset};
