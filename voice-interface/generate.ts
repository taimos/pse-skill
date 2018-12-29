import {
  addValueToType,
  createLanguageModel,
  createNewSlotType,
  readIntentsFromYAML,
  readTypesFromYAML
} from 'alexa-vui-generator';

import * as csvdata from 'csvdata';

const typeGenerator = csvdata.load('./elements.csv', {delimiter: ',', log: false}).then(elements => {
  'use strict';
  let customTypes = [];
  let elementNameType = createNewSlotType(customTypes, 'ElementName');
  elements.forEach(keyword => {
    addValueToType(elementNameType, keyword.number.toString(), keyword.name, []);
  });
  return customTypes;
});

// noinspection JSIgnoredPromiseFromCall
createLanguageModel({
  intentCreators: readIntentsFromYAML,
  typeCreators: [readTypesFromYAML, typeGenerator],
  invocation: 'p. s. e.'
}, 'de-DE', '../interactionModel');