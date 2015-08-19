# Touchbase                 <img src="TouchbaseModular/icons/Touchbase_red.png" align="center" width="75">

An opensource NoSQL social network platform using Couchbase Server 4.0 (featuring N1QL), as well as Express, Angular and Node (the JavaScript web stack). The UI is created primarily using Angular Material Design, as well as parts of Bootstrap, Semantic UI and Materialize CSS.

### Getting the Project
The simplest way to get Touchbase is simply to clone it to wherever you choose. Keep track of this directory, as you will have to navigate to it in the future. The clone link can be seen in the bottom right corner of the home page for Touchbase. 

Simply navigate to the directory in your shell where you want to keep the project folder and run: 

````$ git clone https://github.com/couchbaselabs/touchbase.git````

This will now create the folder in that directory, and you can enter the folder, and then one level deeper into 'TouchbaseModular'. Here is where you will need to navigate when doing anything specific to your project.

### Bucket Setup
First off, download Couchbase Server 4.0 from http://www.couchbase.com/preview/couchbase-server-4-0.
All the install instructions provided should make this simple and painless.

Now, to create the 3 buckets for this project, there is a little more setup. 
  1. Go to the IP address of your server ('localhost' if it is running on the device you are on) and go to port 8091. 
  2. You will get a prompt to create a bucket named 'default'. Simply give it the minimum size needed and it can be deleted easily, as we will not require this bucket (you can use it if you like, just not needed for Touchbase).  
  3. From here you can create these 3 buckets simply and easily using the 'Create Bucket' button. These buckets will be called **users** and **users_pictures** and **users_publishments**. Changing these bucketnames is possible in the "config.json" file.
  4. Allot around 100 mb each to these buckets for initial testing, and closer to 300mb to use the **users_pictures** bucket.

Now get into your CBQ shell, and run these three commands:
*  **CREATE PRIMARY INDEX ON users**
*  **CREATE PRIMARY INDEX ON users_pictures**
*  **CREATE PRIMARY INDEX ON users_publishments**

If you changed your bucket names in 'config.json, change them accordingly for these commands.
An experimental API endpoint is still in the works to create all setup indexes simply by accessing the endpoint.

### Node.js Setup
There are a few ways of installing Node.js:
* Use a package manager. Instructions can be found at https://github.com/joyent/node/wiki/installing-node.js-via-package-manager.
* This can also be done using a standard browser installation at https://nodejs.org/download/

Node.js should come automatically with NPM (node package manager), but if not this can be downloaded as a separate installation.
The instructions for this can be seen in the package manager link provided above.

### Installing Node Modules and Bower Components
***This is project-specific. Navigate to your project directory to run these commands in your command line. If you don't have the project downloaded, check 'Getting the Project'***

######NPM
Once NPM (node package manager) is properly available, run one simple command:

````$ npm install````

Then, this will install all modules that were specified for the project in the 'package.json' file.
All of these modules will be put into the 'node_modules' folder and then be accessed in the back-end javascript files using 'require' statements, or ````<script src="filepath">```` tags in HTML to access the necessary files.

######Bower
Now run another command with NPM:

````$ npm install -g bower````

This will install another package manager that other necessary components can be downloaded with.

After installing bower, run this command:

````$ bower install````

This will now install all the components specified in the 'bower.json' file that were included in the project.
All of these components will be downloaded into the 'bower_components' folder and can also be accessed through 'require' statements, or ````<script src="filepath">```` tags in HTML to access the necessary files.

### Installing GraphicsMagick
GraphicsMagick is used by Touchbase to allow images to be altered as the user sees fit. In the current implementation of the application, the image is cropped, scaled down, then reduced in quality and then sent to be uploaded to Couchbase.
If you looked into the 'package.json' file, you may see that we downloaded 'gm' which is the node module for GraphicsMagick. 
Therefore, it may seem odd that we still have to install GraphicsMagick. 
The reason for this is simply that the node module 'gm' simply accesses GraphicsMagick binaries that the system has in a simple way for Node.js. 
We still have to download these binaries, and this will vary by OS.

###### Mac OSX
The simplest way for Mac is to use homebrew and execute a simple command:

````$ brew install graphicsMagick````

If you do not have homebrew, simply go to http://brew.sh and install it.

###### CentOS
Using CentOS to download GraphicsMagick can be a bit difficult, however there is a simple 'gist' that has the commands necessary to install it using 'yum' commands. It assumes that your machine has 'yum' as this should come stock with all CentOS machines. The 'gist' can be found at https://gist.github.com/paul91/9008409

###### Other Linux
Instructions to install with other Linux systems (could also be done with OSX/CentOS) could be found at http://www.graphicsmagick.org/INSTALL-unix.html. 

###### Windows
Instructions to install with Windows could be found at http://www.graphicsmagick.org/INSTALL-windows.html.

### Sendgrid API
The Sendgrid Web API was used along with the Nodemailer package to send email verification to all users. Please create an account at https://sendgrid.com/free?mc=SendGrid%20Documentation. 

The Nodemailer Sengrid API method was used to ensure that the emails do not go to users' trash bins, and it also allows statistics about the emails to be tracked directly from the Sendgrid dashboard.
Enter your Sendgrid username and password to the 'config.json' file after you create your account. This will allow for all emails to be sent safely through one's account. These changes will be reflected in the 'sessionmodel.js' file in the 'Session.makeVerification' function.

### Running the app
***This is project-specific. Navigate to your project directory to run these commands in your command line. If you don't have the project downloaded, check 'Getting the Project'***

Most setup is complete at this point. First, navigate into 'TouchbaseModular'.

Once in this folder, use the command ````$ node app.js```` (or nodemon if you prefer), to run the project.

The console will now have a message saying "View Touchbase at localhost:3000" (maybe a different port depending on 'config.json' file).
Redirect your browser to this location, and view the project! Congratulations on your custom app :)

### Post Launch
###### Logs
In many other web servers, the logs are found in a certain file, however, Node.js prints directly to the 'STDERR' and 'STDOUT' on the console. This can be configured differently if desired as mentioned at  http://stackoverflow.com/questions/8393636/node-log-in-a-file-instead-of-the-console.

###### HTTPS
The process of using 'https' protocol is rather simple using a self-signed cert, and that is how the current system is implemented. Using CA signed certs is still **EXPERIMENTAL** and should be live shortly. This will be updated in the near future as it is an important security measure.

### Conclusion

Hopefully you find this application helpful, especially the use of N1QL and Couchbase Server 4.0 with Node.js. Please file any errors/questions here, and they will be answered as soon as possible!
