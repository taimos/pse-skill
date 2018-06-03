/*
 * Copyright (c) 2018. Taimos GmbH http://www.taimos.de
 */

import {HandlerInput, SkillBuilders} from 'ask-sdk';
import {NamedIntentRequestHandler, ResponseHelper, SlotHelper} from 'ask-sdk-addon';
import {LambdaHandler} from 'ask-sdk-core/dist/skill/factory/BaseSkillFactory';
import {Response} from 'ask-sdk-model';
import * as Speech from 'ssml-builder';
import {formatAttribute, getElementById} from './services/elements';

class LaunchRequestHandler extends NamedIntentRequestHandler {
  constructor() {
    super('LaunchRequest');
  }

  public async handle(handlerInput : HandlerInput) : Promise<Response> {
    return handlerInput.responseBuilder
        .speak(new Speech().say('Willkommen bei Taimos P.S.E.!').pause('2s').say('Wie kann ich helfen?').ssml(true))
        .reprompt('Wie kann ich helfen?')
        .getResponse();
  }
}

class GetElementAttributeIntentHandler extends NamedIntentRequestHandler {
  constructor() {
    super('GetElementAttributeIntent');
  }

  public async handle(handlerInput : HandlerInput) : Promise<Response> {
    const slotHelper = new SlotHelper(handlerInput.requestEnvelope);
    const responseHelper = new ResponseHelper(handlerInput.responseBuilder);

    const attr = slotHelper.resolveFirstValue('attribute');
    if (!attr) {
      responseHelper.speakOneOf(['Welche Eigenschaft soll ich dir beschreiben?',
        'Welche Eigenschaft soll ich dir nennen?',
        'Über welche Eigenschaft soll ich dich informieren?',
        'Über welche Eigenschaft möchtest du dich informieren?',
        'Welche Eigenschaft interessiert dich?']);
      return handlerInput.responseBuilder.reprompt('Nenne mir eine Eigenschaft!').addElicitSlotDirective('attribute').getResponse();
    }
    const attrName = slotHelper.getValue('attribute');

    const elem = slotHelper.resolveFirstValue('element');
    if (!elem) {
      responseHelper.speakOneOf([
        `Zu welchem Element soll ich dir die Eigenschaft ${attrName} nennen?`,
        `Über welches Element möchtest du dich zur Eigenschaft ${attrName} informieren?`,
        `Zu welchem Element möchtest du die Eigenschaft ${attrName} wissen?`,
      ]);
      return handlerInput.responseBuilder.reprompt('Nenne mir ein Element!').addElicitSlotDirective('element').getResponse();
    }
    const elementName = slotHelper.getValue('element');

    try {
      const element = await getElementById(elem.id);
      if (element[attr.id]) {
        return responseHelper.speakOneOf(formatAttribute(element, attr.id, attrName)).getResponse();
      }
      responseHelper.speakOneOf([
        `${attrName} des Elements ${element.name} ist mir leider nicht bekannt. Nenne mir eine andere Eigenschaft!`,
        `Vom Element ${element.name} sind mir leider keine Informationen über ${attrName} bekannt. Interessiert dich eine andere Eigenschaft von ${element.name}?`,
        `Über ${attrName} des Elements ${element.name} besitzt ich leider keine Informationen. Möchtest du dich über eine andere Eigenschaft des Elements ${element.name} informieren?`,
      ]);
      return handlerInput.responseBuilder.reprompt('Nenne mir eine Eigenschaft!').addElicitSlotDirective('attribute').getResponse();
    } catch (err) {
      if (err.message === 'NotFound') {
        console.log(`Did not find element ${elementName}`);
        responseHelper.speakOneOf([
          `Das Element ${elementName} habe ich leider nicht gefunden. Versuche ein anderes Element.`,
          `Das Element ${elementName} befindet sich leider nicht in meiner Datenbank. Nenne mir ein anderes Element`,
          `Zum Element ${elementName} sind mir leider keine Informationen bekannt. Zu welchem anderen Element kann ich dir weiterhelfen?`,
          `Das Element ${elementName} ist mir leider nicht bekannt. Zu welchem anderen Element möchtest du Informationen?`,
        ]);
        return handlerInput.responseBuilder.reprompt('Nenne mir ein Element!').addElicitSlotDirective('element').getResponse();
      }
      console.log(err);
      return handlerInput.responseBuilder.speak('Leider ist ein Fehler aufgetreten').getResponse();
    }
  }
}

class HelpIntentHandler extends NamedIntentRequestHandler {
  constructor() {
    super('AMAZON.HelpIntent');
  }

  public async handle(handlerInput : HandlerInput) : Promise<Response> {
    const helpText = 'Ich kann dir Attribute von chemischen Elementen nennen.';
    const helpText2 = 'Was willst du wissen?';
    return handlerInput.responseBuilder.speak(helpText + ' ' + helpText2).reprompt(helpText2).getResponse();
  }

}

class StopHandler extends NamedIntentRequestHandler {

  constructor() {
    super('AMAZON.StopIntent', 'AMAZON.CancelIntent');
  }

  public async handle(handlerInput : HandlerInput) : Promise<Response> {
    return handlerInput.responseBuilder.speak('Tschüß!').getResponse();
  }
}

class ErrorHandler {

  public canHandle() : boolean {
    return true;
  }

  public async handle(handlerInput : HandlerInput, error : Error) : Promise<Response> {
    const request = handlerInput.requestEnvelope.request;

    console.log(`Error handled: ${error.message}`);
    console.log(`Original request was ${JSON.stringify(request, null, 2)}\n`);

    const helpText = 'Ich kann dir Attribute von chemischen Elementen nennen.';
    const helpText2 = 'Was willst du wissen?';

    return handlerInput.responseBuilder
        .speak(`Entschuldigung das habe ich nicht verstanden! ${helpText} ${helpText2}`)
        .reprompt(helpText2)
        .getResponse();
  }
}

export const handler : LambdaHandler = SkillBuilders.standard()
    .withSkillId('amzn1.ask.skill.a5cbce33-2287-40ad-a408-d8ccccb4c794')
    .addRequestHandlers(
        new LaunchRequestHandler(),
        new GetElementAttributeIntentHandler(),
        new HelpIntentHandler(),
        new StopHandler(),
    )
    .addErrorHandlers(new ErrorHandler())
    .lambda();
