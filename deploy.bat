
copy index.html.gz C:\Users\techboy\Documents\GitHub\MarlinD6500\data\www
cd C:\Users\techboy\Documents\GitHub\MarlinD6500
"C:\Users\techboy\.platformio\penv\Scripts\platformio.exe" run --target buildfs --environment D6500 
cd %~dp0
cd ESPFlasher
esptool --chip esp32 --port COM3 --baud 921600 --before default_reset --after hard_reset write_flash -z --flash_mode dio --flash_freq 80m --flash_size 4MB 0x290000 C:\Users\techboy\Documents\GitHub\MarlinD6500\.pio\build\D6500\spiffs.bin
