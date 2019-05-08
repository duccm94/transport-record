require('../configs/initializes')

const { ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const axios = require('axios')

ipcMain.on('convert-button-click', () => {
    getRecordData(true)
})

ipcMain.on('history-button-click', () => {
    getRecordData(false)
})

async function getRecordData(isReadCard = true) {
    try {
        const response = await axios.get('http://127.0.0.1:5000/' + (isReadCard ? 'read_card' : 'get_history'))
        if (response.status >= 200 && response.status < 300) {
            if (response.data.status === 'success') {
                openTableWindow(isReadCard, response.data.content)
            }
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    } catch (error) {
        console.log('request failed', error)
    }

    // let options = {
    //     args: [directory.join(",")]
    // }
    // PythonShell.run('main.py', options, function (err) {
    //     console.log(err)
    // })
}

function openTableWindow(isReadCard, data) {
    let tableWindow = new BrowserWindow()
    tableWindow.maximize()
    tableWindow.loadURL(path.join(VIEW_DIR, 'data-table.html'))

    // Open the DevTools.
    if (isDevMode) {
        tableWindow.webContents.openDevTools()
    }

    tableWindow.webContents.on('did-finish-load', () => {
        tableWindow.webContents.send('show-record-data', isReadCard, data)
    })
}
