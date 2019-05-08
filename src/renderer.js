const $ = require('jquery')
const { ipcRenderer } = require('electron')

$(document).ready(() => {
    setTimeout(() => {
		$('body').addClass('loaded')
	}, 3000)
})

document.getElementById('convert-button').addEventListener('click', () => {
    ipcRenderer.send('convert-button-click')
})

document.getElementById('history-button').addEventListener('click', () => {
    ipcRenderer.send('history-button-click')
})
