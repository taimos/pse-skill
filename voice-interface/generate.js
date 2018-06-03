const generator = require('alexa-vui-generator');
const csvdata = require('csvdata');

const typeGenerator = csvdata.load('./elements.csv', {delimiter: ',', log: false}).then(elements => {
  'use strict';
  let customTypes = [];
  let elementNameType = generator.createNewSlotType(customTypes, 'ElementName');
  elements.forEach(keyword => {
    generator.addValueToType(elementNameType, keyword.number.toString(), keyword.name);
  });
  return customTypes;
});

// noinspection JSIgnoredPromiseFromCall
generator.createLanguageModel({
  intentCreators: generator.readIntentsFromYAML,
  typeCreators: [generator.readTypesFromYAML, typeGenerator],
  invocation: 'p. s. e.'
}, 'de-DE');