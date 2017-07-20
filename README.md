# Newline Powertools

Newline is a content and class management tool built and used by The Iron Yard. While the product team at TIY does amazing work, they can't do _everything_. So, to resolve some challenges instructors were experiencing I created this Chrome plugin that adds nifty features:

## Github Synchronization
Traditionally, students downloaded files for their homework projects as zip files, extracted them, created a Github repo, and then connected it as a remote to their local files. This actually led to a lot of problems as students who are new with Git did exciting this like making their entire home directory a Git repo or downloading many versions of the zip files and saving them all over their computer. 

To help streamline this, this extension works with a [Node.js/Express based API](https://github.com/dhughes/newline-powertools-api) (deployed to AWS Lambda) to automatically create and maintain Github repositories based on project download files. Students are then presented with a "Fork on Github" button that they can use to quickly fork the project, clone it locally, and get to work.

![Content being synced to Github](https://raw.githubusercontent.com/dhughes/newline-powertools/master/images/sync-to-github.gif)

## Gradebook Improvements
This extension consolidates student grade information into a traditional gradebook format. It works by identifying and scraping student data from the Newline administrative section. This information is cached in local storage and used to optionally display the gradebook in the Newline administration interface.

![Gradebook presentation](https://raw.githubusercontent.com/dhughes/newline-powertools/master/images/gradebook.png)

## Content (Re)styling and Collapsing
Some parts of Newline can be a bit hard to understand visually. For example, content, activities, etc, are all grouped together and difficult to distinguish. This extension provides additional styles that make it a bit easier to understand.

Additionally, the plugin provides the ability to double click on content items to fold them up into a smaller view.

Before:

![Old and busted](https://raw.githubusercontent.com/dhughes/newline-powertools/master/images/content-before.png)

After

![New Hotness](https://raw.githubusercontent.com/dhughes/newline-powertools/master/images/collapse-content.gif)
