srb-software
============


# Install node.js
# http://weworkweplay.com/play/raspberry-pi-nodejs/
wget http://node-arm.herokuapp.com/node_latest_armhf.deb 
sudo dpkg -i node_latest_armhf.deb


sudo apt-get install libusb-dev
# http://www.phidgets.com/docs/OS_-_Linux#Quick_Downloads
wget http://www.phidgets.com/downloads/libraries/libphidget.tar.gz
wget http://www.phidgets.com/downloads/libraries/phidgetwebservice.tar.gz

tar zxvf libphidget.tar.gz
tar zxvf phidgetwebservice.tar.gz

cd libphidget-2.1.8.20140319
./configure
make
sudo make install
cd ../phidgetwebservice-2.1.8.20140319
./configure
make
sudo make install
