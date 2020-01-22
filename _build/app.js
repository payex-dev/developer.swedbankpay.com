const siteFolder = './_site/';
const fs = require('fs');
const path = require('path');
const decode = require('unescape');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { exec } = require("child_process");

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join("./", dirPath, "/", file))
    }
  });

  return arrayOfFiles
}

const parseFileContent = function (fileContent, filename) {
  const openingTag = `<pre><code class="language-mermaid">`;
  const closingTag = `</code></pre>`;
  let openingTagIndex = fileContent.indexOf(openingTag)
  let counter = 1;

  while (openingTagIndex != -1) {
    let closingTagIndex = fileContent.indexOf(closingTag, openingTagIndex);
    let content = fileContent.substring(openingTagIndex + openingTag.length, closingTagIndex);
    let tempMmdFilename = `${filename}temp${counter}.mmd`;
    let outputName = `${filename}${counter}.svg`
    let unescaped = decode(content);

    fs.writeFileSync(tempMmdFilename, unescaped);

    exec(`npm run mmdc -i ${tempMmdFilename} -o ${outputName}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
    openingTagIndex = fileContent.indexOf(openingTag, closingTagIndex);
    counter++;
  }
}

const renderFileAndRemoveMermaidScript = function (filename) {
  const resolvedPath = path.resolve(siteFolder);
  const options = {
    pretendToBeVisual: true,
    resources: "usable",
    runScripts: "dangerously",
    url: "file://" + resolvedPath
  };

  JSDOM.fromFile(filename, options).then(dom => {
    let result = dom.serialize();
    fs.writeFileSync(filename, result);
  });
}

var allFiles = getAllFiles(siteFolder);
allFiles = allFiles.filter(function (e) {
  return e.includes(".html");
});

/*
allFiles.forEach(element => {
  renderFileAndRemoveMermaidScript(element);
})
*/

allFiles.forEach(element => {
  fs.readFile(element, "UTF-8", function (err, content) {
    let fileName = element.substring(element.lastIndexOf("/"));
    parseFileContent(content, fileName);
  })
});
