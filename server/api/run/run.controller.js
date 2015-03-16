'use strict';

var _ = require('lodash');
var Run = require('./run.model');

// Get list of runs
exports.index = function(req, res) {
  Run.find(function (err, runs) {
    if(err) { return handleError(res, err); }
    return res.json(200, runs);
  });
};

// Get a single run
exports.show = function(req, res) {
  Run.findById(req.params.id, function (err, run) {
    if(err) { return handleError(res, err); }
    if(!run) { return res.send(404); }
    return res.json(run);
  });
};

// Creates a new run in the DB.
exports.create = function(req, res) {
  var data = req.body;
  data.createdBy = req.user.email;

  Run.create(req.body, function(err, run) {
    if(err) { return handleError(res, err); }
    return res.json(201, run);
  });
};

// Updates an existing run in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Run.findById(req.params.id, function (err, run) {
    if (err) { return handleError(res, err); }
    if(!run) { return res.send(404); }
    var updated = _.merge(run, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, run);
    });
  });
};

// Deletes a run from the DB.
exports.destroy = function(req, res) {
  Run.findById(req.params.id, function (err, run) {
    if(err) { return handleError(res, err); }
    if(!run) { return res.send(404); }
    run.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}