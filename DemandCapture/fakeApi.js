'use strick';


var thinky = require('thinky')({
    host: 'localhost',
    port: '28015',
    db: 'Demands'
});
var _ = require('lodash');
var r = thinky.r;
var server = require('./server');

var Demand = thinky.createModel('Demand', {
    typeOfDemand: String,
    valueOrFailure: String,
    date: {_type: Date, default: r.now()}
});

Demand.ensureIndex('date');

var stringify = function (doc) {
    return JSON.stringify(doc, null, 2);
};


Demand.changes().then(function (feed) {

    feed.each(function (error, doc) {
        server.io.emit("demand", doc);
    });
});

exports.list = function (req, res) {
    Demand.orderBy({index: r.desc('date')}).run().then(function (demand) {
        res.json(demand);
    }).error(function (err) {
        res.json({message: 'An Error has Occured while listing: ' + err});
    });
};

exports.add = function (req, res) {

    var demand = new Demand(req.body);
    demand.save().then(function (result) {
        res.status(201).json(demand);
    }).error(function (err) {
        res.json({message: 'An Error has Occured while adding: ' + err});
    });

};

exports.get = function (req, res) {
    Demand.get(req.params.id).run().then(function (result) {
        res.status(200).json(result)
    }).error(function (err) {
        res.status(404).json({message: 'An Error has Occured while adding: ' + err});
    });

};

exports.delete = function (req, res) {
    Demand.get(req.params.id).run().then(function (demand) {
        demand.delete().then(function (result) {
            res.status(200).json(result);
        }).error(function (err) {
            res.status(404).json({message: 'An Error has Occured while deleting: ' + err});
        });

    }).error(function (err) {
        res.status(404).json({message: 'An Error has Occured while deleting, could not find the person: ' + err});
    });
};

exports.update = function (req, res) {
    Demand.get(req.params.id).run().then(function (demand) {
        demand = req.body;
        demand.date = r.now();
        demand.id = req.params.id;
        demand.save().then(function (result) {
            res.status(201).json(result);
        }).error(function (err) {
            res.json({message: 'An Error has Occured while adding: ' + err});
        });
    }).error(function (err) {
        res.status(404).json({message: 'An Error has Occured while deleting, could not find the person: ' + err});
    });
};
