# Portfolio_MediaPortal
Vue.js and Node.js (Express) application MediaPortal

  This is a CRUD application called MediaPortal. The backend is provided via Node.js(Express framework) and MySql database, while frontend 
is provided via Vue.js. This application is only meant to be used for job application of Marko Peykovich and not for commercial or 
professional use (non-production mode).
  When logged, each user has a unique session on the basis of which he is entitled to send requests to a server and this session lasts two 
hours after which a user is automatically logged out. All user passwords are encrypted via bcrypt. A user (subscriber-pretplatnik) must be 
registered and logged in, in order to see Vesti.vue, where all the news (vesti) from database are available and classified into one of three 
categories (1. without comments-Vesti bez komentara, 2. with one comment-Vesti sa jednim komentarom, 3. with multiple comments-Vesti sa vise 
komentara). Each user is able to search and comment all the news inside these categories, as well as to click on the button that leads him 
to a section (rubric) of particular kind of news where he can put his comments too.
  An admin has an additional access to the AdminPanel.vue, where he is entitled to perform all CRUD operations (create, retrieve, update, 
delete - and search via input - news, comments, journalists, sections-rubrics, editors, users...).
