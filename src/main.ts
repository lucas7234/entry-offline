import {
    app,
    Menu,
    ipcMain,
    NamedEvent,
} from 'electron';
import HardwareWindowManager from './main/views/hardwareWindowManager';
import MainWindowManager from './main/views/mainWindowManager';
import AboutWindowManager from './main/views/aboutWindowManager';
import root from 'window-or-global';
import parseCommandLine from './main/utils/functions/parseCommandLine';

import('./main/ipcMainHelper');
import('./main/utils/functions/globalShortCutRegister');

const option = parseCommandLine(process.argv.slice(1));

root.sharedObject = {
    roomId: '',
    mainWindowId: '',
    workingPath: '',
    isInitEntry: false,
    initProjectPath: option.file,
    appName: 'entry',
    hostURI: option.hostURI,
    hostProtocol: option.hostProtocol,
};

app.on('window-all-closed', function() {
    app.quit();
    process.exit(0);
});

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.commandLine.appendSwitch("disable-renderer-backgrounding");

    app.once('ready', () => {
        const mainWindow = new MainWindowManager(option);
        const hardwareWindow = new HardwareWindowManager();
        const aboutWindow = new AboutWindowManager(mainWindow.window);

        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // 어플리케이션을 중복 실행했습니다. 주 어플리케이션 인스턴스를 활성화 합니다.
            const option = parseCommandLine(commandLine);

            if (mainWindow) {
                mainWindow.activateWindow();
                mainWindow.loadProjectFromPath(option.file);
            }
        });

        app.on('open-file', function(event, pathToOpen) {
            if (process.platform === 'darwin') {
                option.file = pathToOpen;
                if (mainWindow) {
                    mainWindow.loadProjectFromPath(pathToOpen);
                }
            }
        });

        ipcMain.on('forceClose', () => {
            mainWindow.close({ isForceClose : true });
        });

        ipcMain.on('reload', function(event: NamedEvent, arg: any) {
            if (event.sender.name !== 'entry') {
                return hardwareWindow.reloadHardwareWindow();
            }

            if (event.sender) {
                if (process.platform === 'darwin') {
                    const menu = Menu.buildFromTemplate([]);
                    Menu.setApplicationMenu(menu);
                } else {
                    mainWindow.window && mainWindow.window.setMenu(null);
                }
                event.sender.reload();
            }
        });

        ipcMain.on('openHardwareWindow', function(event: Electron.Event, arg: any) {
            hardwareWindow.openHardwareWindow();
        });

        ipcMain.on('openAboutWindow', function(event: Electron.Event, arg: any) {
            aboutWindow.openAboutWindow();
        });

        ipcMain.on('closeAboutWindow', function(event: Electron.Event, arg: any) {
            aboutWindow.closeAboutWindow();
        });
    });

    ipcMain.on('roomId', function(event: Electron.Event, arg: any) {
        event.returnValue = root.sharedObject.roomId;
    });

    ipcMain.on('version', function(event: Electron.Event, arg: any) {
        event.returnValue = '99';
    });

    ipcMain.on('serverMode', function(event: Electron.Event, mode: string) {
        event.sender.send('serverMode', mode);
    });
}