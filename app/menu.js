// @flow
import { Menu, shell, BrowserWindow, dialog } from 'electron';
import fs from 'fs-extra';
import {
	DB_PATH,
	DB_DRIVER_PATH,
	DB_DRIVER,
	DB_DRIVER_ALT,
} from './constants';
import { clearCache } from './database/util';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      this.setupDevelopmentEnvironment();
    }
    const template = this.buildDefaultTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
				label: 'Inspect element',
				click: () => this.mainWindow.inspectElement(x, y)
			}])
			.popup(this.mainWindow);
    });
  }

  buildDefaultTemplate() {
  	const { mainWindow } = this;
    return [{
			label: 'File',
			submenu: [{
				label: 'Select database file',
				click: async () => {
					try {
						const path = await dialog.showOpenDialog(mainWindow, { properties: ['openFile'] });
						if (typeof path !== 'undefined') {
							clearCache();
							const fixedPath = path[0].replace(/^[^C]:\/\/?.+?DSS/,
								'\\\\Omega.dce-eir.net\\NATDFS\\CRA\\HQ\\ABSB\\ABSB_H0E\\GV1\\IRD2\\CTSD\\DSS');
							fs.writeFile(DB_PATH, fixedPath, 'utf-8', e => (
								e ? console.error(e)
									: console.log(`"${fixedPath}" saved as new db path`)
							));
							this.mainWindow.webContents.reload();
						} else console.error('path chosen is undefined');
					} catch (e) {
						console.log(`Error selecting db path: ${e}`);
					}
				}
			}, {
				label: 'Clear cache',
				click: () => {
					clearCache();
					this.mainWindow.webContents.reload();
				}
			}, {
				label: 'Toggle DB Driver',
				click: () => {
					toggleDbDriver();
					this.mainWindow.webContents.reload();
				}
			}]
		}, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true' || process.env.NODE_ENV === 'production') ? [{
        label: '&Reload',
        accelerator: 'Ctrl+R',
        click: () => {
          this.mainWindow.webContents.reload();
        }
      }, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        }
      }, { // todo: remove for prod release
        label: 'Toggle &Developer Tools',
        accelerator: 'Alt+Ctrl+I',
        click: () => {
          this.mainWindow.toggleDevTools();
        }
      }] : [{
				label: '&Reload',
				accelerator: 'Ctrl+R',
				click: () => {
					this.mainWindow.webContents.reload();
				}
			}, {
        label: 'Toggle &Full Screen',
        accelerator: 'F11',
        click: () => {
          this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
        }
      }]
    }];
  }
}

function toggleDbDriver() {
	const dbDriver = fs.readFileSync(DB_DRIVER_PATH, 'utf-8');
	const writeDriver = (driver) => fs.writeFileSync(DB_DRIVER_PATH, driver, 'utf-8');

	switch (dbDriver) {
		case DB_DRIVER: writeDriver(DB_DRIVER_ALT); break;
		case DB_DRIVER_ALT: writeDriver(DB_DRIVER); break;
		default: writeDriver(DB_DRIVER);
	}
	clearCache();
}
