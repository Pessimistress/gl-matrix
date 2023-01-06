const fs = require('fs');
const path = require('path');
const pkg = require('../package.json');

const copyFileSync = (source, dest) => {
  const content = fs.readFileSync(source, 'utf-8');
  fs.writeFileSync(dest, content);
};

delete pkg.private;
delete pkg.scripts;
delete pkg.devDependencies;
pkg.type = 'module';
pkg.main = 'cjs/index.cjs'
pkg.module = 'esm/index.js'
pkg.exports = {
  '.': {
    require: './cjs/index.cjs',
    import: './esm/index.js'
  }
};

copyFileSync('README.md', 'dist/README.md');
copyFileSync('LICENSE.md', 'dist/LICENSE.md');

const files = fs.readdirSync('src')
  .filter(file => !file.includes('common') && !file.includes('index'))
  .forEach(file => {
    const name = file.endsWith('.js') ? file.slice(0, -3) : file;
    const filePkg = {
      name: `gl-matrix/${name}`,
      main: `../cjs/${file.replace('.js', '.cjs')}`,
      module: `../esm/${file}`,
    };
    pkg.exports[`./${name}`] = {
      require: `./cjs/${file.replace('.js', '.cjs')}`,
      import: `./esm/${file}`,
    };
    if(!fs.existsSync(`dist/${name}`)) {
      fs.mkdirSync(`dist/${name}`);
    }
    fs.writeFileSync(
      `dist/${name}/package.json`,
      JSON.stringify(filePkg, null, 2)
    );
  });

fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));
