const CLIENT_ID = '760748803726-ulpki8trrvhp56hur5h9cjp4b0mns3ub.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCCFPlhSEMyJmbUvSsOCQEHntWwu0CZJAs';
const DISCOVERY_DOC = 'https://classroom.googleapis.com/$discovery/rest';
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly';

let buttonIndex= 0;
let tokenClient;
let gapiInited = false;
let gisInited = false;
let varCourses;
let varTeachers;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';
document.getElementById('nextAttribute').style.visibility = 'hidden';

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

//Initialize the API with the Doc.
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();

}

//Callback after loaded the services
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

//Enables user interaction after all libraries are loaded
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

//login on click
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';
    document.getElementById('nextAttribute').style.visibility = 'visible';
    await listCourses();
    await getActivities();
  };
  
  if (gapi.client.getToken() === null) {
    // Select google acc and ask for consent
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    // Skip display of account chooser for an existing session.
    tokenClient.requestAccessToken({prompt: ''});
  }
}
//Logout on click
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').style.visibility = 'hidden';
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';
    document.getElementById('nextAttribute').style.visibility = 'hidden';
    document.getElementById('nextAttribute').innerText = '';
    for( let index = 0; index < buttonIndex; index++ )
    {
       getElementById('randomId'+ index).remove();
      

    }
    buttonIndex = 0;
  }
}

//Get courses
async function listCourses() {
  let coursesList;

  try {
    coursesList = await gapi.client.classroom.courses.list({
      pageSize: 10, courseStates: 1,
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
  
  const courses = coursesList.result.courses;
  if (!courses || courses.length == 0) {
    document.getElementById('content').innerText = 'No courses found.';
    return;
  }

    varCourses = coursesList;
  }

async function getActivity(){
  let copy_varCourses = varCourses.result.courses;
  let activitiesList;
  let test = "";

  for (let index = 0; index < copy_varCourses.length; index++) {
    const element = copy_varCourses[index].id;

    const boton = document.createElement('button')
    boton.id = "randomId" + index;
    boton.type = 'button';
    boton.innerText = copy_varCourses[index].name;
    document.body.appendChild(boton);
    document.getElementById("randomId"+index).addEventListener("click", testFunction);

    async function testFunction(){
      try{
        activitiesList = await gapi.client.classroom.courses.courseWork.list({
          courseId: element, courseWorkStates: 1
        })
      }catch(err){
        document.getElementById('nextAttribute').innerText = err.message;
      }
      const activities = activitiesList.result.courseWork;
      const output = activities.reduce(
        (str, courseWork) => `${str}${courseWork.title}\n`, 'Activities:\n');

        document.getElementById('nextAttribute').innerText = output;
      
      }
      buttonIndex++;
  }
}
