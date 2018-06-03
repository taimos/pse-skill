/*
 * Copyright (c) 2018. Taimos GmbH http://www.taimos.de
 */

import {expect} from 'chai';
import {describe, it} from 'mocha';
import {getElementById, readElements} from '../lib/services/elements';

describe('Test Data', () => {

  it('should load elements correctly', async () => {
    const elements = await readElements();
    expect(elements).to.be.an.instanceof(Object);
    expect(Object.keys(elements).length).to.be.equal(108);
  });

  it('should load element "Wasserstoff" correctly', async () => {
    const element = await getElementById('1');
    expect(element).to.be.an.instanceof(Object);
    expect(element).to.have.property('mass', 1);
    expect(element).to.have.property('number', 1);
    expect(element).to.have.property('symbol', 'H');
    expect(element).to.have.property('name', 'Wasserstoff');
    expect(element).to.have.property('groupNumber', 1);
    expect(element).to.have.property('outerElectrons', 1);
  });

  it('should load element "Magnesium" correctly', async () => {
    const element = await getElementById('12');
    expect(element).to.be.an.instanceof(Object);
    expect(element).to.have.property('mass', 24.31);
    expect(element).to.have.property('number', 12);
    expect(element).to.have.property('symbol', 'Mg');
    expect(element).to.have.property('name', 'Magnesium');
    expect(element).to.have.property('groupNumber', 2);
    expect(element).to.have.property('outerElectrons', 2);
  });

});
