/**
 * 各种node端方法合集
 */

const fs = require('fs');
const {exec} = require('child_process');

export default {
	/**
	 * 遍历某个文件夹
	 * @param {*} folderPath 文件夹路径
	 * @param {*} callback 回调函数
	 */
	scanFolder(folderPath, callback) {
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
	 * @param {*} folderPath 要遍历的文件夹路径
	 * @param {*} isIgnoreFolder 是否忽略文件夹
	 */
	getFileList(folderPath, isIgnoreFolder) {
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
	},
	/**
	 * 同步创建多层文件夹
	 * @param 文件夹路径，必须是“/”分隔，如：res/css/bootstrap
	 * @param 模式，可选
	 */
	mkdirsSync(dirpath, mode) {
		if (fs.existsSync(dirpath)) return true;
		var temp = '', sep = '/';
		dirpath.split(sep).forEach(function(dirname)
		{
			temp += (temp ? sep : '') + dirname;
			console.log(temp);
			if (fs.existsSync(temp)) return;
			if (!fs.mkdirSync(temp, mode)) return false;
		});
		return true;
	},
	copyFileOrDirectory(src, dest, cb) {
		exec(`cp -r ${src} ${dest}`, (error, stdout, stderr) => {
			if(error) {
				console.error(`exec error: ${error}`);
				return;
			}
			if (cb) cb();
		});
	}
}