# Touchbase
An opensource NoSQL social network platform using Couchbase server, as well as Express, Angular and Node (the JavaScript stack). The UI is created using Angular Material Design, and parts of Bootstrap, Semantic UI and Materialize CSS.

#### Bucket Setup
First, and most importantly, create 3 buckets.
  These will be called **users** and **users_images** and **users_publishments**.
  Changing these bucketnames is possible in the "config.json" file.

Allot around 100 mb each to these buckets for initial testing, and closer to 300mb to use the picture bucket.
The modules are not in the folder, so you can simply download the repo and run a 'npm' and 'bower' commands to get the necessary modules/components.

Now get into your CBQ shell, and run two commands:
*  **CREATE PRIMARY INDEX ON users**
*  **CREATE PRIMARY INDEX ON users_pictures**
*  **CREATE PRIMARY INDEX ON users_publishments**

#### Running the app
Most setup is complete at this point. Simply go into the folder within Couch411 called "TouchbaseModular".
This is a newer version of the application, which is currently experimental.

Once in this folder, use the command **node app.js** (or nodemon if you prefer), to run the project.

The console will now have a message saying "View Touchbase at localhost:3000".
Redirect your browser to this location, and view the project.
