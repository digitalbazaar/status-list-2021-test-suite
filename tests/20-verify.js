/*!
 * Copyright (c) 2022 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const chai = require('chai');
const {implementations} = require('vc-api-test-suite-implementations');

const invalidCredentialStatusType =
  require('../static-vcs/invalidCredentialStatusType.json');
const invalidStatusListCredentialId =
  require('../static-vcs/invalidStatusListCredentialId.json');
const validVc = require('../static-vcs/validVc.json');

const should = chai.should();

describe('StatusList2021 Credentials (Verify)', function() {
  // column names for the matrix go here
  const columnNames = [];
  // this will tell the report
  // to make an interop matrix with this suite
  this.matrix = true;
  this.report = true;
  this.columns = columnNames;
  this.rowLabel = 'Test Name';
  this.columnLabel = 'Verifier';
  for(const [verifierName, {verifiers}] of implementations) {
    columnNames.push(verifierName);
    describe(verifierName, function() {
      const verifier = verifiers.find(verifier =>
        verifier.tags.has('VC-HTTP-API'));
      it.skip('MUST verify a valid "StatusList2021Credential"',
        async function() {
        // this tells the test report which cell
        // in the interop matrix the result goes in
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          const body = {
            verifiableCredential: validVc,
            options: {
              checks: ['proof', 'credentialStatus']
            }
          };
          const {result, error} = await verifier.verify({body});
          should.exist(result);
          should.not.exist(error);
        });
      it('MUST fail to verify a VC with invalid ' +
      '"credentialStatus.statusListCredential"', async function() {
      // this tells the test report which cell
      // in the interop matrix the result goes in
        this.test.cell = {columnId: verifierName, rowId: this.test.title};
        const body = {
          verifiableCredential: invalidStatusListCredentialId,
          options: {
            checks: ['proof', 'credentialStatus']
          }
        };
        const {result, error} = await verifier.verify({body});
        should.not.exist(result);
        should.exist(error);
        should.exist(error.data);
        // verifier returns 400
        error.status.should.equal(400);
        error.data.verified.should.equal(false);
        const {check} = error.data.checks[0];
        check.should.be.an('array');
        check.should.include.members(['credentialStatus', 'proof']);
      });
      it('MUST fail to verify a VC with invalid "credentialStatus.type"',
        async function() {
        // this tells the test report which cell
        // in the interop matrix the result goes in
          this.test.cell = {columnId: verifierName, rowId: this.test.title};
          const body = {
            verifiableCredential: invalidCredentialStatusType,
            options: {
              checks: ['proof', 'credentialStatus']
            }
          };
          const {result, error} = await verifier.verify({body});
          should.not.exist(result);
          should.exist(error);
          should.exist(error.data);
          // verifier returns 400
          error.status.should.equal(400);
          error.data.verified.should.equal(false);
        });
    });
  }
});
