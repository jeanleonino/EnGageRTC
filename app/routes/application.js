import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    // assigning the username to a random string for now
    let username = Math.random().toString(32).split('.')[1];

    // TODO Use Firebase Auth User
    let user = this.store.createRecord('user', {
      id: username,
      username: username,
    });

    // Remove this user when firebase connection is over
    user.ref().onDisconnect().remove();
    // Push the new user to firebase
    user.save();

    return user;
  },
});
