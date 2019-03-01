#python script
# DISPLAY=:2.0 python <<EOF
# import time
# import urllib2
# from selenium import webdriver
# from selenium.webdriver.chrome.options import Options
#
# options = Options()
# options.add_argument('--no-sandbox')
# options.add_argument('--disable-dev-shm-usage')
# options.add_argument('--start-maximized')
#
# driver = webdriver.Chrome(executable_path='/usr/local/bin/chromedriver', chrome_options=options)
# driver.get("https://www1.ticketmaster.com/bts-world-tour-love-yourself-speak-yourself/event/0B00564FEB3D3A72")
# time.sleep(1)
# driver.execute_script("var s=window.document.createElement('script');\
#   s.src='https://code.jquery.com/jquery-2.1.3.min.js';\
#   window.document.head.appendChild(s);");
# time.sleep(1)
# driver.execute_script("var s=window.document.createElement('script');\
#     s.src='/usr/local/bin/script.js';\
#     window.document.head.appendChild(s);");
# # driver.execute_script(open("/usr/local/bin/script.js").read())
# EOF
