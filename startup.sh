#!/bin/bash

EVENT_URL=https://www1.ticketmaster.com/bts-world-tour-love-yourself-speak-yourself/event/0B00564FEB3D3A72

send_to_slack() {
    curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$1\"}" https://hooks.slack.com/services/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
}

INSTANCE_ID=$(curl http://169.254.169.254/latest/meta-data/instance-id)
IP_ADDRESS=$(curl http://169.254.169.254/latest/meta-data/public-ipv4)

STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www1.ticketmaster.com/bts-world-tour-love-yourself-speak-yourself/event/0B00564FEB3D3A72)
if [ "$STATUS_CODE" = "401" ]; then
    send_to_slack "$INSTANCE_ID: IP $IP_ADDRESS is BLOCKED by ticketmaster.  Shutting down."
    sudo shutdown -h now as true
else
    send_to_slack "$INSTANCE_ID: IP $IP_ADDRESS is NOT blocked by ticketmaster!  Starting." as true
fi

#install dependencies
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" dist-upgrade
sudo apt-get install ubuntu-desktop -y
sudo apt-get install gnome-panel -y
sudo apt-get install gnome-settings-daemon -y
sudo apt-get install metacity -y
sudo apt-get install nautilus -y
sudo apt-get install gnome-terminal -y
sudo apt-get install xfce4 -y
sudo apt-get install vnc4server -y
sudo apt-get install expect -y
sudo apt-get install awscli -y

#install chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
#
# #installing python dependencies
# sudo apt-get install python-pip python-dev build-essential -y
# sudo pip install --upgrade pip
# sudo pip install selenium
#
# #install and start chromedriver
# wget https://chromedriver.storage.googleapis.com/72.0.3626.69/chromedriver_linux64.zip
# sudo unzip chromedriver_linux64.zip -d /usr/local/bin
# sudo chmod +x /usr/local/bin/chromedriver
#
#
#get js script
sudo aws s3 cp s3://btsarmyticketbot/script.js /home/ubuntu/Documents
echo -e "var publicIp = \"$IP_ADDRESS\"" | sudo tee -a /home/ubuntu/Documents/script.js
#
# #open in chrome
# send_to_slack "$INSTANCE_ID: Starting chrome"
#
# cat >~/.vnc/xstartup <<EOF
# <!DOCTYPE html>
# <html>
# <body>
# <style>
# html, body {height:100%;width:100%;overflow:hidden}
# iframe {height:100%;width:100%}
# </style>
#     <script src="https://unpkg.com/@ungap/custom-elements-builtin"></script>
#     <script type="module" src="https://unpkg.com/x-frame-bypass"></script>
#     <script src="https://code.jquery.com/jquery-2.1.3.min.js"></script>
#     <iframe id ='myframe' is="x-frame-bypass" src="$EVENT_URL"></iframe>
#     <script instance-id="$INSTANCE_ID" public-ip="$IP_ADDRESS" src="script.js"></script>
# </body>
# </html>
# EOF
#
# DISPLAY=:2.0 google-chrome /usr/local/bin/index.html

send_to_slack "$INSTANCE_ID: Finished setting up instance with public IP $IP_ADDRESS"
