import os
import shutil
import urllib.error
import urllib.request
from .. import config
from . import status_check

CONFIG_URL = "https://raw.githubusercontent.com/Arkantik/Nodewar.gg-tool/main/config.ini"

def update_config():
    backup_path = None
    if os.path.isfile("config.ini"):
        backup_path = "config.ini.bak"
        shutil.copyfile("config.ini", backup_path)

    try:
        urllib.request.urlretrieve(CONFIG_URL, "config.ini")
    except (urllib.error.URLError, OSError) as e:
        print("Failed to download the config update.", flush=True)
        print(e, flush=True)
        if backup_path:
            shutil.copyfile(backup_path, "config.ini")
        return

    config.init()
    if config.config.invalid:
        print("The downloaded config is invalid.", flush=True)
        if backup_path:
            shutil.copyfile(backup_path, "config.ini")
            config.init()
        return

    if(status_check.is_outdated()):
        print("The config is still outdated. Please update it manually.", flush=True)
    else:
        print("The config was updated successfully.", flush=True)
