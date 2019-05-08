#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import json, csv
import ctypes
import platform
import datetime

import constants

def read_station_code(current_path, fname):
    global STATION_CODE
    STATION_CODE = {}
    new_path = os.path.join(current_path, 'template', fname)
    f = open(new_path, 'r', encoding='utf-8')
    if fname.lower().endswith('.json'):
        station_data = json.load(f)
        for d in station_data:
            areaCode = int(d['areaCode'], 16)
            lineCode = int(d['lineCode'], 16)
            stationCode = int(d['stationCode'], 16)
            STATION_CODE[(areaCode, lineCode, stationCode)] \
                = (d['lineName'], d['stationName'])
    elif fname.lower().endswith('.csv'):
        station_data = csv.reader(f)
        for d in station_data:
            STATION_CODE[(int(d[0]), int(d[1]), int(d[2]))] = (d[4], d[5])

def read_felica():
    flib = ctypes.cdll.felicalib

    # flib.pasori_open.restype = c_void_p
    pasori = flib.pasori_open()

    flib.pasori_init(pasori)

    # flib.felica_polling.restype = c_void_p
    felica = flib.felica_polling(pasori, constants.POLLING_SUICA, 0, 0)

    if felica == 0:
        return None

    raw_data = []
    d = ctypes.create_string_buffer(16)
    i = 0
    while flib.felica_read_without_encryption02(felica, constants.SERVICE_SUICA, 0, i, d) == 0:
        bin_data_str = ctypes.string_at(ctypes.pointer(d), 16)
        if bin_data_str[4] == bin_data_str[5] == 0x00:
            break
        raw_data.append(bin_data_str)
        i += 1

    flib.pasori_close(pasori)

    return raw_data

def parse_data(raw_data):
    data = []
    prev = -1
    for d in reversed(raw_data):
        result = parse_record(d, prev)
        prev = result['balance']
        data.insert(0, result)
    return data

def parse_record(d, prev):
    # r_terminal = d[0]
    r_process = d[1]
    r_date = d[4:6]
    r_in_line = d[6]
    r_in_sta = d[7]
    r_out_line = d[8]
    r_out_sta = d[9]
    r_balance = d[10:12]
    r_region = d[15]

    year = (r_date[0] >> 1) + 2000
    month = ((r_date[0] & 1) << 3) + (r_date[1] >> 5)
    day = r_date[1] & (1 << 5) - 1
    date = '{:%Y/%m/%d}'.format(datetime.date(year, month, day))

    balance = int.from_bytes(r_balance, byteorder='little')
    charge = prev - balance if prev >= 0 else 0

    # terminal = constants.TERMINAL[r_terminal] if r_terminal in constants.TERMINAL else '不明'
    process = constants.PROCESS[r_process] if r_process in constants.PROCESS else '不明'

    in_line = in_sta = out_line = out_sta = ''

    # if r_process in constants.SALE_OF_GOODS:
    #     hour = r_in_line >> 3
    #     min = ((r_in_line & 7) << 3) + (r_in_sta >> 5)
    #     sec = (r_in_sta & 0x1f) << 1
    #     print('%02d時%02d分%02d秒' % (hour, min, sec), end=' ')
    # elif r_process in constants.BUS:
    #     r_out_line = d[6:8]
    #     r_out_sta = d[8:10]
    #     print('バス', end=' ')
    # elif r_in_line not in (0xc7, 0xc8, 0x05):
    if r_process not in (constants.SALE_OF_GOODS + constants.BUS) and r_in_line not in (0xc7, 0xc8, 0x05):
        r_in_area = (r_region & 0x30) >> 4
        r_out_area = r_region >> 6
        
        in_value = STATION_CODE.get((r_in_area, r_in_line, r_in_sta))
        in_line, in_sta = (in_value[0], in_value[1]) if in_value is not None else ('不明', '不明')

        if not (r_out_area == r_out_line == r_out_sta == 0):
            out_value = STATION_CODE.get((r_out_area, r_out_line, r_out_sta))
            out_line, out_sta = (out_value[0], out_value[1]) if out_value is not None else ('不明', '不明')

    return {
        'id': d.hex(),
        'date': date,
        'in_line': in_line,
        'in_sta': in_sta,
        'out_line': out_line,
        'out_sta': out_sta,
        'charge': charge,
        'balance': balance,
        'process': process,
        'memo': '',
        'is_saved': False,
        'created_at': datetime.datetime.now()
    }

def read_card(current_path):
    # read_station_code('station_data.json')
    read_station_code(current_path, 'StationCode.csv')
    if (platform.system() == 'Windows'):
        raw_data = read_felica()
    else:
        # TODO: update below function for Linux and MacOS
        raw_data = read_felica()
    return [] if not raw_data else parse_data(raw_data)
