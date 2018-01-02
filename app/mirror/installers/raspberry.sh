#!/usr/bin/env bash

# This is an installer script for ReactiveMirror. It works well enough
# that it can detect if you have Node installed, run a binary script
# and then download and run ReactiveMirror

echo -e "\e[0m"
echo ' /$$$$$$$                                  /$$     /$$                     '
echo '| $$__  $$                                | $$    |__/                     '
echo '| $$  \ $$  /$$$$$$   /$$$$$$   /$$$$$$$ /$$$$$$   /$$ /$$    /$$  /$$$$$$ '
echo '| $$$$$$$/ /$$__  $$ |____  $$ /$$_____/|_  $$_/  | $$|  $$  /$$/ /$$__  $$'
echo '| $$__  $$| $$$$$$$$  /$$$$$$$| $$        | $$    | $$ \  $$/$$/ | $$$$$$$$'
echo '| $$  \ $$| $$_____/ /$$__  $$| $$        | $$ /$$| $$  \  $$$/  | $$_____/'
echo '| $$  | $$|  $$$$$$$|  $$$$$$$|  $$$$$$$  |  $$$$/| $$   \  $/   |  $$$$$$$'
echo '|__/  |__/ \_______/ \_______/ \_______/   \___/  |__/    \_/     \_______/'
echo '          /$$      /$$ /$$                                        '
echo '         | $$$    /$$$|__/                                        '
echo '         | $$$$  /$$$$ /$$  /$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$ '
echo '         | $$ $$/$$ $$| $$ /$$__  $$ /$$__  $$ /$$__  $$ /$$__  $$'
echo '         | $$  $$$| $$| $$| $$  \__/| $$  \__/| $$  \ $$| $$  \__/'
echo '         | $$\  $ | $$| $$| $$      | $$      | $$  | $$| $$      '
echo '         | $$ \/  | $$| $$| $$      | $$      |  $$$$$$/| $$      '
echo '         |__/     |__/|__/|__/      |__/       \______/ |__/      '
echo -e "\e[0m"

# Define the tested version of Node.js.
NODE_TESTED="v8.0.0"

# Determine which Pi is running.
ARM=$(uname -m) 

# Check the Raspberry Pi version.
if [ "$ARM" != "armv7l" ]; then
	echo -e "\e[91mSorry, your Raspberry Pi is not supported."
	echo -e "\e[91mPlease run ReactiveMirror on a Raspberry Pi 2 or 3."
	echo -e "\e[91mIf this is a Pi Zero, you are in the same boat as the original Raspberry Pi. You must run in server only mode."
	exit;
fi

# Define helper methods.
function version_gt() { test "$(echo "$@" | tr " " "\n" | sort -V | head -n 1)" != "$1"; }
function command_exists () { type "$1" &> /dev/null ;}

# Update before first apt-get
echo -e "\e[96mUpdating packages ...\e[90m"
sudo apt-get update || echo -e "\e[91mUpdate failed, carrying on installation ...\e[90m"

# Installing helper tools
echo -e "\e[96mInstalling helper tools ...\e[90m"
sudo apt-get install curl wget git build-essential unzip || exit

# Check if we need to install or upgrade Node.js.
echo -e "\e[96mCheck current Node installation ...\e[0m"
NODE_INSTALL=false
if command_exists node; then
	echo -e "\e[0mNode currently installed. Checking version number.";
	NODE_CURRENT=$(node -v)
	echo -e "\e[0mMinimum Node version: \e[1m$NODE_TESTED\e[0m"
	echo -e "\e[0mInstalled Node version: \e[1m$NODE_CURRENT\e[0m"
	if version_gt $NODE_TESTED $NODE_CURRENT; then
		echo -e "\e[96mNode should be upgraded.\e[0m"
		NODE_INSTALL=true

		# Check if a node process is currenlty running.
		# If so abort installation.
		if pgrep "node" > /dev/null; then
			echo -e "\e[91mA Node process is currently running. Can't upgrade."
			echo "Please quit all Node processes and restart the installer."
			exit;
		fi

	else
		echo -e "\e[92mNo Node.js upgrade necessary.\e[0m"
	fi

else
	echo -e "\e[93mNode.js is not installed.\e[0m";
	NODE_INSTALL=true
fi

# Install or upgrade node if necessary.
if $NODE_INSTALL; then
	
	echo -e "\e[96mInstalling Node.js ...\e[90m"

	# Fetch the latest version of Node.js from the selected branch
	# The NODE_STABLE_BRANCH variable will need to be manually adjusted when a new branch is released. (e.g. 7.x)
	# Only tested (stable) versions are recommended as newer versions could break ReactiveMirror.
	
	NODE_STABLE_BRANCH="8.x"
	curl -sL https://deb.nodesource.com/setup_$NODE_STABLE_BRANCH | sudo -E bash -
	sudo apt-get install -y nodejs
	echo -e "\e[92mNode.js installation Done!\e[0m"
fi

# Install ReactiveMirror
cd ~
if [ -d "$HOME/ReactiveMirror" ] ; then
	echo -e "\e[93mIt seems like ReactiveMirror is already installed."
	echo -e "To prevent overwriting, the installer will be aborted."
	echo -e "Please rename the \e[1m~/ReactiveMirror\e[0m\e[93m folder and try again.\e[0m"
	echo ""
	echo -e "If you want to upgrade your installation run \e[1m\e[97mgit pull\e[0m from the ~/ReactiveMirror directory."
	echo ""
	exit;
fi

echo -e "\e[96mCloning ReactiveMirror ...\e[90m"
if git clone https://github.com/Cristian006/ReactiveMirror.git; then 
	echo -e "\e[92mCloning ReactiveMirror Done!\e[0m"
else
	echo -e "\e[91mUnable to clone ReactiveMirror."
	exit;
fi

cd ~/ReactiveMirror || exit
# Use sample config for start ReactiveMirror
cp app/mirror/config/config.js.sample app/mirror/config/config.js
echo -e "\e[92mCreated mirror config from sample!\e[0m"

cd ~/ReactiveMirror/app || exit
echo -e "\e[96mInstalling Mirror dependencies ...\e[90m"
if npm install; then
	echo -e "\e[92mMirror dependencies installation done!\e[0m"
else
	echo -e "\e[91mUnable to install Mirror dependencies!"
	exit;
fi

cd ~/ReactiveMirror || exit
echo -e "\e[96mInstalling app dependencies ...\e[90m"
if npm install; then 
	echo -e "\e[92mApp dependencies installation Done!\e[0m"
else
	echo -e "\e[91mUnable to install all app dependencies!"
	echo -e "\e[91mCarrying on installation ...\e[90m"
fi

# Check if plymouth is installed (default with PIXEL desktop environment), then install custom splashscreen.
echo -e "\e[96mCheck plymouth installation ...\e[0m"
if command_exists plymouth; then
	THEME_DIR="/usr/share/plymouth/themes"
	echo -e "\e[90mSplashscreen: Checking themes directory.\e[0m"
	if [ -d $THEME_DIR ]; then
		echo -e "\e[90mSplashscreen: Create theme directory if not exists.\e[0m"
		if [ ! -d $THEME_DIR/ReactiveMirror ]; then
			sudo mkdir $THEME_DIR/ReactiveMirror
		fi

		if sudo cp ~/ReactiveMirror/app/mirror/splashscreen/splash.png $THEME_DIR/ReactiveMirror/splash.png && sudo cp ~/ReactiveMirror/app/mirror/splashscreen/ReactiveMirror.plymouth $THEME_DIR/ReactiveMirror/ReactiveMirror.plymouth && sudo cp ~/ReactiveMirror/app/mirror/splashscreen/ReactiveMirror.script $THEME_DIR/ReactiveMirror/ReactiveMirror.script; then
			echo -e "\e[90mSplashscreen: Theme copied successfully.\e[0m"
			if sudo plymouth-set-default-theme -R ReactiveMirror; then
				echo -e "\e[92mSplashscreen: Changed theme to ReactiveMirror successfully.\e[0m"
			else
				echo -e "\e[91mSplashscreen: Couldn't change theme to ReactiveMirror!\e[0m"
			fi
		else
			echo -e "\e[91mSplashscreen: Copying theme failed!\e[0m"
		fi
	else
		echo -e "\e[91mSplashscreen: Themes folder doesn't exist!\e[0m"
	fi
else
	echo -e "\e[93mplymouth is not installed.\e[0m";
fi

# Use pm2 control like a service ReactiveMirror
read -p "Do you want use pm2 for auto starting of your ReactiveMirror (y/n)?" choice
if [[ $choice =~ ^[Yy]$ ]]; then
    sudo npm install -g pm2
    sudo su -c "env PATH=$PATH:/usr/bin pm2 startup linux -u pi --hp /home/pi"
    pm2 start ~/ReactiveMirror/app/mirror/installers/pm2_ReactiveMirror.json
    pm2 save
fi

echo " "
echo -e "\e[92mWe're ready! Run \e[1m\e[97mDISPLAY=:0 npm start\e[0m\e[92m from the ~/ReactiveMirror directory to start your ReactiveMirror.\e[0m"
echo " "
echo " "
