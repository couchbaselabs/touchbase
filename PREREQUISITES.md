#Prerequisites

To use Touchbase, you will need a few basic things, which include Node.js, Couchbase Server, GraphicsMagick and Sendgrid. 
In this markdown page, the installation process for each of these items will be explained in detail, and hopefully make this
as simple as possible

### Minimum System Requirements.
There are a few things required of your system by a node module that the Couchbase server Node.js SDK uses, called **node-gyp**.

Make sure you have the requirements for your specific OS that are specified at https://github.com/nodejs/node-gyp.

### Node.js Setup
There are a few ways of installing Node.js:
* Use a package manager. Instructions can be found at https://github.com/joyent/node/wiki/installing-node.js-via-package-manager.
* This can also be done using a standard browser installation at https://nodejs.org/download/.

Node.js should come automatically with NPM (node package manager), but if not, this can be downloaded as a separate installation.
The instructions for this can be seen in the package manager link provided above.

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
The use of this account is explained in the README.md file.

### Couchbase Server Setup
First off, download Couchbase Server 4.0 from http://www.couchbase.com/preview/couchbase-server-4-0.
All the install instructions provided should make this simple and painless.

Now, to properly setup your Couchbase cluster, there is a little more setup. 
  1.  Redirect your webpage to **http://IPofYourMachine:8091** (use localhost for IPofYourMachine if the Couchbase Server instance is running on the same machine that you are currently on).
  2. If this is your first time using Couchbase, you will have to create your cluster. There are a few steps to this.
  * If you plan on using Touchbase with 3 buckets (you can do it with 1 or 2), then allot at least 300mb of data RAM for your cluster because each bucket needs a minimum of 100mb each according to Couchbase Server guidelines.
  * Make sure to check off **Data**, **Index** and **Query** at the bottom of the setup, as this will all be necessary.
  * Just allot the minimum amount of RAM for the Indexing.
  2. Also, if this is your first time, you will get a prompt to create a bucket named 'default'. Simply give it the minimum size needed and it can be deleted easily, as we will not require this bucket (you can use it if you like, just not needed for Touchbase).
  3. Now go into the **Data Buckets** section, and click the small arrow left of the bucket name for 'default'. Then click edit, scroll down all the way, and press 'DELETE'.

### Conclusion
Your setup is all complete, and the proper setup for Touchbase, and your use of these newly-setup tools will be seen in <a href="README.md">README.md</a>.
