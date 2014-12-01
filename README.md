Narrata
==================

Narrata is a customisable visualisation tool for building stories around data. The tool enables journalists to upload a data set and to input story snippets linked to specific data points. The story is being told along curated subsets of the data, which Narrata dynamically generates.

Uploader and Visualisation:
-----------------------------

1. Uploader
Narrata consists of a simple to use uploader that allows journalists to upload a data set and to input their story snippets. The uploader can be accessed at: http://mediaincontext.parseapp.com/

If you would like to host your own uploader, please dowload the entire code uploader + visualisation from the uploader branch.

`git checkout uploader`

`git pull uploader origin`

2. Visualisation
The uploader generates a unique URL in real time, which can be easily embedded into a Newspage or shared as a link.

Installation
-------------
Download the project to your local machine by running

`git clone https://github.com/Melinka/visualisation_tool`

Install the following Node modules:

`npm install gulp`

`npm install LiveScript`

`npm install stylus`

`npm install jade`

Enjoy visualising your story around data!

(The current media output is licensed under Attribution-ShareAlike 4.0 International)





