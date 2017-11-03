const fs = require('fs');

export default {
	/**
	 * 遍历某个文件夹
	 */
	function scanFolder(folderPath, callback) {
		let idx = arguments[2] == undefined ? 1 : arguments[2];
		if(!fs.statSync(folderPath).isDirectory()) callback(folderPath, idx);
		else {
			fs.readdirSync(folderPath).forEach(function(file) {
				var tempPath = folderPath + '/' + file;  
				if(fs.statSync(tempPath).isDirectory()) scanFolder(tempPath, callback, idx+1);
				else callback(tempPath, idx);
			});
		}
	},
	/**
	 * 获取某个文件夹下的所有文件
	 */
	function getFileList(folderPath, isIgnoreFolder) {
		isIgnoreFolder = isIgnoreFolder == undefined ? true : isIgnoreFolder;
		let fileList = [];
		if(fs.statSync(folderPath).isDirectory()) {
			if(!isIgnoreFolder) fileList.push(folderPath);
			fs.readdirSync(folderPath).forEach(function(file) {
				fileList = fileList.concat(this.getFileList(folderPath + '/' + file, isIgnoreFolder));
			});
		}
		else fileList.push(folderPath);
		return fileList;
	}
}