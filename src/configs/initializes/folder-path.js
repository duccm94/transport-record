const path = require('path')

global.SRC_DIR = path.join(__dirname, '../../')

global.MAIN_PROCESS_DIR = path.join(SRC_DIR, 'main-process')
// global.HELPER_DIR = path.join(SRC_DIR, 'helpers')
global.CONFIG_DIR = path.join(SRC_DIR, 'configs')
global.VIEW_DIR = path.join(SRC_DIR, 'views')
global.ASSET_DIR = path.join(SRC_DIR, 'assets')
// global.MODEL_DIR = path.join(SRC_DIR, 'models')
