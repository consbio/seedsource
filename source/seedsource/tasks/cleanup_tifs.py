from seedsource_project import settings
import os
import os.path
import time
import re
from celery.task import task

@task
def cleanup_temp_tif_files(age=7200):
    tempDir = settings.NC_TEMPORARY_FILE_LOCATION
    cutoff = time.time() - age
    files = os.listdir(tempDir)
    for file in files:
        if re.search('.tif$', file):
            path = os.path.join(tempDir, file)
            if os.path.getctime(path) < cutoff:
                try:
                    os.remove(path)
                except:
                    pass
