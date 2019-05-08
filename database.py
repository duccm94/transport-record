import os
import platform
from pysqlite3 import dbapi2 as sqlite3

from os import path
from flask import g

import constants

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(get_db_path(),
            detect_types=sqlite3.PARSE_DECLTYPES|sqlite3.PARSE_COLNAMES)
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    db = get_db()
    cur = db.cursor()
    tb_exists = "SELECT name FROM sqlite_master WHERE type='table' AND name='record'"
    cur.execute(constants.PRAGMA_KEY)
    if not cur.execute(tb_exists).fetchone():
        tb_create = '''CREATE TABLE record
            (id text primary key, date text, in_line text, in_sta text, out_line text, out_sta text,
            charge integer, balance integer, process text, memo text, is_saved bool, created_at timestamp)'''
        cur.execute(constants.PRAGMA_KEY)
        cur.execute(tb_create)
        db.commit()

def get_db_path():
    if (platform.system() == 'Windows'):
        app_data_path = path.join(path.expandvars('%LOCALAPPDATA%'), constants.APP_NAME)
    else:
        # TODO: for Linux and MacOS
        print()
    if not path.exists(app_data_path):
        os.makedirs(app_data_path, exist_ok=True)
    return path.join(app_data_path, 'data.sqlite')

def init_app(app):
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()
