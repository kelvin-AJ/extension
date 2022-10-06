// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let arr;
/**
 * @param {vscode.ExtensionContext} context
 */


function activate(context) {
	const barItem = vscode.window.createStatusBarItem("stuff", 1, 1);
	barItem.name= "Generate CSS Selectors from HTML file"
	barItem.text = "$(edit) Generate Selectors";
	barItem.command = "css-selector-generator.generate";
	let [curDoc] = vscode.window.visibleTextEditors;
	let curDocFsPath = curDoc?.document.uri.fsPath;
	let curFileContent ;

	function showTab() {
		[curDoc] = vscode.window.visibleTextEditors;
		curDocFsPath = curDoc?.document.uri.fsPath;
		if(curDocFsPath.endsWith("css")){
			barItem.show();
		}else{
			barItem.hide();
		}
	}
	showTab()

	vscode.window.onDidChangeVisibleTextEditors(showTab)


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('CSS Selector Generator Activated!');

	const getAttributefromLine = function(attribute, line){
		const impureLine1 = line.slice(line.indexOf(attribute.toLowerCase()));
		const impureLine2 = impureLine1.slice(impureLine1.indexOf(`"`)).split("").slice(1)
		let pureLine = impureLine2.slice(0, impureLine2.indexOf(`"`))
	
		pureLine = pureLine.join("").split(" ")
		
		return pureLine
	}
	
	const removeDuplicates = function(arr) {
		const output = []
		arr.forEach(el => {
			if(!output.includes(el)){
				output.push(el)
			}
		})
		return output;
	}
	
	const getAttributeStrings = function(document) {
		[curDoc] = vscode.window.visibleTextEditors;
		curDocFsPath = curDoc?.document.uri.fsPath;
		curFileContent = fs.readFileSync(curDocFsPath, {encoding:'utf8', flag:'r'})

		const newString = document + "";
		const attibuteList = newString.split("\n").filter(line => line.includes("="));
		const idLines = attibuteList.filter(line => {
			return (line.includes("id=") || line.includes("id ="))
		});
		const classLines = attibuteList.filter(line => line.includes("class"));
		let ids = idLines.flatMap(line => getAttributefromLine("id",line));
		ids = ids.filter(id => !curFileContent.includes(id));

	
		let classes = classLines.flatMap(line => getAttributefromLine("class",line))
		classes = classes.filter(className => !curFileContent.includes(className))
	
		return {"allIds" : removeDuplicates(ids), "allClasses" : removeDuplicates(classes)}
	};
	
	
	// Contruct string
	
	const constructSelectors = function(attributName, arr) {
		return "\n" + arr
		.map(attribute => `${attributName == "id" ? "#" : "."}${attribute} {\n \n}`)
		.join("\n")
	}
	
	// File reading
	
	
	const htmlToCss = function(htmlString, fresh=true) {
		const {allIds, allClasses} = getAttributeStrings(htmlString);
	
		if(!fresh){
			return (`${constructSelectors("id", allIds)}
			\n${constructSelectors("class", allClasses)}`);
		}
		return (
			`/* CODE GENERATED BY CSS SELECTOR GENERATOR */
/* MEYERWEB CSS RESET */
/* http://meyerweb.com/eric/tools/css/reset/ 
v2.0 | 20110126
License: none (public domain)*/
		 
* {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, 
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
} 
			\n/* MY IDs */${constructSelectors("id", allIds)}
			\n/* MY CLASSes */${constructSelectors("class", allClasses)}`);
	}
	

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('css-selector-generator.generate', async function() {
		try{
		const [htmlFile] = await vscode.window.showOpenDialog({
			openLabel : "Generate Selectors",
			canSelectMany : false,
			title: "CSS Selector Generator",
			filters : {
				"HTML" : ['html', 'htm']
			}
		});
		const data = fs.readFileSync(htmlFile.fsPath, {encoding:'utf8', flag:'r'});
		const [curDoc] = vscode.window.visibleTextEditors;
		const curDocFsPath = curDoc?.document.uri.fsPath;
		curFileContent = fs.readFileSync(curDocFsPath, {encoding:'utf8', flag:'r'})
		
		let output;
		
		if(!curFileContent.includes("{")){
			output = htmlToCss(data)
		}else{
		output = curFileContent + htmlToCss(data, false)
		}
		

		fs.writeFileSync(curDocFsPath, output, )
		
		vscode.window.showInformationMessage('Thanks for using CSS Selector Generator!');
	}catch(error){
		vscode.window.showInformationMessage('No file selected!');
	}

	})

	let initializer = vscode.commands.registerCommand('css-selector-generator.initialize', function () {
		
		barItem.show()
		vscode.window.showInformationMessage('CSS Selector Generator initialized');
	});


	context.subscriptions.push(initializer);
	context.subscriptions.push(disposable);
	
	console.log(context)
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
