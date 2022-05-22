/* exported gapiLoaded */
      /* exported gisLoaded */
      /* exported handleAuthClick */
      /* exported handleSignoutClick */

      // TODO(developer): Set to client ID and API key from the Developer Console
      const CLIENT_ID = '760748803726-ulpki8trrvhp56hur5h9cjp4b0mns3ub.apps.googleusercontent.com';
      const API_KEY = 'AIzaSyCCFPlhSEMyJmbUvSsOCQEHntWwu0CZJAs';

      // Discovery doc URL for APIs used by the quickstart
      const DISCOVERY_DOC = 'https://classroom.googleapis.com/$discovery/rest';

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.coursework.students.readonly https://www.googleapis.com/auth/classroom.coursework.students https://www.googleapis.com/auth/classroom.coursework.me';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;
      let listCourse;
      let buttonID;
      document.getElementById('authorize_button').style.visibility = 'hidden';
      document.getElementById('signout_button').style.visibility = 'hidden';
      document.getElementById('nextAttribute').style.visibility = 'hidden';
      /**
       * Callback after api.js is loaded.
       */
      function gapiLoaded() {
        gapi.load('client', intializeGapiClient);
      }

      /**
       * Callback after the API client is loaded. Loads the
       * discovery doc to initialize the API.
       */
      async function intializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      }

      /**
       * Callback after Google Identity Services are loaded.
       */
      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
      }

      /**
       * Enables user interaction after all libraries are loaded.
       */
      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          document.getElementById('authorize_button').style.visibility = 'visible';
        }
      }

      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick() {
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          document.getElementById('signout_button').style.visibility = 'visible';
          document.getElementById('authorize_button').innerText = 'Refresh';
        
          await listCourses();
        };

        if (gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          tokenClient.requestAccessToken({prompt: ''});
        }
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken('');
          document.getElementById('content').innerText = '';
          document.getElementById('authorize_button').innerText = 'Authorize';
          document.getElementById('signout_button').style.visibility = 'hidden';
          document.getElementById('nextAttribute').innerText = '';
          for( let index = 0; index < buttonID; index++ )
          removeElement(index);
        }
        buttonID = 0;
      }

      /**
       * Print the names of the first 10 courses the user has access to. If
       * no courses are found an appropriate message is printed.
       */
      async function listCourses() {
       
        let response;
        try {
          response = await gapi.client.classroom.courses.list({
            pageSize: 10, courseStates: 1
          });
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          return;
        }

        const courses = response.result.courses;
        listCourse = response.result.courses;
        if (!courses || courses.length == 0) {
          document.getElementById('content').innerText = 'No courses found.';
          return;
        }

         buttonID = 0;

        for( let index = 0; index < courses.length; index++ )
        {
          const button = document.createElement( "button" );
          button.id = index;
          button.type = 'button';
          button.innerText = courses[index].name;
          document.body.appendChild(button);
          buttonID++;
          button.onclick = async function(){ getActivity(index, courses);}
          
            
        }
         
          
      }
      
      
      async function getActivity(index, courses){
  
            document.getElementById('nextAttribute').style.visibility = 'visible';
            const element = courses[index].id;
             try{
                  activitiesList = await gapi.client.classroom.courses.courseWork.list({
                  courseId: element, courseWorkStates: 1
                 })
              }
              
              catch(err){
              
                document.getElementById('nextAttribute').innerText = err.message;
             
              }
                   
              const activities = activitiesList.result.courseWork;
              
              for( let index = 0; index < activities.length; index++ )
             {
              const button = document.createElement( "button" );
              button.id = index;
              button.type = 'button';
              button.innerText = activities[index].title;
              document.body.appendChild(button);
               buttonID++;
               button.onclick = async function(){ }
          
            
           }

              for(let index = 0 ; index < buttonID; index++ )
              { 
                removeElement(index);
              }
              
              const buttonBack = document.createElement( "button" );
              buttonBack.id = "back";
              buttonBack.type = 'button';
              buttonBack.innerText = "Atrás";
              document.body.appendChild(buttonBack);
              buttonBack.onclick = async function(){ 
                listCourses(); 
                document.getElementById('nextAttribute').innerText = '';

                removeElement("back");
                
              }    
            }

     
            async function getActivityInfo(index, courses, activity){
  
              document.getElementById('nextAttribute').style.visibility = 'visible';
              


                
              const output = activity.reduce(
                (str, courseWork) =>  `${str}${courseWork.description}\n`, 'Descripción:\n');

              
              
          
                  document.getElementById('nextAttribute').innerText = output;
              
  
                for(let index = 0 ; index < buttonID; index++ )
                { 
                  removeElement(index);
                }
  
                const buttonBack = document.createElement( "button" );
                buttonBack.id = "back";
                buttonBack.type = 'button';
                buttonBack.innerText = "Atrás";
                document.body.appendChild(buttonBack);
                buttonBack.onclick = async function(){ 
                  getActivities(index, courses);
                  document.getElementById('nextAttribute').innerText = '';
  
                  removeElement("back");
                  
                }    
              }
  
     
       function removeElement(id){
        var element = document.getElementById(id);
       return  element.parentNode.removeChild(element);
      }