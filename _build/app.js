const siteFolder = './_site/';
const fs = require("fs");
const path = require("path");

const getAllFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join("./", dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

const openingTag = `<pre><code class="language-mermaid">`;
const closingTag = `</code></pre>`;

const parseFileContent = function (fileContent) {
  var openingTagIndex = fileContent.search(openingTag)

  while (openingTagIndex != -1) {
    let closingTagIndex = fileContent.search(closingTag);
    var content = fileContent.substring(openingTagIndex + openingTag, closingTagIndex);

    fs.writeFile("temp.mmd", content);
  }
}

var allFiles = getAllFiles(siteFolder);
allFiles = allFiles.filter(function (e) {
  return e.includes(".html");
});

allFiles.forEach(element => {
  fs.readFile(element, "UTF-8", function (err, content) {
    parseFileContent(content);
  })
});