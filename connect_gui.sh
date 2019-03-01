#!/bin/bash

INSTANCE_IP=$1
LOCAL_PORT=5902
PASSWORD="btsarmy"

echo "setting up vncserver"
ssh -i ~/.ssh/amazon.pem ubuntu@${INSTANCE_IP} <<EOF1
expect <<EOF
spawn vncserver
expect "Password:"
send "$PASSWORD\r"
expect "Verify:"
send "$PASSWORD\r"
expect eof
exit
EOF
EOF1


echo "editing vncserver startup config"
ssh -i ~/.ssh/amazon.pem ubuntu@${INSTANCE_IP} <<EOF1
cat >~/.vnc/xstartup <<EOF
#!/bin/sh
# Uncomment the following two lines for normal desktop:
unset SESSION_MANAGER
# exec /etc/X11/xinit/xinitrc
unset DBUS_SESSION_BUS_ADDRESS
startxfce4 &
[ -x /etc/vnc/xstartup ] && exec /etc/vnc/xstartup
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources
xsetroot -solid grey
vncconfig -iconic &
gnome-panel &
gnome-settings-daemon &
metacity &
nautilus &
gnome-terminal &
EOF
EOF1

echo "starting vncserver"
ssh -i ~/.ssh/amazon.pem ubuntu@${INSTANCE_IP} 'vncserver -geometry 2560x1600'

echo "==================================================="
echo "Setting up port forwarding on localhost:$LOCAL_PORT"
echo "Connect to remote desktop with a vnc client (Screen Sharing on mac)"
echo "PASSWORD: btsarmy"
echo "==================================================="
ssh -L ${LOCAL_PORT}:localhost:5902 -i ~/.ssh/amazon.pem ubuntu@${INSTANCE_IP}
