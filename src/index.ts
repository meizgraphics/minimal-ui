import {
  CopyJSONButton,
  getCollectionElements,
  queryElement,
  simulateEvent,
} from '@finsweet/ts-utils';
import Airtable, { Record } from 'airtable';
import { JSO, Fetcher, HTTPRedirect, Popup } from 'jso';

const Tclient_id = 'nef-3fAcxtMDg4oBpczTU9F6b0tXlIxwwAsWrNPNKIk';
const Tclient_secret = 'aR21QXxCP1QnyAqbfg2Rix2gZqN-LtzVFrMt6Q4elFk';

const config = {
  client_id: Tclient_id,
  client_secret: Tclient_secret,
  redirect_uri: 'https://minimal-ui-test.webflow.io/library',
  authorization: 'https://gumroad.com/oauth/authorize',
  scopes: {
    request: ['view_profile', 'view_sales'],
    require: ['view_profile', 'view_sales'],
  },
  response_type: 'code',
  token: 'https://api.gumroad.com/oauth/token',
  debug: true,
};
const client = new JSO(config);
// client.wipeTokens();
client.callback();

function authorizePopup() {
  const opts = {
    redirect_uri: 'https://minimal-ui-test.webflow.io/popup-callback',
  };
  client.setLoader(Popup);
  client
    .getToken(opts)
    .then((token) => {
      console.log('I got the token: ', token);
    })
    .catch((err) => {
      console.error('Error from passive loader', err);
    });
}
$('#btnAuthenticate').on('click', (e) => {
  e.preventDefault();
  authorizePopup();
});

// client.setLoader(HTTPRedirect);
// client
//   .getToken()
//   .then((token) => {
//     console.log('I got the token: ', token);
//   })
//   .catch((err) => {
//     console.error('Error from passive loader', err);
//   });
// if (
//   location.search.includes('state=') &&
//   (location.search.includes('code=') || location.search.includes('error='))
// ) {
//   window.history.replaceState({}, document.title, '/library');
// } else {
// }

const checkToken = client.checkToken();
const publicElements = document.querySelectorAll("[data-onlogin='hide']");
const privateElements = document.querySelectorAll("[data-onlogin='show']");
console.log(checkToken);
if (checkToken !== null) {
  privateElements.forEach(function (element) {
    element.style.display = 'initial';
  });

  publicElements.forEach(function (element) {
    element.style.display = 'none';
  });

  console.log('I got the token: ', checkToken.access_token);

  const f = new Fetcher(client);
  const url = 'https://api.gumroad.com/v2/user';

  f.fetch(url, { access_token: checkToken.access_token })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      console.log('I got protected json data from the API', data);
    })
    .catch((err) => {
      console.error('Error from fetcher', err);
    });
} else {
  publicElements.forEach(function (element) {
    element.style.display = 'initial';
  });

  privateElements.forEach(function (element) {
    element.style.display = 'none';
  });
}

// onAuthStateChanged(auth, (user) => {
//   const f = new Fetcher(client);
//   const url = 'https://api.gumroad.com/v2/user';
//   f.fetch(url, { access_token: checkToken.access_token })
//     .then((data) => {
//       return data.json();
//     })
//     .then((data) => {
//       console.log('I got protected json data from the API', data);
//     })
//     .catch((err) => {
//       console.error('Error from fetcher', err);
//     });

//   if (user) {
//     // User is signed in, see docs for a list of available properties

//     const uid = user.uid;

//     privateElements.forEach(function (element) {
//       element.style.display = 'initial';
//     });

//     publicElements.forEach(function (element) {
//       element.style.display = 'none';
//     });

//     console.log(`The current user's UID is equal to ${uid}`);
//     // ...
//   } else {
//     // User is signed out
//     publicElements.forEach(function (element) {
//       element.style.display = 'initial';
//     });

//     privateElements.forEach(function (element) {
//       element.style.display = 'none';
//     });
//     // ...
//   }
// });
// const token = client.checkToken();
// if (token !== null) {
//   console.log('I got the token: ', token.access_token);
//   const f = new Fetcher(client);
//   const url = 'https://api.gumroad.com/v2/resource_subscriptions';
//   f.fetch(url, { access_token: token.access_token, resource_name: 'sale' })
//     .then((data) => {
//       console.log('I got protected json data from the API', data);
//       return data.json();
//     })
//     .then((data) => {
//       console.log('I got protected json data from the API', data);
//     })
//     .catch((err) => {
//       console.error('Error from fetcher', err);
//     });
// } else {
//   client.getToken(config).then((token) => {
//     console.log('I got the token: ', token);
//   });
// }
// const f = new FetcherJQuery(client, $);
// const url = 'https://api.gumroad.com/v2/products';
// f.fetch(url, { access_token: token.access_token })
//   .then((data) => {
//     console.log('I got protected json data from the API', data);
//   })
//   .catch((err) => {
//     console.error('Error from fetcher', err);
//   });

// const f = new Fetcher(client);
// const url = 'https://api.gumroad.com/oauth/token';
// f.fetch(url, {})
//   .then((data) => {
//     return data.json();
//   })
//   .then((data) => {
//     console.log('I got protected json data from the API', data);
//   })
//   .catch((err) => {
//     console.error('Error from fetcher', err);
//   });

Airtable.configure({ apiKey: 'keyoAJiztjElB9kPt' });
window.Webflow ||= [];
window.Webflow.push(() => {
  const resetButton = queryElement('[fs-cmsfilter-element="reset"]', HTMLElement);
  if (!resetButton) return;
  $(document).keyup(function (e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      simulateEvent(resetButton, 'click');
    }
  });

  // require('dotenv').config();
  // const { GUMROAD_CLIENT_ID } = process.env;
  // console.log(GUMROAD_CLIENT_ID);

  // const opts = {
  //   scopes: {
  //     request: ['view_profile'],
  //   },
  //   request: {
  //     prompt: 'none',
  //   },
  //   response_type: 'id_token token',
  //   redirect_uri: 'https://minimal-ui-test.webflow.io/library',
  //   token: 'https://api.gumroad.com/oauth/token',
  // };
  // client.setLoader(IFramePassive);
  // client
  //   .getToken(opts)
  //   .then((token) => {
  //     console.log('I got the token: ', token);
  //   })
  //   .catch((err) => {
  //     console.error('Error from passive loader', err);
  //   });

  // const base = new Airtable({ apiKey: 'keyoAJiztjElB9kPt' }).base('appUuG1tFze2ryTZW');
  // const table = base('Components');
  // table
  //   .select({
  //     maxRecords: 20,
  //     sort: [{ field: 'Block Code', direction: 'desc' }],
  //     view: 'All Components',
  //   })
  //   .eachPage(
  //     function page(records, fetchNextPage) {
  //       // This function (`page`) will get called for each page of records.

  //       records.forEach(function (record) {
  //         console.log('Retrieved', record.fields);
  //         const copyElement = queryElement('[ms-element="copy-button"]', HTMLElement);
  //         if (!copyElement) return;
  //         const copyJSONData = record.get('Block Code');
  //         console.log(typeof copyJSONData);

  //         const copyButton = new CopyJSONButton({
  //           element: copyElement,
  //           copyData: copyJSONData,
  //         });

  //         console.log(copyButton);
  //       });

  //       // To fetch the next page of records, call `fetchNextPage`.
  //       // If there are more records, `page` will get called again.
  //       // If there are no more records, `done` will get called.
  //       fetchNextPage();
  //     },
  //     function done(err) {
  //       if (err) {
  //         console.error(err);
  //         return;
  //       }
  //     }
  //   );

  // const copyDataElement = queryElement('[ms-element="copy-data"]', HTMLTextAreaElement);
  // if (!copyDataElement) return;
  // const copyData = copyDataElement.innerHTML;

  // console.log(copyData);

  // if (document.querySelector('.copy-button')) {
  //   let dataCopy;

  //   $(document).ready(function () {
  //     $('.copy-button').on('click', function (event) {
  //       if ($(event.target).parent().find('.snippet')) {
  //         editTask(event.target, $(event.target).parent());
  //       } else {
  //         dataCopy = '';
  //       }
  //     });
  //   });

  //   document.addEventListener('copy', (event) => {
  //     event.clipboardData.setData('application/json', dataCopy);
  //     event.preventDefault();
  //   });

  //   function editTask(node, event) {
  //     dataCopy = $(node).parent().find('.snippet').text();
  //     document.execCommand('copy');
  //     $(event).parent().find('.copy-button-text').text('Copied!');
  //     setTimeout(function () {
  //       $(event).parent().find('.copy-button-text').text('Copy');
  //     }, 1200);
  //   }
  // }

  // // Initialize the API
  // const api = new Webflow({
  //   token: 'a7b410271913ac1a8cd9246cfca205570c5bbde64cc27be896c0e4902f256a8a',
  // });

  // // Fetch a site
  // api.sites().then((result) => console.log(result));

  // axios
  //   .get('https://api.webflow.com/sites', {
  //     headers: {
  //       Authorization: `a7b410271913ac1a8cd9246cfca205570c5bbde64cc27be896c0e4902f256a8a`,
  //     },
  //   })
  //   .then(function (response) {
  //     // handle success
  //     console.log(response);
  //   })
  //   .catch(function (error) {
  //     // handle error
  //     console.log(error);
  //   })
  //   .then(function () {
  //     // always executed
  //   });
});

// const element = document.querySelector('[ms-test]');
// const html = element.outerHTML;
// const testValue = Object.entries(element);
// const data = { html: html };
// const elementJSON = JSON.stringify(data);
// const parsedJSON = JSON.parse(elementJSON);
// console.log(parsedJSON);
