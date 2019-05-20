
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

const CONSENSUS_THRESHOLD = 4
const AIRLINE_REQUIRED_FUND_AMOUNT = web3.utils.toWei('10', 'ether')

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) getRegisteredAirlineCount - first airline is registered`, async function () {

    // Get operating status
    let count = await config.flightSuretyData.getRegisteredAirlineCount.call();
    assert.equal(count, 1, "Incorrect count value of registered airline");

  });

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, config.firstAirline, {from: config.flightSuretyApp.address});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline, {from: config.flightSuretyApp.address}); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });
 
  it('(airline) fund first airline so it can register another airline', async () => {
   
    let resultBefore = await config.flightSuretyData.isAirlineRegisteredAndFunded(config.firstAirline, {from: config.flightSuretyApp.address})
    let isFirstAirlineRegistered = await config.flightSuretyData.isAirline(config.firstAirline, {from: config.flightSuretyApp.address})
    await config.flightSuretyApp.airlineAddFunding({value: AIRLINE_REQUIRED_FUND_AMOUNT, from: config.firstAirline})
    let resultAfter = await config.flightSuretyData.isAirlineRegisteredAndFunded(config.firstAirline, {from: config.flightSuretyApp.address})
    let airlineBalance = await config.flightSuretyData.getAirlineFundBalance({from: config.firstAirline})

    // ASSERT
    assert.equal(airlineBalance, AIRLINE_REQUIRED_FUND_AMOUNT, 'airlineBalance should equale to minFund as 1st airline paying fund')
    assert.equal(resultBefore, false, 'Airline is funded')
    assert.equal(isFirstAirlineRegistered, true, 'first airline did not register')
    assert.equal(resultAfter, true, 'Fail to pay fund for registered airline')


    // ARRANGE
    let newAirline = accounts[3];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, config.firstAirline, {from: config.flightSuretyApp.address});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline(newAirline, {from: config.flightSuretyApp.address}); 
 
    // ASSERT
    assert.equal(result, true, "Airline should be able to register another airline as it has provided funding");

  });


});
