srb-software
============

# Install node.js
http://weworkweplay.com/play/raspberry-pi-nodejs/
```
wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
sudo dpkg -i node_latest_armhf.deb
```

# Install phidget stuff
http://www.phidgets.com/docs/OS_-_Linux#Quick_Downloads
```
sudo apt-get install libusb-dev
wget http://www.phidgets.com/downloads/libraries/libphidget.tar.gz
tar zxvf libphidget.tar.gz
cd libphidget*
./configure
make
sudo make install
```

# Install interface stuff
https://github.com/mattiasrunge/srb-software
```
git clone https://github.com/mattiasrunge/srb-software.github
cd srb-software
npm install
cd client 
../node_modules/bower/bin/bower install

```

# Start the system
```
cd srb-software
sudo node server.js
```
