# Touchbase
An opensource NoSQL social network platform using Couchbase server, as well as Express, Angular and Node (the JavaScript stack). The UI is created using Angular Material Design, and parts of Bootstrap, Semantic UI and Materialize CSS.

#### Bucket Setup
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

#### Running the app
Most setup is complete at this point. Simply go into the folder within Couch411 called "TouchbaseModular".
This is a newer version of the application, which is currently experimental.

Once in this folder, use the command **node app.js** (or nodemon if you prefer), to run the project.

The console will now have a message saying "View Touchbase at localhost:3000".
Redirect your browser to this location, and view the project.
