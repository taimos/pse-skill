/*
 * Copyright (c) 2018. Taimos GmbH http://www.taimos.de
 */

'use strict';

import {data, Element} from './elementData';

export async function readElements() : Promise<{ [key : string] : Element }> {
  return Promise.resolve(data);
}

export async function getElementById(id : string) : Promise<Element> {
  const elements = await readElements();
  if (elements.hasOwnProperty(id)) {
    return elements[id];
  }
  throw new Error('NotFound');
}

export function formatAttribute(element : Element, attribute : string, attributeName : string) : string[] {
  switch (attribute) {
    case 'symbol':
      return [
        `Das Symbol von ${element.name} ist ${element[attribute]}`,
        `${element[attribute]} ist das Symbol von ${element.name}`,
        `Das Element ${element.name} hat ${element[attribute]} als Symbol`,
        `Das Elementsymbol für ${element.name} ist ${element[attribute]}`,
      ];
    case 'mass':
      return formatAttributeMass(element);
    case 'number':
      return [
        `Die ${attributeName} von ${element.name} ist ${element[attribute]}`,
        `${element.name} hat die ${attributeName} ${element[attribute]}`,
        `${element.name} besitzt die ${attributeName} ${element[attribute]}`,
      ];
    case 'outerElectrons':
      return [
        `Die Anzahl der Valenzelektronen von ${element.name} ist ${element[attribute]}`,
        `Die Anzahl der Valenzelektronen von ${element.name} beträgt ${element[attribute]}`,
        `${element.name} besitzt ${element[attribute]} Valenzelektron`,
        `${element.name} hat ${element[attribute]} Außenelektron`,
      ];
    case 'groupNumber':
      return formatAttributeGroupNumber(element);
    case 'negativity':
      return formatAttributeNegativity(element);
    case 'electronConfig':
      return formatAttributeElectronConfig(element);
    default:
      return [`${attributeName} des Elements ${element.name} ist ${element[attribute].toString()}`];
  }
}

const formatAttributeElectronConfig = (element) : string[] => {
  // e.g. '2s^2 2p^1' => '2s hoch 2 <pause> 2p hoch 1'
  const configString = element.electronConfig
      .split(' ')
      .map((part) => {
        const match = /(\d+)([spdf])\^(\d+)/.exec(part);
        console.log(match);
        return `<say-as interpret-as="number">${match[1]}</say-as><say-as interpret-as="characters">${match[2]}</say-as> hoch <say-as interpret-as="number">${match[3]}</say-as>`;
      })
      .join(' <break time=\'500ms\'/> ');

  if (element.outerElectrons === 1) {
    return [`Die Elektronenkonfiguration des Außenelektrons von ${element.name} ist ${configString}`];
  }
  return [`Die Elektronenkonfiguration der Außenelektronen von ${element.name} ist ${configString}`];
};

const formatAttributeNegativity = (element) : string[] => {
  const value = `<say-as interpret-as="number">${element.negativity.toString().replace('.', ',')}</say-as>`;
  return [
    `Die Elektronegativität von ${element.name} ist ${value}`,
    `Die Elektronegativität von ${element.name} beträgt ${value}`,
    `${element.name} hat eine Elektronegativität von ${value}`,
    `${element.name} besitzt eine Elektronegativität von ${value}`,
    `Nach Pauling besitzt ${element.name} eine Elektronegativität von ${value}`,
  ];
};

const formatAttributeMass = (element) : string[] => {
  const value = `<say-as interpret-as="unit">${element.mass.toString().replace('.', ',')}u</say-as>`;
  return [
    `Die Masse von ${element.name} ist ${value}`,
    `Die Atommasse von ${element.name} beträgt ${value}`,
    `${value} ist die Masse von ${element.name}`,
    `${element.name} besitzt eine Atommasse von ${value}`,
  ];
};

const formatAttributeGroupNumber = (element) : string[] => {
  const value = element.groupNumber;
  switch (value) {
    case 'Ac':
      return [`${element.name} befindet sich in der Gruppe der Actinide`];
    case 'La':
      return [`${element.name} befindet sich in der Gruppe der Lathanide`];
    default:
      return [
        `Die Gruppennummer von ${element.name} ist ${value}`,
        `${element.name} befindet sich in der <say-as interpret-as="ordinal">${value}</say-as> Gruppe`,
        `${element.name} ist der <say-as interpret-as="ordinal">${value}</say-as> Gruppe zugeordnet`,
        `${element.name} findet sich in der <say-as interpret-as="ordinal">${value}</say-as> Gruppe des Periodensystems wieder`,
      ];
  }
};
