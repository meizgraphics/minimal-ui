import {
  CopyJSONButton,
  getCollectionElements,
  queryElement,
  simulateEvent,
} from '@finsweet/ts-utils';
import Airtable, { Record } from 'airtable';
import { JSO, Fetcher, Popup } from 'jso';

import type { Block } from './types';
import type { CMSFilters } from './types/CMSFilters';

const Tclient_id = 'nef-3fAcxtMDg4oBpczTU9F6b0tXlIxwwAsWrNPNKIk';
const Tclient_secret = 'aR21QXxCP1QnyAqbfg2Rix2gZqN-LtzVFrMt6Q4elFk';
const product_id = 'Xp1BZuiM6Njyi4zOr8N0QA==';
Airtable.configure({ apiKey: 'keyoAJiztjElB9kPt' });

const base = new Airtable({ apiKey: 'keyoAJiztjElB9kPt' }).base('appUuG1tFze2ryTZW');
const table = base('Components');

const publicElements = document.querySelectorAll("[data-onlogin='hide']");
const privateElements = document.querySelectorAll("[data-onlogin='show']");

const normalUserElements = document.querySelectorAll("[ms-subscriber='hide']");
const subscriberElements = document.querySelectorAll("[ms-subscriber='show']");

let profileImage = '';
let userEmail = '';
let userDisplayName = '';

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
});

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

const checkToken = client.checkToken();

function authorizePopup() {
  const opts = {
    redirect_uri: `https://minimal-ui-test.webflow.io/popup-callback`,
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

async function gumroadLogin() {
  await authorizePopup();
  window.location.reload();
}

$('#btnAuthenticate').on('click', (e) => {
  e.preventDefault();
  gumroadLogin();
});

$('#btnLogout').on('click', (e) => {
  e.preventDefault();
  client.wipeTokens();
  window.location.reload();
});

window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  'cmsfilter',
  async (filtersInstances: CMSFilters[]) => {
    // Get the filters instance
    const [filtersInstance] = filtersInstances;

    // Get the list instance
    const { listInstance } = filtersInstance;

    // Save a copy of the template
    const [firstItem] = listInstance.items;
    const itemTemplateElement = firstItem.element;

    // Fetch external data
    const blocksArr = [];
    let newItems = [];
    table
      .select({
        maxRecords: 300,
        sort: [{ field: 'Name', direction: 'asc' }],
        view: 'New Components',
      })
      .eachPage(
        function page(records, fetchNextPage) {
          // This function (`page`) will get called for each page of records.
          records.forEach(function (record) {
            blocksArr.push(record.fields);

            // console.log('Retrieved', record.fields);
          });
          // To fetch the next page of records, call `fetchNextPage`.
          // If there are more records, `page` will get called again.
          // If there are no more records, `done` will get called.
          fetchNextPage();
        },
        async function done(err) {
          if (err) {
            console.error(err);
            return;
          }
          // Remove existing items
          listInstance.clearItems();

          // Create the new items
          newItems = blocksArr.map((block: Block) => createItem(block, itemTemplateElement));

          // Populate the list
          await listInstance.addItems(newItems);
        }
      );
  },
]);

const createItem = (block: Block, templateElement: HTMLDivElement) => {
  // Clone the template element
  const newItem = templateElement.cloneNode(true) as HTMLDivElement;

  // Query inner elements
  const image = newItem.querySelector<HTMLImageElement>('[ms-element="image"]');
  const title = newItem.querySelector<HTMLHeadingElement>('[ms-element="title"]');
  // const category = newItem.querySelector<HTMLDivElement>('[ms-element="category"]');
  const copyButtonElem = newItem.querySelector<HTMLElement>('[ms-element="copy-button"]');
  let copyButton = {};

  // Populate inner elements
  if (image) image.srcset = block.Image;
  if (title) title.textContent = block.Name;
  const { Json } = block;

  if (copyButtonElem) copyButton = new CopyJSONButton({ element: copyButtonElem, copyData: Json });

  return newItem;
};

if (checkToken !== null) {
  privateElements.forEach(function (element) {
    element.style.display = 'initial';
  });

  publicElements.forEach(function (element) {
    element.style.display = 'none';
  });

  console.log('I got the token: ', checkToken.access_token);

  const f = new Fetcher(client);
  const urlUser = `https://api.gumroad.com/v2/user`;

  f.fetch(urlUser, { access_token: checkToken.access_token })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      profileImage = data.user.profile_url;
      userEmail = data.user.email;
      userDisplayName = data.user.display_name;
    })
    .catch((err) => {
      console.error('Error from fetcher', err);
    });

  const fSubscribers = new Fetcher(client);
  const url = `https://api.gumroad.com/v2/products/${product_id}/subscribers`;

  /**
   * Creates a hidden button that will serve as the copy trigger.
   * @returns The new button element.
   */
  fSubscribers
    .fetch(url, { access_token: checkToken.access_token })
    .then((data) => {
      return data.json();
    })
    .then((data) => {
      console.log('I got protected json data from the API', data.subscribers);
      const subscribersArr = data.subscribers;
      const filteredSubscribers = subscribersArr.filter(
        (subscriber) => subscriber.status === 'alive'
      );
      const userMatch = filteredSubscribers.find(
        (user) => user.email === 'multi@minimal-square.com'
      );
      if (userMatch) {
        console.log('I am user');
        subscriberElements.forEach(function (element) {
          element.style.display = 'initial';
        });

        normalUserElements.forEach(function (element) {
          element.style.display = 'none';
        });
      } else {
        console.log("I'm not user");
        normalUserElements.forEach(function (element) {
          element.style.display = 'initial';
        });

        subscriberElements.forEach(function (element) {
          element.style.display = 'none';
        });
      }
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

// require('dotenv').config();
// const { GUMROAD_CLIENT_ID } = process.env;
// console.log(GUMROAD_CLIENT_ID);
