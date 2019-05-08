const $ = require('jquery')
require('datatables.net-bs4')( window, $ )
require('datatables.net-select-bs4')( window, $ )
const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote

let exportDirectory

ipcRenderer.on('show-record-data', (event, isReadCard, data) => {
    if (isReadCard) {
        $('#action-column-header')[0].style.display = 'none'
        $('#export-form')[0].style.display = 'none'
        $('#save-button').text('Save selected records')
    }

    let table = $('#data-table').DataTable({
        dom: isReadCard ? "lfrtip" :
        "<'row'<'col-sm-12 col-md-4'l><'#month-select-div.col-sm-12 col-md-3'><'col-sm-12 col-md-5'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        data: data,
        columns: [
            { 'data': 'date' },
            { 'data': 'in_line' },
            { 'data': 'in_sta' },
            { 'data': 'out_line' },
            { 'data': 'out_sta' },
            { 'data': 'charge' },
            { 'data': 'balance' },
            { 'data': 'process' },
            {
                'data': 'memo',
                'render': function (data, type, row, meta) {
                    return '<input type="text" value="' + data + '"/>'
                }
            },
            ... isReadCard ? [] : [{
                'data': null,
                'defaultContent': '<button class="btn btn-danger delete-button" type="button">Delete</button>'
            }]
        ],
        order: [[0, 'desc']],
        rowId: 'id',
        select: {
            style: isReadCard ? 'multi' : false,
            selector: isReadCard ? 'td:not(:last-child)' : false
        },
        paging: isReadCard ? false : true
    })

    table.on('user-select', function (e, dt, type, cell, originalEvent) {
        var row = dt.row(cell.index().row)
        if (row.data().charge <= 0) {
            e.preventDefault()
        }
    })

    $('#month-select-div').html(`
        <select id="month-select" class="custom-select" required>
            <option value="" selected>Choose month</option>
        </select>
    `)
    let distinctMonths = [...new Set(data.map(d => d.date.substring(0, 7)))]
    distinctMonths.forEach(function(value) {
        $('#month-select').append('<option value="'+value+'">'+value+'</option>')
    })
    $('#month-select').on('change', function () {
        table.column(0).search(this.value).draw()
    })

    $('#save-button').on('click', () => {
        let records = []
        $.map(table.rows({ selected: isReadCard ? true : undefined}).data(), function (item) {
            let memoVal = $('tr#' + item.id).find('td:eq(8) input').val()
            item.memo = memoVal ? memoVal.replace(/\s+/g, ' ').trim() : ''
            records.push(item)
        })
        ipcRenderer.send('save_records', records)
    })

    $('#export-button').on('click', () => {
        if (!exportDirectory) {
            dialog.showErrorBox('Export directory not selected', 'Please choose where to save Excel Transport Record file.')
            return
        }
        let records = []
        $.map(table.rows({search: 'applied'}).data(), function (item) {
            let memoVal = $('tr#' + item.id).find('td:eq(-2) input').val()
            item.memo = memoVal ? memoVal.replace(/\s+/g, ' ').trim() : ''
            records.push(item)
        })
        ipcRenderer.send('export_records', exportDirectory, records)
    })

    table.on('click', '.delete-button', function () {
        dialog.showMessageBox({
            type: 'warning',
            title: 'Do you want to delete this record?',
            message: 'This will be permanently deleted.',
            buttons: ['Delete', 'Cancel'],
            noLink: true,
            defaultId: 1,
            cancelId: 1
        }, (response) => {
            if (response === 1) {
                return
            }
            let parent_tr = $(this).closest('tr')
            let record_id = parent_tr.attr('id')
            ipcRenderer.send('delete_record', record_id)
            ipcRenderer.on('delete-record-success', (event, id) => {
                if (record_id === id) {
                    table.row(parent_tr).remove().draw(false)
                }
            })
        })
    })
})

$('#directory-button').on('click', () => {
    ipcRenderer.send('directory-button-click')
})

ipcRenderer.on('show-directory-path', (event, data) => {
    exportDirectory = data
    $('#directory-field').val(data)
})
