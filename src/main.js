require('./configs/initializes')

const { app, BrowserWindow } = require('electron')
const { execFile } = require('child_process')
const path = require('path')
const { enableLiveReload } = require('electron-compile')

let mainWindow

global.isDevMode = process.execPath.match(/[\\/]electron/)

if (isDevMode) enableLiveReload()

const createWindow = async () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
    })

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`)
    // mainWindow.loadFile(path.join(__dirname, 'index.html'))

    // Open the DevTools.
    if (isDevMode) {
        mainWindow.webContents.openDevTools()

        // Emitted when the window is closed.
        mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null
        })
    } else {
        let exePath = path.resolve(__dirname, '../dist/main.exe')
        let child = execFile(exePath, function(err, data) {
            if (err) {
                console.log(err)
            }
        })

        mainWindow.on('closed', () => {
            mainWindow = null
            child.kill('SIGINT')
        })
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
require(MAIN_PROCESS_DIR)
