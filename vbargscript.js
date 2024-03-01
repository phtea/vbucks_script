// ==UserScript==
// @name         Intercept and Modify Fetch Request
// @namespace    http://yourwebsite.com
// @version      0.1
// @description  Intercept and modify fetch requests using Tampermonkey
// @author       phtea
// @match        https://www.xbox.com/es-ar/games/store/*
// @grant        none
// ==/UserScript==


function addItemsWithIDs(ids, requestBody) {
    const idArray = ids.split('/');
    console.log(idArray)
    // Modify the productId of the existing item
    requestBody.itemsToAdd.items[0].productId = idArray[0];
    // Add new items to the items list for each additional ID
    for (let i = 1; i < idArray.length; i++) {
        requestBody.itemsToAdd.items.push({
            productId: idArray[i],
            skuId: '0010',
            availabilityId: '9P1QB1MWGRTB',
            quantity: 1,
            campaignId: 'xboxcomct'
        });
    }
    // Return the modified requestBody
    return JSON.stringify(requestBody);
}


(function() {
    'use strict';
    var originalFetch = window.fetch;
    window.fetch = async function(url) {
        if (url.url === 'https://cart.production.store-web.dynamics.com/cart/v1.0/cart/loadCart?cartType=consumer&appId=XboxWeb') {
            console.log("URL:", url.url);
            if (url.body) {
                console.log("Default body:", url.body);
                // Extract the body content from the ReadableStream
                let bodyContent = '';
                const reader = url.body.getReader();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    bodyContent += new TextDecoder().decode(value);
                }
                // Parse the JSON string into a JavaScript object and modify it
                const requestBody = JSON.parse(bodyContent);

                // Ask the user to input the vbucks
                const vbucks = prompt('Сколько вбаксов добавить?\nДоступный выбор: 1000, 2000, 2800, 5000, 13500\n(Если оставите пустым, добавится 13500 вбаксов)');

                // Switch statement to handle different cases based on product_ids
                let product_ids;
                switch (vbucks) {
                    case '1000':
                        product_ids = '9NRFP18VHR2F/9N6LNP106BP3'
                    case '2000':
                        product_ids = '9NRFP18VHR2F/9NLLNCGKW2BW';
                        break;
                    case '2800':
                        product_ids = '9NBKVWFCXFDJ/9PDF7RTW3HN6';
                        break;
                    case '5000':
                        product_ids = '9NLLNCGKW2BW/9P8K4RJ5XV39/9NBKVWFCXFDJ';
                        break;
                    case '13500':
                        product_ids = '9P1M9BGF0FSG/9P5WH95SBC1Q/9PLP33H5GSD3/9PFDDRKM07C4/9P15QMWK2KQC/9P0462L70KQQ/9NLLNCGKW2BW/9NBKVWFCXFDJ/9MV7N0D707L5';
                        break;
                    // Add more cases as needed
                    default:
                        product_ids = '9P1M9BGF0FSG/9P5WH95SBC1Q/9PLP33H5GSD3/9PFDDRKM07C4/9P15QMWK2KQC/9P0462L70KQQ/9NLLNCGKW2BW/9NBKVWFCXFDJ/9MV7N0D707L5';
                        break;
                }
                const modifiedBody = addItemsWithIDs(product_ids, requestBody);
                // Create a new Request object with the modified body
                const modifiedRequest = new Request(url, {
                    method: url.method,
                    headers: url.headers,
                    body: modifiedBody
                });
                console.log('modifiedBody: ', modifiedBody);
                // Call the original fetch function with the modified request
                console.log('Request has been modified :D')
                return originalFetch(modifiedRequest);
            }
        }
        // Call the original fetch function with unmodified arguments
        return originalFetch.apply(this, arguments);
    };
})();
