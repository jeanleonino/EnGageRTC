import Ember from 'ember';
import Peer from 'npm:simple-peer';

export default Ember.Controller.extend({
  // Holds all user's peers
  peers: {},

  // Holds the connected peer keys
  connected: [],

  application: Ember.inject.controller('application'),

  // The chat message log
  chat: [],

  /* Send the given data to all connected peers
   *
   * @param data - data that needs to be transmitted
   */
  sendData: function(data) {
    this.get('connected').forEach(function(key) {
      this.peers[key].send(data);
    }, this);
  },

  /*
   * WebRTC Hooks
   */

  /* Called when a Peer connect to this instance
   *
   * @param {String} id The id of the peer that just connected
   */
  onConnect: function(id) {
    this.get('connected').addObject(id);
    console.info('connected to', id);
  },

  /* Called when a Peer disconnect to this instance
   *
   * @param {String} id The id of the peer that just disconnected
   */
  onDisconnect: function(id) {
    // Remove the peer from the peer's list
    this.set('peers.' + id, undefined);
    this.get('connected').removeObject(id);
    delete this.peers[id];
    console.info('disconnected to', id);
  },

  /* Called when data is received from another peer
   *
   * @param data Any data that was sent via `sendData`
   */
  onData: function(data) {
    this.chat.addObject(data);
  },

  /*
   * WebRTC Setup
   */

  /* Called when this peer is receiving a signal
   *
   * Signals play an important role in WebRTC communication, they will perform
   * the basic handshake between two given peers.
   *
   * We're using firebase properly performa signalling, so a hook is attached
   * to the `user.signals` attribute, that ultimately ends up on this callback.
   *
   * @param {Object} signal the remote signal data
   */
  onSignal: function(signal) {
    // If the signal is a falsy value, ignore it
    if (!signal) {
      return;
    }

    // Retrieve signal information
    let from = signal.get('from');
    let data = JSON.parse(signal.get('info'));
    // then delete the signal
    signal.deleteRecord();

    // "push" the deleted signal to the server
    signal.save().then(() => {
      let peer = this.get('peers.' + from);
      if (peer) {
        // if the peer already exists accept its offer
        peer.signal(data);
        return;
      }

      // if it does not exist, create it and accept its offer
      peer = this.createPeer(from);
      peer.signal(data);
    });
  },

  /* Create a Peer instance and connects all hooks to this controller
   *
   * @param {String} userId The Id of the remote user we're trying to connect to.
   * @param {Object} options Any `simple-peer` related options
   */
  createPeer: function(userId, options) {
    // Create the peer and set it in this controller
    let peer = new Peer(options);
    this.set('peers.' + userId, peer);

    // Connect any peer data related hooks
    peer.on('connect', () => this.onConnect(userId));
    peer.on('close', () => this.onDisconnect(userId));
    peer.on('data', data => this.onData(data));

    // When the peer is generating signals...
    peer.on('signal', data => {
      // Create a signal on firebase
      this.store.createRecord('signal', {
        from: this.get('application.model').id,
        info: JSON.stringify(data),
      }).save().then(signal => {
        // Set any possible disconnection cleanup hooks
        signal.ref().onDisconnect().remove();

        // Then delegate the signal to the remote peer signals array
        this.store.findRecord('user', userId).then(user => {
          user.ref().child('signals').child(signal.id).push(signal.toJSON());
        });
      });
    });

    return peer;
  },

  actions: {

    /* Send a message to all the connected peers */
    submit: function() {
      // Retrieve all data that will be sent
      let message = {
        type: 'message',
        user: this.get('application.model').id,
        data: this.get('message'),
      };

      // Send the data, add it to it's own chat array, and cleanup the input
      this.sendData(message);
      this.chat.addObject(message);
      this.set('message', '');
    },
  },
});
