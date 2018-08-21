/*  File name : world-model.js
   ===============================================================================================
	Component ID = 61
	Function : gets all the data from subsytem components and integrates them into a single data object that is sent to the vehicle driver

    It is implemented in Node.js as a socket-io clients  connecting to a server 
    running on the communicator node.
    Author : Perseverance Mbewe 
    Project : G-Bat Autonomous Navigation System
    Date  : 19-Jan-2017 - 2018 

================================================================================================ */

const model = require('./models/atn_models');
const world_model_schema = model.world_model;
const moment = require('moment');
const io = require('socket.io-client');
const socket = io.connect('http://localhost:3000', { reconnect: true });  // replaced the ip address 

var me = {
    id: 61,
    name: 'Vector Knowledge Store' // World Model 
};


//==================================================================================================================
//                                         1. Connecting to the G-Bat Network
//==================================================================================================================
socket.on('connect', () => { // begining of the connection estalished block of code
    // display a message on the console
    console.log('\n\n => Connection to the G-Bat Network has been established!!\n\n');
    // console.log(sensorIo);

    socket.on('register', (regData, identify) => {
        identify(me);
    });

    socket.on('registration', (regInfo) => {
        console.log(`\n => A ${regInfo.name} has connected to the G-Bat Network!`);
    });

    socket.on('deregistration', (regInfo) => {
        console.log(`\n => A ${regInfo.name} has disconnected from the G-Bat Network!`);
    });

    socket.on('systemUpdate', (update) => {

        systemTree = update;
        console.log('\n\n => Connected Nodes: ', JSON.stringify(systemTree, null, 4));

    });



    // Hanling disconnection
    //----------------------
    socket.on('disconnect', () => {
        console.log('Connection to the G-Bat network has been terminated!');
    });

     //=========================================================================================================
    //                  2.3 Query Vector Knowledge Store Object : Message ID : 2A23h
    //=========================================================================================================


    socket.on('2A23h', (nodeInfo) => {//
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of ${me.name} Object received  from ${nodeInfo.sender.name}!`);

        // get Map data from the subsystem commander and format 
        nodeInfo.messageID = '4A23h';
        nodeInfo.recipient = 'Path Planner';
        nodeInfo.sender = me;
        nodeInfoTimeStamp = Date.now();
        nodeInfo.sequenceNo = 1; // idealyy the sequence needs to be updated for each mission
        nodeInfo.data[0].location = {"x":4,"y":-2,"r":4.5}
        
        console.log('getting the map...',nodeInfo);
         // we need to continually updating the map  - first we need to get  location, then traversability and obstacles
        socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
            console.log('sending Message to Path Planner');
        });
        // case 1 
       
       // socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
         //   console.log('-> sending to path planner');
       // });
        // case  2  : update map using 0 and 1  -- can't continue wating for antonius
        // pass the data to the planner 
        

        // check the planner on the system Tree 
         // fusion needs to happen here  - this is the first segment sent to the driver
      //  console.log('sentTo', sentTo);
      //  console.log('About to send data to', sentTo[0].name)
        /*socket.emit('4A23h', nodeInfo, (ack) => {
            console.log('Sending data to local path segment driver',nodeInfo);
        }); */

     /*  world_model_schema.find().exec(function (err, results) {
             // getting the data from the database  - need to fix this  - need to get the data from OCU object 
             // - idealy query the data by id which comes from the OCU
             // we would know which mission to start 
            console.log('these are the results', results);

            if (err) {
                nodeInfo.data = err;
                socket.emit(nodeInfo.messageID, nodeInfo, (ack) => {
                    console.log('failed to retreve data', err);
                }); // emit error
            } else {

                // add other properties, not stored in the database
                results.time_stamp = Date.now();
                results.speed = 20;
                results.from = 'worldModel';
                results.to = 'Planner';
                results.current_position = { 'x': 53, 'y': -10, 'theta': 23.5 };
                nodeInfo.data = results;
                //console.log('\n\n => this is result', results);
                console.log(`\null => sending Vector Knowledge Store 0ject to ${nodeInfo.recipient.name}...`);
               
            }


        }); 
    */

    });//

    //==================================================================================================================
    //                                         1. Handling of Oparator Control  requests  - Revised (Perseverance Mbewe)
    //==================================================================================================================

     // stoping the mission 
    socket.on('0E01h',(nodeInfo)=>{
        console.log(`${me.name} starting the mission` `${nodeInfo.sender.name}`)
        // at this current stage we only getting a request to start a mission which has been created

    })




    // Mission complete  - or mission stoped
    socket.on('0E02h', (nodeInfo) => {
        console.log("World Model is requesting  to stop Mission", nodeInfo.data.name)
        // pass the message to the reflex driver to abort the mission
        // no implementation yet 
    });


    // *****************************************
    // 1. Vector Knowlede Store Oblect Creation
    // *****************************************


    //=========================================================================================================
    //          1.1 Set Vector Knowledge Store Feature Class Metadata:: Message ID : 0A21h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4400h => acknowledga Vector Knowledge Store Object Creation
    //






    socket.on('0A20h', (nodeInfo) => {
        var FCM = nodeInfo.data;
        nodeInfo.messageID = '4400h';
        nodeInfo.data = 'success'; // ideally update with status
        nodeInfo.sequenceNo = 1;
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        console.log('\n\n => Setting Vector Knowledge Store Feature Class Metadata...\n\n');
        socket.emit('4400h', nodeInfo, (ack) => {
            console.log(JSON.stringify(ack, null, 4));
        }); // emit e


    });



    //=========================================================================================================
    //          1.2 Create Vector Knowledge Store 0bject: Message ID : 0A21h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4A24h => Report Data Transfer Terminated
    //
    socket.on('0A21h', (nodeInfo) => {
        var VKO = nodeInfo.data;;
        console.log(`\n\n =>  Request to create object received  from ${nodeInfo.sender.name}!`);
        nodeInfo.messageID = '4400h';
        nodeInfo.data = 'success'; // ideally update with status
        nodeInfo.sequenceNo = 1;
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        console.log('\n\n => Creating Vector Knowledge Store Object...\n\n');
        socket.emit('4400h', nodeInfo, (ack) => {
            console.log(JSON.stringify(ack, null, 4));
        }); // emit e


    });

    //=========================================================================================================
    //              1.3 Delete Vector Knowledge Store 0bject: Message ID : 0A24h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4A24h => Report Data Transfer Terminated
    //
    socket.on('0A24h', (nodeInfo) => {
        var VKO = nodeInfo.data;;
        console.log(`\n\n =>  Request to delete object received  from ${nodeInfo.sender.name}!`);
        nodeInfo.messageID = '4400h';
        nodeInfo.data = 'success'; // ideally update with status
        nodeInfo.sequenceNo = 1;
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        console.log('\n\n => deleting Vector Knowledge Store Object...\n\n');
        socket.emit('4400h', nodeInfo, (ack) => {
            console.log(JSON.stringify(ack, null, 4));
        }); // emit e

    });



    //  ***********************************************
    // 2. Vector Knowlede Store Queries and reporting
    // ************************************************


    //=========================================================================================================
    //         2.1 Query Vector Knowledge Store Feature class metadata: Message ID : 2A21h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4A21h => Report Vector Knowledge Store Feature class 
    // metadata
    socket.on('2A21h', (nodeInfo) => {
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of Vector Knowledge Store Feature class metadata received  from ${nodeInfo.sender.name}!`);
        console.log(`\null => sending Vector Knowledge Store Feature class metadata to ${nodeInfo.sender.name}...`);

        // get Global Pose data from hardware. Here we use dummy data    
        var FCM = {
            "Timestamp": Date.now(),
            "metadata": "something"
        };
        // Format the packet to send  
        nodeInfo.messageID = '4A21h';
        nodeInfo.data = FCM;
        nodeInfo.sequenceNo = 1;
        // send the response -> this block of code must be in a function   
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        socket.emit(nodeInfo.messageID, nodeInfo, (ack) => { //socket io emit block
            if (ack.recipient === 'undefined') {
                console.log('recipient node did not respond!');
            } else {

                console.log('\n\n => ack :->  ', JSON.stringify(ack, null, 4));
            }
        });//end of socket io emit block
    });


    //=========================================================================================================
    //              2.2 Query Vector Knowledge Store bounds: Message ID : 2A22h
    //=========================================================================================================
    //  
    // The response to this message is the message ID : 4A20h => Report Vector Knowledge Store Object Creation
    //
    socket.on('2A20h', (nodeInfo) => {
        // log to console -> can also log to file
        console.log(`\n\n =>  Query of Vector Knowledge Store bounds received  from ${nodeInfo.sender.name}!`);
        console.log(`\null => sending Vector Knowledge Store bounds data to ${nodeInfo.sender.name}...`);

        // get Global Pose data from hardware. Here we use dummy data    
        var FCM = {
            "Timestamp": Date.now(),
            "metadata": "something"
        };
        // Format the packet to send  
        nodeInfo.messageID = '4A20h';
        nodeInfo.data = FCM;
        nodeInfo.sequenceNo = 1;
        // send the response -> this block of code must be in a function   
        nodeInfo.recipient = nodeInfo.sender;
        nodeInfo.sender = me;
        nodeInfo.timeStamp = Date.now();
        socket.emit(nodeInfo.messageID, nodeInfo, (ack) => { //socket io emit block
            if (ack.recipient === 'undefined') {
                console.log('recipient node did not respond!');
            } else {

                console.log('\n\n => ack :->  ', JSON.stringify(ack, null, 4));
            }
        });//end of socket io emit block
    });


   

});

