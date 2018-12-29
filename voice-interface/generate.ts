import {createLanguageModel, readIntentsFromYAML, readTypesFromYAML} from 'alexa-vui-generator';
import * as csvdata from 'csvdata';
import {VoiceInterface} from "alexa-vui-generator/dist/voicemodel";

const typeGenerator = async (vui : VoiceInterface, locale : string) : Promise<VoiceInterface> => {
  const elements = await csvdata.load('./elements.csv', {delimiter: ',', log: false});

  let elementNameType = vui.getOrCreateSlotType('ElementName');
  elements.forEach(keyword => {
    vui.addValueToSlotType(elementNameType, keyword.number.toString(), keyword.name, []);
  });
  return vui;
};

// noinspection JSIgnoredPromiseFromCall
createLanguageModel({
  invocation: 'p. s. e.',
  processors: [readIntentsFromYAML, readTypesFromYAML, typeGenerator],
}, 'de-DE', '../interactionModel');