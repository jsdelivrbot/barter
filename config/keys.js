const DB_USER = 'admin';
const DB_PASSWORD = '9323Kenzie';
const DB_URI = 'ds219191.mlab.com:19191';
const dbName = 'barter-mac';

module.exports = {
    mongoURI: `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_URI}/${dbName}`
}
