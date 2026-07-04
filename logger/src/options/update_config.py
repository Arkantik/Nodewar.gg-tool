import urllib.request
from .. import config
from . import status_check

def update_config():
    urllib.request.urlretrieve("https://github.com/Arkantik/ikusa_logger/blob/main/config.ini", "config.ini")
    config.init()
    if(status_check.is_outdated()):
        print("The config is still outdated. Please update it manually.", flush=True)
    else:
        print("The config was updated successfully.", flush=True)
    