import fs from 'node:fs';
import Logger from './logger';

const unlinkLocalFilePath = (localFilePath: string) => {
	if (fs.existsSync(localFilePath)) {
		fs.unlinkSync(localFilePath);
		Logger.info(`Temp file removes: ${localFilePath}`);
	}
};

export default unlinkLocalFilePath;
