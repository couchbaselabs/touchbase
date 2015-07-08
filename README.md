# Couch411
An opensource NoSQL social network platform using Couchbase server, as well as Express, Angular and Node (the JavaScript stack).

#### Bucket Setup
First, and most importantly, create 2 buckets.
  These will be called **users** and **users_images**.
  Changing these bucketnames is possible in the "config.json" file.

Allot around 100 mb each to these buckets for initial testing
The modules are currently in the folder, so you can simply download the repo and run it (this will be adjusted later).

Now get into your CBQ shell, and run two commands:
*  **CREATE PRIMARY INDEX ON users**
*  **CREATE PRIMARY INDEX ON users_pictures**

#### Running the app
Most setup is complete at this point. Simply go into the folder within Couch411 called "Couch411Structure".
This is a newer version of the application, which is currently experimental.

Once in this folder, use the command **node app.js** to run the project.

The console will now have a message saying "View Touchbase at localhost:3000".
Redirect your browser to this location, and view the project.
