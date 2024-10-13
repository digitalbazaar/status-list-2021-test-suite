/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const validVc = require('./validVc.json');
const should = chai.should();

/**
 * Tests the properties of a credential.
 *
 * @param {object} options - The options to use.
 * @param {object} options.credential - A VC issued from an issuer.
 *
 * @returns {undefined} Just returns on success.
 */
export const testCredential = ({credential}) => {
  should.exist(credential, 'expected credential to exist');
  credential.should.be.an('object');
  credential.should.have.property('@context')
    .and.to.be.an('array')
    .and.to.include.members([
      'https://www.w3.org/ns/credentials/v2'
    ]);
  credential.should.have.property('type')
    .and.to.be.an('array')
    .and.to.include.members([
      'VerifiableCredential'
    ]);
  credential.should.have.property('credentialSubject')
    .and.to.be.eql(validVc.credentialSubject);
  credential.should.have.property('issuer');
  const issuerType = typeof (credential.issuer);
  issuerType.should.be.oneOf(['string', 'object']);
  if(issuerType === 'object') {
    should.exist(credential.issuer.id)
      .and.to.be.an('object');
  }
};

export const testSlCredential = ({slCredential}) => {
  should.exist(slCredential, 'expected credential to exist');
  slCredential.should.be.an('object');
  slCredential.should.have.property('@context');
  slCredential['@context'].should.include.members([
    'https://www.w3.org/ns/credentials/v2',
  ]);
  slCredential.should.have.property('type');
  slCredential.type.should.be.an('array');
  slCredential.type.should.include.members(
    ['VerifiableCredential', 'BitstringStatusListCredential']);
  slCredential.should.have.property('credentialSubject');
  const {credentialSubject} = slCredential;
  credentialSubject.should.contain.keys(
    'type',
    'encodedList',
    'statusPurpose'
  );
  credentialSubject.encodedList.should.be.a('string');
  credentialSubject.type.should.be.a('string');
  credentialSubject.type.should.eql('BitstringStatusList');
  slCredential.should.have.property('issuer');
  const issuerType = typeof (slCredential.issuer);
  issuerType.should.be.oneOf(['string', 'object']);
  if(issuerType === 'object') {
    should.exist(slCredential.issuer.id,
      'Expected issuer object to have property id');
    slCredential.issuer.id.should.be.an('object');
  }
};

export const shouldFailVerification = ({result, error, statusCode}) => {
  should.not.exist(result, 'Expected no response from verifier');
  should.exist(error, 'Expected verifier to error');
  statusCode.should.equal(400, 'Expected status code 400');
  should.exist(error.data);
  error.data.verified.should.equal(false);
};

export const shouldPassVerification = ({result, error, statusCode}) => {
  should.exist(result, 'Expected response from verifier');
  should.not.exist(error, 'Expected verifier to not error');
  // verifier returns 200
  statusCode.should.equal(200, 'Expected status code 200');
  should.exist(result.data);
  // verifier responses vary but are all objects
  result.data.should.be.an('object');
  result.data.verified.should.equal(true);
};
