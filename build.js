const fs = require('fs-extra');
const archiver = require('archiver');
const path = require('path');

// Read the module.json file
const manifest = JSON.parse(fs.readFileSync('module.json', 'utf8'));
const moduleName = manifest.id;
const version = manifest.version;

// Define the output file
const outputFile = `${moduleName}.zip`;

// Ensure the dist directory exists
fs.ensureDirSync('dist');

// Create the archive
const archive = archiver('zip', { zlib: { level: 9 } });
const stream = fs.createWriteStream(path.join('dist', outputFile));

// Listen for all archive data to be written
stream.on('close', () => {
  console.log(`Archive created: ${outputFile} (${archive.pointer()} bytes)`);
});

// Handle archive warnings
archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(err);
  } else {
    throw err;
  }
});

// Handle archive errors
archive.on('error', (err) => {
  throw err;
});

// Pipe archive data to the file
archive.pipe(stream);

// Add files to the archive
const filesToInclude = [
  'module.json',
  'init.js',
  'README.md',
  'LICENSE',
  'INSTALL.md',
  'DIRECTORY_STRUCTURE.md',
  'scripts',
  'styles',
  'languages',
  'templates',
  'samples',
  'images'
];

filesToInclude.forEach((file) => {
  if (fs.existsSync(file)) {
    if (fs.lstatSync(file).isDirectory()) {
      archive.directory(file, file);
    } else {
      archive.file(file, { name: file });
    }
  }
});

// Finalize the archive
archive.finalize();

// Also copy the module.json to dist for easy access
fs.copySync('module.json', path.join('dist', 'module.json'));

console.log(`Build completed for ${moduleName} v${version}`);
