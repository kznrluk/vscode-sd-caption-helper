import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Uri } from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('sd-caption-helper.openview', () => {

		let workspaceUri: vscode.Uri | null = null
		if (vscode.workspace.workspaceFolders) {
			const workspaceFolder = vscode.workspace.workspaceFolders[0];
			workspaceUri = workspaceFolder.uri;
		} else {
			vscode.window.showInformationMessage("For security reasons, only open folders are available for now.")
			return
		}


		const panel = vscode.window.createWebviewPanel(
			'sdImageView',
			'SD Image View',
			vscode.ViewColumn.Beside,
			{
			  enableScripts: true,
			  localResourceRoots: [workspaceUri]
			}
		  );	

		let activeEditorChanged = vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				const filePath = editor.document.uri
				console.log(filePath.toString())
				const imagePath = findImageForTextFile(filePath.fsPath)
				console.log(imagePath)
				if (imagePath) {
					const vsImagePath = vscode.Uri.file(imagePath);
					const imageUri = panel.webview.asWebviewUri(vsImagePath)
					panel.webview.html = getWebviewContent(imageUri);
				}
			}
		})
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(path: Uri): string {
  return `
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<style>
			body {
				margin: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				height: 100vh;
			}
			img {
				max-width: 100%;
				max-height: 100%;
				object-fit: contain;
			}
		</style>
	</head>
	<body>
		<img src="${path}">
	</body>
	</html>`;
}


function findImageForTextFile(textFilePath: string): string | null {
	const supportedImageExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.ico', '.webp'];
	const dirPath = path.dirname(textFilePath);
	const fileNameWithoutExt = path.basename(textFilePath, path.extname(textFilePath));
	
	try {
	  const files = fs.readdirSync(dirPath);
	  for (const file of files) {
		const fileExt = path.extname(file);
		const fileName = path.basename(file, fileExt);
		if (fileName === fileNameWithoutExt && supportedImageExtensions.includes(fileExt)) {
		  return path.join(dirPath, file);
		}
	  }
	} catch (err) {
	  console.error(err);
	}
	
	return null;
  }
  