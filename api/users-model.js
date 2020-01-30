const db = require('../database/dbConfig.js');

module.exports = {
  add,
  find,     // List all users
  findBy,   // Specify { key:value } pair
  findById,
};

function find() {
  return db('users').select('id', 'username', 'department');
}

function findBy(filter) {
  return db('users').where(filter);
  // The following line prevents password display, but has side effects.
  // .select('id', 'username', 'department');
}

async function add(user) {
  const [id] = await db('users').insert(user);

  return findById(id);
}

function findById(id) {
  return db('users')
    .where({ id })
    .first();
}
