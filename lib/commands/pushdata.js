var data = require('../data'),
    logger = require('../logger'),
    couchdb = require('../couchdb');


exports.summary = 'Push a file or directory of json files to DB';


exports.run = function (args) {
    var force = false;
    for (var i = 0; i < args.length; i += 1) {
        if (args[i] === '-f' || args[i] === '--force') {
            force = true;
            args.splice(i, 1);
            i = 0;
        }
    }
    if (!args[0]) {
        return logger.error('No CouchDB URL specified');
    }
    if (!args[1]) {
        return logger.error('No data file or directory specified');
    }
    var path = args[1] || '.';
    var db = couchdb(args[0]);
    data.eachDoc(path, function (p, doc, cb) {
        logger.info('Loaded ' + p + (doc._id ? ' (' + doc._id + ')': ''));
        db.save(doc._id, doc, {force: force}, function (err) {
            if (!err) {
                logger.info(
                    'Saved ' + p + (doc._id ? ' (' + doc._id + ')': '')
                );
            }
            cb(err);
        });
    },
    function (err) {
        if (err) {
            return logger.error(err);
        }
        logger.end('uploads complete');
    });
};