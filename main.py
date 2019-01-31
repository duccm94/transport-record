#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import csv
import pandas as pd
from pandas import DataFrame, read_csv
from pandas.io.excel import ExcelWriter
from openpyxl import load_workbook
from copy import copy

# member_card_list = {
#     "01120312E418BA0E": "Duc",
#     "01010114711A161C": "Hung",
#     "0101011459180432": "Thao",
# }

TEMPLATE_FILE_NAME = 'Expense report（〇〇〇).xlsx'

if __name__ == "__main__":
    if len(sys.argv) > 2:
        input_file_path = sys.argv[1]
        output_file_path = sys.argv[2]

        with open(input_file_path, 'r', encoding='shift-jis') as csv_file:
            card_id_raw = [r for r in csv.reader(csv_file)][0][0]
            card_id = card_id_raw.partition('ID=')[2]

        df_in = read_csv(input_file_path, skiprows=2, encoding='shift-jis')

        # df_out = read_excel(output_file_path,
        #     sheet_name="Domestic Expense (JPY)", skiprows=4,
        #     usecols="B:E", header=None)

        # df_out.loc[0, 1] = '10'

        # print(df_out)

        # excelFileName = member_card_list.get(card_id, 'MemberNotFound')
        # writer = ExcelWriter(output_file_path, engine='xlsxwriter')
        # df_in.to_excel(writer, sheet_name='Sheet1')

        # worksheet = writer.sheets['Sheet1']
        # worksheet.set_column('B:K', 18)
        # worksheet.set_column('A:A', 5)
        # worksheet.set_column('C:C', 8)
        # worksheet.set_column('F:F', 8)

        # writer.save()

        # wb = load_workbook(output_file_path)
        current_path = os.path.dirname(os.path.realpath(__file__))
        template_path = os.path.join(current_path, 'resources', 'template', TEMPLATE_FILE_NAME)
        wb = load_workbook(template_path)
        ws = wb["Domestic Expense (JPY)"]

        i = 0
        for index, row in df_in.iterrows():
            if row[7] <= 0:
                continue
            # insert 1 row and format
            # ws.insert_rows(5, 1)
            # for c in list(map(chr, range(ord('A'), ord('L')+1))):
            #     from_cell = ws[c+'6']
            #     to_cell = ws[c+'5']
            #     to_cell._style = copy(from_cell._style)
            #     to_cell.value = from_cell.value

            ws.cell(row=5+i, column=2).value = row[0]
            ws.cell(row=5+i, column=3).value = "バス" if pd.isna(row[3]) and pd.isna(row[6]) and "ﾊﾞｽ" in row[9] \
                else "{0} から {1} まで".format(row[3], row[6])
            ws.cell(row=5+i, column=5).value = row[7]
            i += 1

        # wb.save(output_file_path)
        wb.save(os.path.join(os.path.dirname(input_file_path), TEMPLATE_FILE_NAME))

        print('Success')
        sys.stdout.flush()
