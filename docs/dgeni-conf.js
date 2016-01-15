// Canonical path provides a consistent path (i.e. always forward slashes) across different OSes
var path = require('canonical-path');
var Package = require('dgeni').Package;


module.exports = new Package('dgeni-example', [
  require('dgeni-packages/ngdoc'),
])


.config(function(log, readFilesProcessor, writeFilesProcessor) {

  log.level = 'info';

  readFilesProcessor.basePath = path.resolve(__dirname, '..');
  readFilesProcessor.sourceFiles = [
    { include: 'js/*.js', basePath: 'js' }
  ];

  writeFilesProcessor.outputFolder  = 'build';

})

