  // need to connect to the G-BAT network
  var me = {
      id: 100,
      name: 'Operator Control Unit'
  };

  var systemCommander = {
      id: 40,
      name: 'System Commander'
  };

  var systemTree = [me];


  var socket = io('http://146.64.244.203:3000');

  socket.on('connect', function() {
      console.log(socket.id); // 'G5p5...'
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
  });

  $('#load').bind('click', function() {

      var missionInfo = {
          from: 'OCU',
          to: 'Mission Spooler',
          id: 001,
          name: 'Battle of Troy',
          destination: {
              X: 8,
              y: -13,
              r: 2.5
          },
          map: {
              rows: 16,
              columns: 16,
              gridSize: 32.2,
              traversability: {}
          }

      };
      var nodeInfo = {
          messageID: '0E00h',
          sender: me,
          recipient: systemCommander,
          data: missionInfo,
          sequenceNo: 1
      };
      socket.emit('0E00h', nodeInfo, (ack) => {
          if (ack.recipient === 'undefined') {
              console.log('recipient node did not respond!');
          } else {
              // 3.5 getting the acknowledgement and logging it to console
              console.log('\n\n ack :->  ', JSON.stringify(ack, null, 4));
          }
      });
      console.log('Load the mission info => ', JSON.stringify(nodeInfo.data, null, 4));
      // scoket
  })
  $('#start').bind('click', function() {
      var nodeInfo = {
          messageID: '0E01h',
          sender: me,
          recipient: systemCommander,
          data: {
              id: 001,
              name: 'Battle of Troy'
          },
          sequenceNo: 1
      }
      console.log('load the mission');
      socket.emit('0E01h', nodeInfo);
  })

  $('#stop').bind('click', function() {
      var nodeInfo = {
          messageID: '0E02h',
          sender: me,
          recipient: systemCommander,
          data: {
              id: 001,
              name: 'Battle of Troy'
          },
          sequenceNo: 1
      }
      console.log('stop the mission');
      socket.emit('0E02h', nodeInfo);
  })
  $('#pause').bind('click', function(e) {
      var nodeInfo = {
          messageID: '0E03h',
          sender: me,
          recipient: systemCommander,
          data: {
              id: 001,
              name: 'Battle of Troy'
          },
          sequenceNo: 1
      }
      console.log('pause the mission', e.timeStamp);
      socket.emit('0E03h', nodeInfo);
  })

  $('#resume').bind('click', function() {
      var nodeInfo = {
          messageID: '0E04h',
          sender: me,
          recipient: systemCommander,
          data: {
              id: 001,
              name: 'Battle of Troy'
          },
          sequenceNo: 1
      }
      console.log('resume the mission');
      socket.emit('0E04h', nodeInfo);
  })

  $('#manual').bind('click', function() {
      var nodeInfo = {
          messageID: '0E06h',
          sender: me,
          recipient: systemCommander,
          data: 'Manual',
          sequenceNo: 1
      }
      console.log('manual the mission');
      socket.emit('0E06h', nodeInfo);
  })