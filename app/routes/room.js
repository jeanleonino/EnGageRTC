import Ember from 'ember';

export default Ember.Route.extend({
  model: function(url) {
    let user = this.modelFor('application');

    let room = this.store.findRecord('room', url.room).then(room => {
      // If the room instance was found at firebase, add oneself to the users
      room.get('users').addObject(user);
      // remember to remove the user when the connection is over
      room.ref().child('users').child(user.id).onDisconnect().remove();
      room.save();
    }, () => {
      // If no instance was found, create one.
      room = this.store.createRecord('room', {
        id: url.room,
        users: [user],
      });
      // remember to clean-up the user when the connection is over
      room.ref().child('users').child(user.id).onDisconnect().remove();

      room.save();
    });

    return room;
  },
});
