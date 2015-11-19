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

    // Ensure application is continued solely when user is on firebase
    return new Ember.RSVP.Promise(resolve => {
      // Push the new user to firebase and proceed
      user.save().then(resolve);
    });
  },
});
