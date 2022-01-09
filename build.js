/* eslint-disable import/no-extraneous-dependencies */
const esbuild = require('esbuild');
const fs = require('fs-extra');
const sassPlugin = require('esbuild-plugin-sass');
const { version } = require('./package.json');

const OUTPUT_DIR = './extension';

const manifest = {
  manifest_version: 2,
  name: 'Oumu',
  version,
  description: 'Oumu helps you learn Japanese by replacing words on websites',
  permissions: ['storage', '<all_urls>'],
  browser_action: {
    default_popup: 'popup.html',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content.js'],
      css: ['content.css'],
    },
  ],
  web_accessible_resources: ['*.json'],
  icons: {
    48: '48-icon.png',
    128: '128-icon.png',
  },
};

const prepareContent = async () => {
  try {
    await fs.emptyDir(OUTPUT_DIR);
    await Promise.all([
      fs.writeFile(`${OUTPUT_DIR}/manifest.json`, JSON.stringify(manifest)),
      fs.copy('./extension_content', OUTPUT_DIR),
      fs.copy('./src/views', OUTPUT_DIR),
      esbuild.build({
        entryPoints: ['./src/popup.ts'],
        bundle: true,
        minify: true,
        outfile: `${OUTPUT_DIR}/popup.js`,
        plugins: [sassPlugin()],
      }),
      esbuild.build({
        entryPoints: ['./src/content.ts'],
        bundle: true,
        minify: true,
        outfile: `${OUTPUT_DIR}/content.js`,
        plugins: [sassPlugin()],
      }),
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

prepareContent();
