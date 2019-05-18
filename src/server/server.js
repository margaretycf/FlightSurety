import FlightSuretyData from "../../build/contracts/FlightSuretyData.json";
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

let key;
let airline;
let flight;
let timestamp;
let oracles = [];

var x;

let responses = [0, 10, 20, 20, 20, 30, 40, 50, 20, 20];

//let accounts = web3.eth.accounts;
web3.eth
  .getAccounts(async (error, accounts) => {
    //create 5 airlines for the dapp
    try {
      await flightSuretyApp.methods.airlineAddFunding().send({
        from: accounts[0],
        value: 10000000000000000000,
        gas: 3000000
      });
    } catch (e) {
      console.log(e);
    }
    try {
      await flightSuretyApp.methods
        .registerAirline(accounts[10])
        .send({
          from: accounts[0],
          gas: 3000000
        });
      await flightSuretyApp.methods.airlineAddFunding().send({
        from: accounts[10],
        value: 10000000000000000000,
        gas: 3000000
      });
    } catch (e) {
      console.log(e);
    }
    try {
      await flightSuretyApp.methods
        .registerAirline(accounts[11])
        .send({
          from: accounts[0],
          gas: 3000000
        });
      await flightSuretyApp.methods.airlineAddFunding().send({
        from: accounts[11],
        value: 10000000000000000000,
        gas: 3000000
      });
    } catch (e) {
      console.log(e);
    }

    /* oracles code */
    //create 20+ accounts
    for (var i = 1; i < 50; i++) {
      try {
        await flightSuretyApp.methods.registerOracle().send({
          from: accounts[i],
          value: 1000000000000000000,
          gas: 3000000
        });
      } catch (e) {}
      try {
        let result = await flightSuretyApp.methods.getMyIndexes().call({
          from: accounts[i]
        });
        console.log(
          `          Oracle #${i} Registered With Indexes: ${result[0]}, ${
            result[1]
          }, ${result[2]}`
        );
        oracles.push({
          address: accounts[i],
          index1: result[0],
          index2: result[1],
          index3: result[2]
        });
      } catch (e) {}
    }

    //watch events give semi random response status
    try {
      flightSuretyApp.events.OracleRequest(
        {
          fromBlock: "latest"
        },
        async function(err, request) {
          if (err) {
            console.log("e3 ");
          }
          console.log(request.returnValues);
          key = request.returnValues.index;
          airline = request.returnValues.airline;
          flight = request.returnValues.flight;
          timestamp = request.returnValues.timestamp;

          for (var i = 0; i < oracles.length; i++) {
            if (
              oracles[i].index1 == key ||
              oracles[i].index2 == key ||
              oracles[i].index3 == key
            ) {
              x = Math.floor(Math.random() * 10);

              try {
                flightSuretyApp.methods
                  .submitOracleResponse(
                    key,
                    airline,
                    flight,
                    timestamp,
                    responses[x]
                  )
                  .send({
                    from: accounts[i],
                    gas: 3000000
                  })
                  .catch(res => {
                    //console.log("e4");
                  });
                console.log(key + " " + airline + " " + flight + " " + timestamp + " " + responses[x]);
              } catch (e) {
                //console.log("e3");
              }
            }
          }
        }
      );
    } catch (e) {
      //onsole.log("e2");
    }
  })
  .catch(res => {
    //console.log("e1");
  });
//console.log(test);




// flightSuretyApp.events.OracleRequest({
//     fromBlock: 0
//   }, function (error, event) {
//     if (error) console.log(error)
//     console.log(event)
// });

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


