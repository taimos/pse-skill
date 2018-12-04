import {AlexaTest, IntentRequestBuilder, LaunchRequestBuilder, SkillSettings} from 'ask-sdk-test';
import {describe, it} from 'mocha';
import {handler as skillHandler} from '../lib/';

// initialize the testing framework
const skillSettings : SkillSettings = {
  appId: 'amzn1.ask.skill.a5cbce33-2287-40ad-a408-d8ccccb4c794',
  userId: 'amzn1.ask.account.SOMEUSERID',
  deviceId: 'amzn1.ask.device.SOMEDEVICEID',
  locale: 'de-DE',
};

const alexaTest = new AlexaTest(skillHandler, skillSettings);

describe('Test LaunchRequest', () => {
  'use strict';

  alexaTest.test([
    {
      request: new LaunchRequestBuilder(skillSettings).build(),
      says: 'Willkommen bei Taimos P.S.E.! <break time=\'2s\'/> Wie kann ich helfen?',
      shouldEndSession: false,
    },
  ], 'should start correctly');

});

describe('Test GetElementAttributeIntent', () => {
  'use strict';

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent').withEmptySlot('attribute').withEmptySlot('element').build(),
      says: ['Welche Eigenschaft soll ich dir beschreiben?',
        'Welche Eigenschaft soll ich dir nennen?',
        'Über welche Eigenschaft soll ich dich informieren?',
        'Über welche Eigenschaft möchtest du dich informieren?',
        'Welche Eigenschaft interessiert dich?'],
      shouldEndSession: false,
      elicitsSlot: 'attribute',
    },
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent').withSlotResolution('attribute', 'Masse', 'AttributeName', 'mass').build(),
      says: [
        'Zu welchem Element soll ich dir die Eigenschaft Masse nennen?',
        'Über welches Element möchtest du dich zur Eigenschaft Masse informieren?',
        'Zu welchem Element möchtest du die Eigenschaft Masse wissen?',
      ],
      shouldEndSession: false,
      elicitsSlot: 'element',
    },
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Masse', 'AttributeName', 'mass')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Die Masse von Wasserstoff ist <say-as interpret-as="unit">1u</say-as>',
        'Die Atommasse von Wasserstoff beträgt <say-as interpret-as="unit">1u</say-as>',
        '<say-as interpret-as="unit">1u</say-as> ist die Masse von Wasserstoff',
        'Wasserstoff besitzt eine Atommasse von <say-as interpret-as="unit">1u</say-as>',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot after elicit correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Masse', 'AttributeName', 'mass')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Die Masse von Wasserstoff ist <say-as interpret-as="unit">1u</say-as>',
        'Die Atommasse von Wasserstoff beträgt <say-as interpret-as="unit">1u</say-as>',
        '<say-as interpret-as="unit">1u</say-as> ist die Masse von Wasserstoff',
        'Wasserstoff besitzt eine Atommasse von <say-as interpret-as="unit">1u</say-as>',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot (mass) correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Ordnungszahl', 'AttributeName', 'number')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Die Ordnungszahl von Wasserstoff ist 1',
        'Wasserstoff hat die Ordnungszahl 1',
        'Wasserstoff besitzt die Ordnungszahl 1',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot (number) correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Symol', 'AttributeName', 'symbol')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Das Symbol von Wasserstoff ist H',
        'H ist das Symbol von Wasserstoff',
        'Das Element Wasserstoff hat H als Symbol',
        'Das Elementsymbol für Wasserstoff ist H',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot (symbol) correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Außenelektronen', 'AttributeName', 'outerElectrons')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Die Anzahl der Valenzelektronen von Wasserstoff ist 1',
        'Die Anzahl der Valenzelektronen von Wasserstoff beträgt 1',
        'Wasserstoff besitzt 1 Valenzelektron',
        'Wasserstoff hat 1 Außenelektron',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot (outerElectrons) correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Elektronegativität', 'AttributeName', 'negativity')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Die Elektronegativität von Wasserstoff ist <say-as interpret-as="number">2,2</say-as>',
        'Die Elektronegativität von Wasserstoff beträgt <say-as interpret-as="number">2,2</say-as>',
        'Wasserstoff hat eine Elektronegativität von <say-as interpret-as="number">2,2</say-as>',
        'Wasserstoff besitzt eine Elektronegativität von <say-as interpret-as="number">2,2</say-as>',
        'Nach Pauling besitzt Wasserstoff eine Elektronegativität von <say-as interpret-as="number">2,2</say-as>',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot (negativity) correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Elektronenkonfiguration', 'AttributeName', 'electronConfig')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Die Elektronenkonfiguration des Außenelektrons von Wasserstoff ist <say-as interpret-as="number">1</say-as><say-as interpret-as="characters">s</say-as> hoch <say-as interpret-as="number">1</say-as>',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot (electronConfig) correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Elektronenkonfiguration', 'AttributeName', 'electronConfig')
          .withSlotResolution('element', 'Bor', 'ElementName', '5')
          .build(),
      says: [
        'Die Elektronenkonfiguration der Außenelektronen von Bor ist <say-as interpret-as="number">2</say-as><say-as interpret-as="characters">s</say-as> hoch <say-as interpret-as="number">2</say-as> <break time=\'500ms\'/> ' +
        '<say-as interpret-as="number">2</say-as><say-as interpret-as="characters">p</say-as> hoch <say-as interpret-as="number">1</say-as>',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot (electronConfig) correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Gruppe', 'AttributeName', 'groupNumber')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Die Gruppennummer von Wasserstoff ist 1',
        'Wasserstoff befindet sich in der <say-as interpret-as="ordinal">1</say-as> Gruppe',
        'Wasserstoff ist der <say-as interpret-as="ordinal">1</say-as> Gruppe zugeordnet',
        'Wasserstoff findet sich in der <say-as interpret-as="ordinal">1</say-as> Gruppe des Periodensystems wieder',
      ],
      shouldEndSession: true,
    },
  ], 'should handle filled slot (groupNumber) correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Masse', 'AttributeName', 'mass')
          .withSlotResolution('element', 'Invalid', 'ElementName', '9999')
          .build(),
      says: [
        'Das Element Invalid habe ich leider nicht gefunden. Versuche ein anderes Element.',
        'Das Element Invalid befindet sich leider nicht in meiner Datenbank. Nenne mir ein anderes Element',
        'Zum Element Invalid sind mir leider keine Informationen bekannt. Zu welchem anderen Element kann ich dir weiterhelfen?',
        'Das Element Invalid ist mir leider nicht bekannt. Zu welchem anderen Element möchtest du Informationen?',
      ],
      shouldEndSession: false,
      ignoreQuestionCheck: true,
      elicitsSlot: 'element',
    },
  ], 'should handle invalid element correctly');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Invalid', 'AttributeName', 'invalid')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Invalid des Elements Wasserstoff ist mir leider nicht bekannt. Nenne mir eine andere Eigenschaft!',
        'Vom Element Wasserstoff sind mir leider keine Informationen über Invalid bekannt. Interessiert dich eine andere Eigenschaft von Wasserstoff?',
        'Über Invalid des Elements Wasserstoff besitzt ich leider keine Informationen. Möchtest du dich über eine andere Eigenschaft des Elements Wasserstoff informieren?',
      ],
      shouldEndSession: false,
      ignoreQuestionCheck: true,
      elicitsSlot: 'attribute',
    },
  ], 'should handle invalid attribute correctly');

  alexaTest.test([
    {
      request: new LaunchRequestBuilder(skillSettings).build(),
      says: 'Willkommen bei Taimos P.S.E.! <break time=\'2s\'/> Wie kann ich helfen?',
      shouldEndSession: false,
    },
    {
      request: new IntentRequestBuilder(skillSettings, 'GetElementAttributeIntent')
          .withSlotResolution('attribute', 'Masse', 'AttributeName', 'mass')
          .withSlotResolution('element', 'Wasserstoff', 'ElementName', '1')
          .build(),
      says: [
        'Die Masse von Wasserstoff ist <say-as interpret-as="unit">1u</say-as>',
        'Die Atommasse von Wasserstoff beträgt <say-as interpret-as="unit">1u</say-as>',
        '<say-as interpret-as="unit">1u</say-as> ist die Masse von Wasserstoff',
        'Wasserstoff besitzt eine Atommasse von <say-as interpret-as="unit">1u</say-as>',
      ],
      shouldEndSession: true,
    },
  ], 'should handle ranking from LaunchRequest');

});

describe('Test Default Intents', () => {
  'use strict';

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'AMAZON.HelpIntent').build(),
      says: 'Ich kann dir Attribute von chemischen Elementen nennen. Was willst du wissen?',
      shouldEndSession: false,
    },
  ], 'should give help');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'AMAZON.StopIntent').build(),
      says: 'Tschüß!',
      shouldEndSession: true,
    },
  ], 'should stop session');

  alexaTest.test([
    {
      request: new IntentRequestBuilder(skillSettings, 'AMAZON.CancelIntent').build(),
      says: 'Tschüß!',
      shouldEndSession: true,
    },
  ], 'should cancel session');

});
