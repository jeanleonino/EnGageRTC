import Ember from 'ember';

export default Ember.Route.extend({
  model: function(url) {
    let user = this.modelFor('application');

    return new Ember.RSVP.Promise(resolve => {
      this.store.findRecord('room', url.room).then(room => {
        // If the room instance was found at firebase, add oneself to the users
        room.get('users').addObject(user);
        // remember to remove the user when the connection is over
        room.ref().child('users').child(user.id).onDisconnect().remove();

        // Save the room into the server and proceed
        room.save().then(resolve);
      }, () => {
        // If no instance was found, create one.
        let room = this.store.createRecord('room', {
          id: url.room,
          users: [user],
        });
        // remember to clean-up the user when the connection is over
        room.ref().child('users').child(user.id).onDisconnect().remove();

        // Save the room with the additional user on it and proceed
        room.save().then(resolve);
      });
    });
  },

  setupController: function(controller, room) {
    controller.set('model', room);

    let oneself = this.modelFor('application');

    // Watch for any WebRTC signal received
    this.store.findRecord('user', oneself.id).then(user => {
      user.ref().child('signals').on('child_added', snapshot => {
        this.store.findRecord('signal', snapshot.key()).then(signal => controller.onSignal(signal));
      });
    });

    // get all users in the room and attempt to connect to each of them
    room.get('users').forEach(user => {
      // Do not attempt to connect to oneself
      if (oneself.id === user.id) {
        return;
      }

      // Start a WebRTC handshake to each user that is in the room
      controller.createPeer(user.id, {initiator: true});
    });
  },
});
