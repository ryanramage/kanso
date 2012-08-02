var utils = require('./utils'),
    path = require('path'),
    semver = require('semver'),
    async = require('async'),
    fs = require('fs'),
    _ = require('underscore')._ ;


exports.load = async.memoize(function (dir, callback) {
    exports.find_settings_file(dir, function(file, type) {
       if (!file) return callback('No kanso settings found');
       if (type === 'kanso') exports.load_from_kanso(file, callback);
       if (type === 'package') exports.load_from_package(file, callback);
    });
});

exports.find_settings_file = function(dir, callback){
    var settings_file = path.join(dir, 'kanso.json');
    var package_file = path.join(dir, 'package.json');
    async.detectSeries([settings_file, package_file], path.exists, function(file){
        var settings_type = 'kanso';
        if (file === package_file) settings_type = 'package';
        callback(file, settings_type);
    });
}


exports.load_from_kanso = function(settings_file, callback){
    utils.readJSON(settings_file, function (err, settings) {
        if (err) {
            callback(err);
        }
        try {
            exports.validate(settings, settings_file);
        }
        catch (e) {
            return callback(e);
        }
        callback(null, settings);
    });
}

exports.load_from_package = function(package_file, callback) {
    utils.readJSON(package_file, function (err, settings) {
        if (err) {
            callback(err);
        }
        try {
            exports.validate(settings, package_file);
        }
        catch (e) {
            return callback(e);
        }
        if (settings.kanso) {
            settings = _.extend(settings.kanso, _.pick(settings, 'name', 'version', 'description'));
        }
        callback(null, settings);
    });

}

exports.validate = function (settings, filename) {
    if (!settings.name) {
        throw new Error('Missing name property in ' + filename);
    }
    if (!settings.version) {
        throw new Error('Missing version property in ' + filename);
    }
    if (!settings.description) {
        throw new Error('Missing description property in ' + filename);
    }
    if (!semver.valid(settings.version)) {
        throw new Error(
            'Invalid version number in ' + filename + '\n' +
            'Version numbers should follow the format described at ' +
            'http://semver.org (eg, 1.2.3)'
        );
    }
};
