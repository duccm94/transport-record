const { ipcMain, dialog } = require('electron')
const axios = require('axios')

ipcMain.on('save_records', async function(event, records) {
    try {
        const response = await axios.post('http://127.0.0.1:5000/save_records', {
            records: records
        })
        if (response.status >= 200 && response.status < 300) {
            if (response.data.status === 'success') {
                dialog.showMessageBox({
                    type: 'info',
                    title: 'Save Successful',
                    message: 'Selected Transport records has been saved successful.'
                })
            }
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    } catch (error) {
        console.log('request failed', error)
    }
})

ipcMain.on('delete_record', async function(event, record_id) {
    try {
        const response = await axios.delete('http://127.0.0.1:5000/delete_record/' + record_id)
        if (response.status >= 200 && response.status < 300) {
            if (response.data.status === 'success') {
                event.sender.send('delete-record-success', record_id)
            }
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    } catch (error) {
        console.log('request failed', error)
    }
})

ipcMain.on('export_records', async function(event, exportDirectory, records) {
    try {
        const response = await axios.post('http://127.0.0.1:5000/export_records', {
            export_directory: exportDirectory,
            records: records
        })
        if (response.status >= 200 && response.status < 300) {
            if (response.data.status === 'success') {
                dialog.showMessageBox({
                    type: 'info',
                    title: 'Export Successful',
                    message: 'Transport records has been converted successful to Expense Report file.'
                })
            }
        } else {
            var error = new Error(response.statusText)
            error.response = response
            throw error
        }
    } catch (error) {
        console.log('request failed', error)
    }
})

ipcMain.on('directory-button-click', (event) => {
    showDirectoryDialog(event)
})

function showDirectoryDialog(event) {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, (directory) => {
        if (Array.isArray(directory) && directory.length) {
            let save_directory = directory.join(",")
            event.sender.send('show-directory-path', save_directory)
        }
    })
}
