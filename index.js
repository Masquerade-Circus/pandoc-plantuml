#! /usr/bin/env node

const pandoc = require('pandoc-filter');
const plantumlEncoder = require('plantuml-encoder');
const fs = require('fs');
const path = require('path');

const currentDir = process.cwd();
let defaultSkinparam = fs.readFileSync(path.normalize(`${__dirname}/.skinparam.iuml`), 'utf8');

if (fs.existsSync(path.normalize(`${currentDir}/.skinparam.iuml`))) {
  let skinparamConfig = fs.readFileSync(path.normalize(`${currentDir}/.skinparam.iuml`), 'utf8');
  defaultSkinparam += `\n${skinparamConfig}`;
}

function getPath(contents) {
  contents = `${contents.substr(0, 9)}\n${defaultSkinparam}\n${contents.substr(9)}`;

  let encoded = plantumlEncoder.encode(contents);
  return `http://www.plantuml.com/plantuml/png/${encoded}`;
}

function action(key, value, format, meta) {
  if (key !== 'CodeBlock') {
    return null;
  }

  let attrs = value[0];
  let contents = value[1];
  let id = attrs[0];
  let classes = attrs[1];

  if (classes.indexOf('plantuml') < 0) {
    return null;
  }

  let newPath = getPath(contents);
  let image = pandoc.Image([id, [], []], [], [newPath, '']);
  return pandoc.Para([pandoc.Link([id, [], [['target', '_blank']]], [image], [newPath, ''])]);


}

pandoc.toJSONFilter(action);
