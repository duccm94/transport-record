const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const { execFile } = require('child_process')
const path = require('path')

let mainWindow
let inputFilePath, outputFilePath

function showInputDialog(event) {
    dialog.showOpenDialog({
        title: 'Select Transport Record File',
        filters: [
            { name: 'Transport Record CSV File Type', extensions: ['csv'] }
        ],
        properties: ['openFile']
    }, (filePaths) => {
        if (Array.isArray(filePaths) && filePaths.length) {
            inputFilePath = outputFilePath = filePaths.join(",")
            event.sender.send('show-input-path', inputFilePath)
        }
    })
}

function showOutputDialog(event) {
    dialog.showOpenDialog({
        title: 'Select Expense Report File',
        filters: [
            { name: 'Expense Report Excel File Type', extensions: ['xlsx'] }
        ],
        properties: ['openFile']
    }, (filePaths) => {
        if (Array.isArray(filePaths) && filePaths.length) {
            outputFilePath = filePaths.join(",")
            event.sender.send('show-output-path', outputFilePath)
        }
    })
}

function callPythonConvert() {
    let exePath = path.resolve(__dirname, '../dist/main.exe')
    
    execFile(exePath, [inputFilePath, outputFilePath], function(err, stdout, stderr) {
        if (err || stderr) {
            dialog.showErrorBox('File In Use',
                `The action can't be completed because the file is open in another program
Close the file and try again.`)
        }

        if (stdout) {
            dialog.showMessageBox({
                type: 'info',
                title: 'Convert Successful',
                message: 'Transport Record file has been converted successful to Expense Report file.'
            })
        }
    })

    // let options = {
    //     args: [filePaths.join(",")]
    // }
    // PythonShell.run('main.py', options, function (err) {
    //     console.log(err)
    // })
}

app.on('ready', function () {
    mainWindow = new BrowserWindow({width: 600, height: 250})
    mainWindow.loadFile(path.join(__dirname, 'index.html'))

    ipcMain.on('input-button-click', (event) => {
        showInputDialog(event)
    })

    ipcMain.on('output-button-click', (event) => {
        showOutputDialog(event)
    })

    ipcMain.on('convert-button-click', () => {
        if (!inputFilePath) {
            dialog.showErrorBox('Input file not selected', 'Please choose Transport Record CSV File Type!')
            return
        }
        // if (!outputFilePath) {
        //     dialog.showErrorBox('Output file not selected', 'Please choose Expense Report Excel File Type!')
        //     return
        // }
        callPythonConvert()
    })
})

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit()
    }
})
