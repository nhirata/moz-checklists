'use strict';

var fs = require('fs');
var Promise = require('promise');
var NodeGit = require("nodegit");

var localFolder = 'var/git';
var remoteRepoUrl = 'http://localhost:10080/johan/moztrap-replacement-repo.git';
var _branch = 'master';
var _repo = null;

var _initializeRepo = function() {
  return new Promise(function(fulfill, reject) {
    fs.exists(localFolder, function(exists) {
      if (exists) {
        NodeGit.Repository.open(localFolder).then(function (repo) {
          _repo = repo;
        });
      } else {
        NodeGit.Clone.clone(remoteRepoUrl, localFolder, null).then(function(repo) {
          _repo = repo;
        })
      }
    });
  })
}

var _getFileContentAtRevision = function(path, revision) {
  return _repo.getCommit(revision)
    .then(function(commit) {
      return commit.getEntry(path);
    })
    .then(function(entry){
      return entry.getBlob().then(function(blob) {
        return String(blob);
      });
    })
}

var self = module.exports = {

  update: function() {
      _repo.fetchAll({
        credentials: function(url, userName) {
          return NodeGit.Cred.sshKeyFromAgent(userName);
        },
        certificateCheck: function() {
          return 1;
        }
      })
      // Now that we're finished fetching, go ahead and merge our local branch
      // with the new one
      .then(function() {
        return repository.mergeBranches("master", "origin/master");
      })
  },

  getCurrentBranch: function() {
    return _branch;
  },

  getFileContent: function(path, revision) {
    if (typeof revision === 'undefined') {
      return self.getLatestCommitSha1().then(function(head) {
        return _getFileContentAtRevision(path, head);
      })
    } else {
      return _getFileContentAtRevision(path, revision);
    }
  },

  getLatestCommitSha1: function() {
    return NodeGit.Reference.nameToId(_repo, "HEAD");;
  }
};

_initializeRepo();
