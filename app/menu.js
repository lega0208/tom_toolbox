// @flow
import { app, Menu, shell, BrowserWindow, dialog } from 'electron';
import fs from 'fs';
import { DB_PATH, LAST_CACHE, CACHE_FILE } from './constants';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    // if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    //   this.setupDevelopmentEnvironment();
    // }
	  this.setupDevelopmentEnvironment(); // while I'm still working on it, so I can debug prod

    const template = this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu
        .buildFromTemplate([{
          label: 'Inspect element',
          click: () => {
            this.mainWindow.inspectElement(x, y);
          }
        }])
        .popup(this.mainWindow);
    });
  }

  buildDefaultTemplate() {
  	const mainWindow = this.mainWindow;
    return [{
			label: 'File',
			submenu: [{
				label: 'Select database file',
				click: async () => {
					try {
						const path = await dialog.showOpenDialog(mainWindow, {properties: ['openFile']});
						if (typeof path !== 'undefined') {
							const fixedPath = path[0].replace(/^[^C]:\/\/?.+?DIRECTORATE_SERVICES/,
								'\\\\OMEGA\\NATDFS\\CRA\\HQ\\ABSB\\ABSB_H0E\\GV1\\IRD\\SPCI\\DIRECTORATE_SERVICES');
							fs.writeFile(DB_PATH, fixedPath, 'utf-8',
									e => e ? console.error(e) : console.log(`"${fixedPath}" saved as new db path`));
							this.mainWindow.webContents.reload();
						} else console.error('path chosen is undefined');
					} catch (e) {
						console.log('Error selecting db path: ' + e);
					}
				}
			}, {
				label: 'Clear cache',
				click: () => {
					fs.writeFileSync(CACHE_FILE, '', 'utf-8');
					fs.writeFileSync(LAST_CACHE, '', 'utf-8');
					this.mainWindow.webContents.reload();
				}
			}]
		}, {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
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
      }, {
				label: 'Toggle &Developer Tools',
				accelerator: 'Alt+Ctrl+I',
				click: () => {
					this.mainWindow.toggleDevTools();
				}
			}]
    }, {
      label: 'Help',
      submenu: [{
        label: 'Documentation',
        click() {
          shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
        }
      }]
    }];
  }
}
